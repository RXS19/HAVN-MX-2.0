import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // CORS middleware: Enable cross-origin resource sharing to prevent blocks on mobile devices, iframes, and alternative domains
  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") {
      res.sendStatus(200);
      return;
    }
    next();
  });

  // Initialize Gemini lazily to avoid crashing on startup if GEMINI_API_KEY is not defined yet
  let aiClient: GoogleGenAI | null = null;
  function getGeminiClient(): GoogleGenAI {
    if (!aiClient) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not set. Please configure it in Settings > Secrets.");
      }
      aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
    return aiClient;
  }

  // API route for chatbot
  app.post("/api/chat", async (req, res) => {
    try {
      const { messages, context } = req.body;
      if (!messages || !Array.isArray(messages)) {
        res.status(400).json({ error: "Invalid request payload" });
        return;
      }

      // Format properties context
      let propertiesContext = "";
      if (context && context.properties && Array.isArray(context.properties)) {
        propertiesContext = "Aquí tienes el inventario actual de propiedades de HAVN:\n";
        context.properties.forEach((p: any) => {
          propertiesContext += `- **${p.title || p.name}**: Tipo/Tag: ${p.tag || "N/A"}, Precio: ${p.price || "N/A"}, Ubicación: ${p.location || "N/A"}, Recámaras: ${p.bedrooms || p.rooms || "N/A"}, Baños: ${p.bathrooms || p.baths || "N/A"}, Área: ${p.area || "N/A"}\n`;
        });
      }

      const systemInstruction = `Eres Dave, el asistente virtual oficial de HAVN, una inmobiliaria y plataforma de tecnología de vanguardia en México.
Tu objetivo es ayudar a los usuarios que navegan por el sitio web a resolver dudas sobre HAVN, las propiedades disponibles, los servicios de financiamiento o el proceso de venta/renta.

Información sobre HAVN:
- HAVN facilita la compra, venta y financiamiento de inmuebles con tecnología, transparencia y sin burocracia.
- Ofrecemos servicios financieros como "HAVN Capital" (adelanto de efectivo/liquidez de tu casa actual) y "HAVN Crédito" (asesoría hipotecaria sin costo).
- Nos enfocamos en propiedades de alta calidad (desde lofts modernos hasta residencias exclusivas).

${propertiesContext}

Instrucciones de comportamiento:
1. Sé extremadamente servicial, amable, profesional y claro en español.
2. Usa viñetas o negritas para estructurar tu respuesta de forma atractiva.
3. Si te preguntan por propiedades específicas, recomiéndales opciones basadas en el inventario provisto que se ajusten a su presupuesto o ubicación.
4. Mantén tus respuestas concisas pero completas. No generes respuestas excesivamente largas.
5. Si no sabes la respuesta o es algo muy específico que requiere atención humana, invítalos a dejar sus datos en el formulario de contacto del sitio web.`;

      // Translate message history to Gemini API format.
      // We must ensure the history starts with a 'user' turn and strictly alternates.
      // The initial assistant greeting must be filtered out as history starts with 'user'.
      let historyMessages = messages.slice(0, -1);
      
      const firstUserIdx = historyMessages.findIndex((m: any) => m.role === "user");
      if (firstUserIdx !== -1) {
        historyMessages = historyMessages.slice(firstUserIdx);
      } else {
        historyMessages = [];
      }

      // Filter to ensure strictly alternating turns
      const formattedHistory: any[] = [];
      let lastRole: string | null = null;
      for (const m of historyMessages) {
        const currentRole = m.role === "assistant" ? "model" : "user";
        if (currentRole !== lastRole) {
          formattedHistory.push({
            role: currentRole,
            parts: [{ text: m.content }]
          });
          lastRole = currentRole;
        }
      }

      // Ensure the history ends with 'model' (or is empty), so the latest 'user' message alternates correctly
      if (formattedHistory.length > 0 && formattedHistory[formattedHistory.length - 1].role === "user") {
        formattedHistory.pop();
      }

      const latestMessage = messages[messages.length - 1]?.content || "";

      const ai = getGeminiClient();
      const chat = ai.chats.create({
        model: "gemini-3.5-flash",
        config: {
          systemInstruction,
        },
        history: formattedHistory,
      });

      const response = await chat.sendMessage({ message: latestMessage });
      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Error in /api/chat:", error);
      res.status(500).json({ error: error.message || "Error al procesar la solicitud con Gemini" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
