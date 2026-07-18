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
        propertiesContext = "Aquí tienes el inventario actual de propiedades de HAVN PropTech:\n";
        context.properties.forEach((p: any) => {
          propertiesContext += `- **${p.title || p.name}**: Tipo/Tag: ${p.tag || "N/A"}, Precio: ${p.price || "N/A"}, Ubicación: ${p.location || "N/A"}, Recámaras: ${p.bedrooms || p.rooms || "N/A"}, Baños: ${p.bathrooms || p.baths || "N/A"}, Área: ${p.area || "N/A"}\n`;
        });
      }

      const systemInstruction = `Eres HAVN Bot, el asistente virtual oficial de HAVN PropTech, una inmobiliaria y plataforma de tecnología de vanguardia en México.
Tu objetivo es ayudar a los usuarios que navegan por el sitio web a resolver dudas sobre HAVN, las propiedades disponibles, los servicios de financiamiento o el proceso de venta/renta.

Información sobre HAVN PropTech:
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

      // Translate message history to Gemini API format
      const formattedHistory = messages.slice(0, -1).map((m: any) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }]
      }));

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
