import type { VercelRequest, VercelResponse } from "@vercel/node";

// In-memory rate limiting map for contact submissions
interface RateLimitInfo {
  count: number;
  resetTime: number;
}
const rateLimitMap = new Map<string, RateLimitInfo>();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const RATE_LIMIT_MAX_REQUESTS = 5; // Max 5 contact submissions per 10 minutes

// Allowed origins
const ALLOWED_ORIGINS = [
  "https://havn.mx",
  "https://www.havn.mx"
];

function isOriginAllowed(origin: string | undefined): boolean {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  if (/^https:\/\/([a-zA-Z0-9-]+\.)*vercel\.app$/.test(origin)) {
    return true;
  }
  return false;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. Setup CORS Headers
  const origin = req.headers.origin as string | undefined;
  
  if (origin && isOriginAllowed(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  } else if (!origin) {
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

  // 2. Add Security Headers
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");

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
    res.status(429).json({ error: "Demasiados intentos de registro. Por favor, intenta de nuevo en unos minutos." });
    return;
  } else {
    rateInfo.count += 1;
  }

  try {
    // Validate payload size
    const bodyStr = JSON.stringify(req.body || {});
    if (bodyStr.length > 10 * 1024) { // 10 KB limit
      res.status(400).json({ error: "Payload too large" });
      return;
    }

    const { name, email, phone, intent, budget } = req.body || {};

    // 4. Input Validation
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      res.status(400).json({ error: "El nombre es obligatorio." });
      return;
    }
    if (!email || typeof email !== "string" || !email.includes("@")) {
      res.status(400).json({ error: "El correo electrónico es inválido." });
      return;
    }
    if (!phone || typeof phone !== "string" || phone.trim().length < 8) {
      res.status(400).json({ error: "El teléfono es inválido o demasiado corto." });
      return;
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();
    const cleanIntent = typeof intent === "string" ? intent : "buy";
    const cleanBudget = typeof budget === "string" ? budget : "No especificado";

    // 5. Connect to HubSpot CRM API if Access Token is provided
    const hubspotToken = process.env.HUBSPOT_ACCESS_TOKEN;
    let hubspotSyncSuccess = false;

    if (hubspotToken) {
      // Split name into first and last name safely
      const nameParts = cleanName.split(/\s+/);
      const firstname = nameParts[0] || "";
      const lastname = nameParts.slice(1).join(" ") || "";

      // Format payload for HubSpot CRM Contacts API v3
      const hubspotPayload = {
        properties: {
          email: cleanEmail,
          firstname: firstname,
          lastname: lastname,
          phone: cleanPhone,
          // Custom properties can be created in HubSpot. 
          // To be safe and compatible with all HubSpot default setups, we also save intent/budget into the 'message' or 'notes' fields
          hs_content_membership_notes: `Interés: ${cleanIntent === "buy" ? "Quiero comprar" : "Quiero vender"}. Presupuesto/Valor: ${cleanBudget}. Código: HAVN-SERIEA-992`,
          website: "https://havn.mx"
        }
      };

      try {
        const hsResponse = await fetch("https://api.hubapi.com/crm/v3/objects/contacts", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${hubspotToken}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(hubspotPayload)
        });

        if (hsResponse.status === 201 || hsResponse.status === 200) {
          hubspotSyncSuccess = true;
        } else {
          // If contact already exists, HubSpot returns 409. We can update it or handle gracefully
          const hsData = await hsResponse.json();
          if (hsResponse.status === 409) {
            console.log("Contact already exists in HubSpot, continuing gracefully.");
            hubspotSyncSuccess = true;
          } else {
            console.error("HubSpot CRM API returned non-success status:", hsResponse.status, hsData);
          }
        }
      } catch (hsError) {
        console.error("Failed to sync with HubSpot CRM API:", hsError);
      }
    } else {
      console.log("No HUBSPOT_ACCESS_TOKEN set in environment variables. Skipping CRM Contact Sync.");
    }

    res.status(200).json({ 
      success: true, 
      hubspotSynced: hubspotSyncSuccess,
      message: "Lead recibido correctamente." 
    });
  } catch (error) {
    console.error("Error internally processing /api/contact:", error);
    res.status(500).json({ error: "Ocurrió un error al procesar tu solicitud." });
  }
}
