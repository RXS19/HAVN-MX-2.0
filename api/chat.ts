import { GoogleGenAI } from "@google/genai";
import type { VercelRequest, VercelResponse } from "@vercel/node";

// In-memory rate limiting map
interface RateLimitInfo {
  count: number;
  resetTime: number;
}
const rateLimitMap = new Map<string, RateLimitInfo>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 15; // 15 requests per minute

// Allowed origins
const ALLOWED_ORIGINS = [
  "https://havn.mx",
  "https://www.havn.mx"
];

function isOriginAllowed(origin: string | undefined): boolean {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  // Match *.vercel.app (including subdomains)
  if (/^https:\/\/([a-zA-Z0-9-]+\.)*vercel\.app$/.test(origin)) {
    return true;
  }
  return false;
}

// Lazy load Gemini Client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is missing from environment variables");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build-vercel",
        },
      },
    });
  }
  return aiClient;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. Setup Security & CORS Headers
  const origin = req.headers.origin as string | undefined;
  
  if (origin && isOriginAllowed(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  } else if (!origin) {
    // If there is no origin (same origin), that's also allowed
    res.setHeader("Access-Control-Allow-Origin", "*");
  }
  
  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  // Enforce POST method
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  // 2. Add OWASP recommended security headers
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  res.setHeader("Content-Security-Policy", "default-src 'self'; frame-ancestors 'self';");

  // 3. Rate Limiting by IP
  const ip = (req.headers["x-forwarded-for"] as string) || 
             (req.headers["x-real-ip"] as string) || 
             req.socket.remoteAddress || 
             "anonymous";
             
  const now = Date.now();
  const rateInfo = rateLimitMap.get(ip);
  
  if (!rateInfo) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
  } else if (now > rateInfo.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
  } else if (rateInfo.count >= RATE_LIMIT_MAX_REQUESTS) {
    res.status(429).json({ error: "Demasiadas solicitudes. Por favor, intenta más tarde." });
    return;
  } else {
    rateInfo.count += 1;
  }

  try {
    // 4. Payload Size Limit Validation
    const bodyStr = JSON.stringify(req.body || {});
    if (bodyStr.length > 100 * 1024) { // 100 KB
      res.status(400).json({ error: "Payload too large" });
      return;
    }

    const { messages, context } = req.body || {};

    // 5. Input Validation
    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ error: "Faltan los mensajes o el formato es incorrecto." });
      return;
    }

    // Validate max amount of messages
    if (messages.length > 50) {
      res.status(400).json({ error: "Historial de conversación demasiado largo." });
      return;
    }

    // Validate each message structure and lengths
    for (const msg of messages) {
      if (!msg || typeof msg !== "object") {
        res.status(400).json({ error: "Mensaje inválido." });
        return;
      }
      if (msg.role !== "user" && msg.role !== "assistant") {
        res.status(400).json({ error: "Rol de mensaje inválido." });
        return;
      }
      if (typeof msg.content !== "string") {
        res.status(400).json({ error: "El contenido del mensaje debe ser texto." });
        return;
      }
      // Max length per message: 4000 chars
      if (msg.content.length > 4000) {
        res.status(400).json({ error: "Mensaje excede la longitud máxima permitida." });
        return;
      }
    }

    // 6. Build Properties Context
    let propertiesContext = "";
    if (context && context.properties && Array.isArray(context.properties)) {
      propertiesContext = "Aquí tienes el inventario actual de propiedades de HAVN:\n";
      context.properties.forEach((p: any) => {
        propertiesContext += `- **${p.title || p.name}**: Tipo/Tag: ${p.tag || "N/A"}, Precio: ${p.price || "N/A"}, Ubicación: ${p.location || "N/A"}, Recámaras: ${p.bedrooms || p.rooms || "N/A"}, Baños: ${p.bathrooms || p.baths || "N/A"}, Área: ${p.area || "N/A"}\n`;
      });
    }

    const systemInstruction = `Eres Dave, el asesor digital oficial de HAVN, una inmobiliaria y plataforma de tecnología de vanguardia en México.
Tu objetivo es ayudar a los usuarios que navegan por el sitio web a resolver dudas sobre HAVN, las propiedades disponibles, o nuestros productos exclusivos de inversión y vivienda como HAVN Flip y HAVN Premier.

Información sobre HAVN y sus productos:
- HAVN facilita la compra, venta e inversión en inmuebles con tecnología, transparencia y sin burocracia.
- **HAVN Flip**: Nuestro modelo inteligente de inversión y renovación. Adquirimos propiedades en ubicaciones clave con potencial de revalorización, las transformamos con diseño contemporáneo y remodelaciones de alto nivel, y las reintroducimos al mercado.
- **HAVN Premier**: Nuestra colección de propiedades exclusivas seleccionadas bajo los más altos estándares de arquitectura, ubicación y plusvalía, superando los $5,000,000 MXN.
- Nos enfocamos en propiedades de alta calidad (desde lofts modernos hasta residencias de lujo).

${propertiesContext}

Instrucciones de comportamiento:
1. Sé extremadamente servicial, amable, profesional y claro en español. Tu nombre es Dave y siempre debes presentarte/identificarte como Dave, tu Asesor Digital.
2. Debes referirte a la marca únicamente como HAVN (nunca "HAVN PropTech" ni otros términos).
3. No hables de financiamiento (como créditos hipotecarios o HAVN Crédito / HAVN Capital) a menos que sea necesario o se te pregunte específicamente, enfocándote en lugar de ello en HAVN Flip y HAVN Premier.
4. Usa viñetas o negritas para estructurar tu respuesta de forma atractiva.
5. Si te preguntan por propiedades específicas, recomiéndales opciones basadas en el inventario provisto que se ajusten a su presupuesto o ubicación.
6. Mantén tus respuestas concisas pero completas. No generes respuestas excesivamente largas.
7. Si no sabes la respuesta o es algo muy específico que requiere atención humana, invítalos a dejar sus datos en el formulario de contacto del sitio web.`;

    // Translate message history to Gemini API format
    const formattedHistory = messages.slice(0, -1).map((m: any) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }]
    }));

    const latestMessage = messages[messages.length - 1]?.content || "";

    // 7. Get Gemini client and generate response
    const ai = getGeminiClient();
    const chat = ai.chats.create({
      model: "gemini-3.5-flash",
      config: {
        systemInstruction,
      },
      history: formattedHistory,
    });

    const response = await chat.sendMessage({ message: latestMessage });
    res.status(200).json({ text: response.text });
  } catch (error: any) {
    // 8. Log internal error ONLY on server side. NEVER expose secrets or details to client.
    console.error("Error internally processing /api/chat:", error);
    res.status(500).json({ error: "Ocurrió un error al procesar tu solicitud. Por favor, intenta de nuevo." });
  }
}
