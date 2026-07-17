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

  // Smart fallback response generator for offline, missing key, or rate-limited scenarios
  function generateSmartFallbackResponse(userMessage: string, properties: any[]): string {
    const msg = (userMessage || "").toLowerCase();
    
    // 1. Capital / Liquidez
    if (msg.includes("capital") || msg.includes("liquidez") || msg.includes("adelanto") || msg.includes("adelantar") || msg.includes("vender rápido")) {
      return `**HAVN Capital** es nuestro servicio financiero estrella para propietarios que buscan comprar su siguiente casa sin esperar a vender la actual. 
  
  🏠 **¿Cómo funciona?**
  - Evaluamos tu propiedad actual de manera digital.
  - Te adelantamos hasta el **60% del valor de tu casa en efectivo** para que des el enganche o pagues la nueva de contado.
  - Nosotros nos encargamos de comercializar y vender tu propiedad actual con nuestro equipo de expertos en menos de 90 días.
  - Todo el proceso es digital, transparente y sin burocracia bancaria.
  
  ¿Te gustaría que un especialista de HAVN Capital te contacte hoy mismo? Puedes dejar tus datos en nuestro formulario de contacto. 📈`;
    }
    
    // 2. Crédito / Financiamiento / Simulador / Hipoteca / Banco
    if (msg.includes("credito") || msg.includes("crédito") || msg.includes("financiamiento") || msg.includes("simulador") || msg.includes("hipotecario") || msg.includes("hipoteca") || msg.includes("banco") || msg.includes("tasa")) {
      return `En **HAVN** facilitamos tu financiamiento inmobiliario a través de nuestro servicio **HAVN Crédito**. 
  
  En lugar de que vayas de banco en banco, nosotros hacemos todo el trabajo pesado por ti sin costo adicional:
  
  📊 **Lo que te ofrecemos:**
  - **Asesoría hipotecaria gratuita** con expertos certificados.
  - Comparamos las ofertas de todos los bancos en México (Santander, Banorte, HSBC, Scotiabank, etc.) para conseguirte la **tasa de interés más baja**.
  - Gestión y aprobación digital de tu crédito en menos de 48 horas.
  - Te ayudamos a estructurar tu esquema de pagos usando nuestro *Simulador Financiero* (disponible en la sección de Financiamiento de nuestra página).
  
  ¡Prueba el simulador en esta misma pantalla o déjanos un mensaje para pre-aprobar tu crédito! 💳✨`;
    }
    
    // 3. Havn Flip / Flipping / Remodelación / Inversión
    if (msg.includes("flip") || msg.includes("remodela") || msg.includes("remodelación") || msg.includes("remodelacion") || msg.includes("invertir") || msg.includes("inversión") || msg.includes("inversion")) {
      return `**HAVN Flip** es nuestro innovador modelo de renovación residencial inteligente.
  
  🔨 **¿En qué consiste?**
  - Compramos propiedades con alto potencial arquitectónico en zonas de alta plusvalía de la CDMX.
  - Realizamos un diseño de autor y remodelación integral premium (reemplazando instalaciones, acabados de lujo, iluminación inteligente).
  - Ofrecemos estas propiedades listas para habitar (*Ready-to-move-in*) con garantía total, eliminando los riesgos típicos de una obra.
  - **Para inversionistas**: Ofrecemos esquemas de coinversión con rendimientos sumamente competitivos respaldados por activos inmobiliarios tangibles.
  
  ¡Es el estándar de oro de la renovación! ¿Te gustaría agendar una llamada con nuestro equipo de desarrollo? 🛠️💎`;
    }
  
    // 4. Contacto / Dirección / Teléfono / Correo / Oficinas
    if (msg.includes("contacto") || msg.includes("telefono") || msg.includes("teléfono") || msg.includes("correo") || msg.includes("email") || msg.includes("direccion") || msg.includes("dirección") || msg.includes("donde estan") || msg.includes("dónde están") || msg.includes("oficina")) {
      return `¡Con gusto! Aquí tienes los datos oficiales de contacto de **HAVN**:
  
  📍 **Oficinas Corporativas:** Campos Elíseos 120, Polanco IV Sección, Miguel Hidalgo, CDMX, C.P. 11560.
  📞 **Teléfono de Atención:** +52 55 8421 9920
  ✉️ **Correo Electrónico:** privado@havn.mx
  🌐 **Horario de Atención:** Lunes a Viernes de 9:00 AM a 6:00 PM.
  
  Si deseas que un asesor especializado te llame, por favor llena el formulario de contacto que se encuentra al final de esta página y te responderemos en minutos. 🤝`;
    }
  
    // 5. Propiedades / Casas / Buscar / Renta / Venta / Qué tienen
    if (msg.includes("propiedad") || msg.includes("propiedades") || msg.includes("casa") || msg.includes("departamento") || msg.includes("renta") || msg.includes("venta") || msg.includes("precio") || msg.includes("inventario") || msg.includes("disponibles") || msg.includes("tienen") || msg.includes("polanco") || msg.includes("lomas") || msg.includes("roma") || msg.includes("condesa")) {
      let filtered = properties || [];
      
      const isRenta = msg.includes("renta");
      const isVenta = msg.includes("venta");
      const isPolanco = msg.includes("polanco");
      const isRoma = msg.includes("roma");
      const isCondesa = msg.includes("condesa");
      const isDelValle = msg.includes("valle");
  
      if (isRenta) {
        filtered = filtered.filter(p => (p.tag || "").toLowerCase().includes("renta"));
      } else if (isVenta) {
        filtered = filtered.filter(p => (p.tag || "").toLowerCase().includes("venta") || (p.tag || "").toLowerCase().includes("destacada"));
      }
  
      if (isPolanco) {
        filtered = filtered.filter(p => (p.location || "").toLowerCase().includes("polanco"));
      } else if (isRoma) {
        filtered = filtered.filter(p => (p.location || "").toLowerCase().includes("roma"));
      } else if (isCondesa) {
        filtered = filtered.filter(p => (p.location || "").toLowerCase().includes("condesa"));
      } else if (isDelValle) {
        filtered = filtered.filter(p => (p.location || "").toLowerCase().includes("valle"));
      }
  
      const displayProps = filtered.slice(0, 3);
      
      if (displayProps.length > 0) {
        let propListText = `¡Por supuesto! He seleccionado estas excelentes opciones de nuestro catálogo actual que podrían interesarte:\n\n`;
        displayProps.forEach(p => {
          const tagIcon = (p.tag || "").toLowerCase().includes("renta") ? "🔑" : "💎";
          propListText += `${tagIcon} **${p.title}**\n`;
          propListText += `   - **Precio:** ${p.price}\n`;
          propListText += `   - **Ubicación:** ${p.location}\n`;
          propListText += `   - **Características:** ${p.beds || p.bedrooms || "N/A"} Recs. | ${p.baths || p.bathrooms || "N/A"} Baños | ${p.sqm || p.area || "N/A"} m²\n`;
          if (p.tag) propListText += `   - **Etiqueta:** ${p.tag}\n`;
          propListText += `\n`;
        });
        propListText += `Puedes dar clic en el botón de ver detalle en cualquiera de estas propiedades en la página principal para conocer su galería fotográfica y tour 3D interactivo. 🏠✨`;
        return propListText;
      } else {
        const generalProps = (properties || []).slice(0, 3);
        let propListText = `Actualmente contamos con un catálogo exclusivo de propiedades en las mejores zonas de la CDMX (Polanco, Roma, Condesa, Bosques de las Lomas, etc.). Aquí tienes algunas destacadas:\n\n`;
        generalProps.forEach(p => {
          propListText += `✨ **${p.title}** en ${p.location} (${p.price})\n`;
        });
        propListText += `\n¿Buscas alguna zona, rango de precio o número de recámaras en específico? Cuéntame para filtrar las mejores opciones para ti. 🏠`;
        return propListText;
      }
    }
  
    // 6. Default fallback
    return `¡Hola! Soy **Dave**, tu asesor virtual en HAVN. 
  
  Te puedo asistir con detalle sobre los siguientes temas de nuestra plataforma:
  
  🔑 **Buscar Inmuebles:** Pregúntame sobre casas o departamentos en Polanco, Roma, Condesa, etc., en renta o venta.
  📈 **HAVN Capital:** Te adelantamos efectivo de tu casa actual para que compres la siguiente.
  💳 **HAVN Crédito:** Asesoría hipotecaria gratuita con las mejores tasas de los bancos en México.
  🔨 **HAVN Flip:** Propiedades de diseño exclusivo remodeladas listas para habitar o coinversión inteligente.
  📍 **Contacto:** Dirección, teléfonos y horarios de nuestras oficinas.
  
  ¿Sobre cuál de estos temas te gustaría recibir más información hoy? 😊`;
  }

  // API route for chatbot
  app.post("/api/chat", async (req, res) => {
    const { messages, context } = req.body || {};
    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ error: "Invalid request payload" });
      return;
    }

    const latestMessage = messages[messages.length - 1]?.content || "";
    const propertiesList = context?.properties || [];

    // If API key is completely missing or blank, seamlessly use fallback response
    if (!process.env.GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY is not set. Responding with local fallback responder.");
      const fallbackText = generateSmartFallbackResponse(latestMessage, propertiesList);
      res.json({ text: fallbackText, isFallback: true });
      return;
    }

    try {
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
5. Si no sabes la respuesta o es algo muy específico que requiere atención humana, invítarlos a dejar sus datos en el formulario de contacto del sitio web.`;

      // Translate message history to Gemini API format
      const formattedHistory = messages.slice(0, -1).map((m: any) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }]
      }));

      const ai = getGeminiClient();
      
      // Implement robust fallback model selection to handle 503 high demand or transient failures
      const modelsToTry = ["gemini-3.5-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];
      let responseText = "";
      let lastError: any = null;

      for (const modelName of modelsToTry) {
        try {
          const chat = ai.chats.create({
            model: modelName,
            config: {
              systemInstruction,
            },
            history: formattedHistory,
          });

          const response = await chat.sendMessage({ message: latestMessage });
          if (response && response.text) {
            responseText = response.text;
            break;
          }
        } catch (err: any) {
          console.warn(`Model ${modelName} failed or busy:`, err.message || err);
          lastError = err;
        }
      }

      if (!responseText && lastError) {
        throw lastError;
      }

      res.json({ text: responseText });
    } catch (error: any) {
      console.error("Gemini model failed or exceeded quota. Activating smart local fallback. Error:", error);
      // Seamlessly respond with our high quality fallback response to guarantee 100% uptime
      const fallbackText = generateSmartFallbackResponse(latestMessage, propertiesList);
      res.json({ text: fallbackText, isFallback: true });
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
