// Vercel serverless function (Node.js runtime) — replaces the old PHP contact handler,
// which never worked on Vercel (Vercel doesn't execute PHP; it just serves the source as text).
//
// Sends lead-form submissions by email via Resend's HTTP API (https://resend.com).
// No npm dependency required — calls Resend's REST endpoint directly with fetch.
//
// Required environment variables (set in Vercel: Project Settings -> Environment Variables):
//   RESEND_API_KEY   - your Resend API key (re_...)
//   LEAD_EMAIL_TO    - where leads should be delivered, e.g. info@delcoab.se
//   RESEND_FROM      - verified sender, e.g. offert@delco.nu (falls back to onboarding@resend.dev
//                      for testing before a sending domain is verified in Resend)

const FIELD_LABELS = {
  "contact-name": "Namn",
  name: "Namn",
  "contact-phone": "Telefon",
  phone: "Telefon",
  "contact-email": "E-post",
  email: "E-post",
  service: "Tjänst",
  area: "Område",
  property_type: "Typ av fastighet",
  customerType: "Kundtyp",
  size: "Yta (kvm)",
  floor: "Våning",
  address: "Adress",
  frequency: "Önskad frekvens",
  preferred_date: "Önskat startdatum",
  rut_avdrag: "RUT-avdrag",
  "contact-message": "Meddelande",
  message: "Meddelande",
};

const SKIP_FIELDS = new Set(["website", "_hp"]); // honeypot / bot-trap fields, never shown or forwarded

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function parseBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string" && req.body.length) {
    try {
      return JSON.parse(req.body);
    } catch (e) {
      return Object.fromEntries(new URLSearchParams(req.body));
    }
  }
  // Fallback: read the raw stream ourselves (covers edge cases where Vercel didn't pre-parse).
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) return {};
  const contentType = req.headers["content-type"] || "";
  if (contentType.includes("application/json")) {
    try {
      return JSON.parse(raw);
    } catch (e) {
      return {};
    }
  }
  return Object.fromEntries(new URLSearchParams(raw));
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  let fields;
  try {
    fields = await parseBody(req);
  } catch (e) {
    return res.status(400).json({ ok: false, error: "Kunde inte läsa formuläret." });
  }

  // Honeypot: if a hidden bot-only field is filled in, silently pretend success.
  for (const hp of SKIP_FIELDS) {
    if (fields[hp]) {
      return res.status(200).json({ ok: true });
    }
  }

  const name = fields["contact-name"] || fields.name || "";
  const phone = fields["contact-phone"] || fields.phone || "";

  if (!name.trim() || !phone.trim()) {
    return res.status(400).json({ ok: false, error: "Namn och telefon krävs." });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.LEAD_EMAIL_TO || "info@delcoab.se";
  const from = process.env.RESEND_FROM || "Delco AB webbformulär <onboarding@resend.dev>";

  if (!apiKey) {
    console.error("RESEND_API_KEY saknas i miljövariablerna.");
    return res.status(500).json({ ok: false, error: "Formuläret är inte konfigurerat än." });
  }

  const rows = Object.entries(fields)
    .filter(([key, value]) => !SKIP_FIELDS.has(key) && String(value || "").trim() !== "")
    .map(([key, value]) => {
      const label = FIELD_LABELS[key] || key;
      return `<tr><td style="padding:4px 12px 4px 0;color:#6b6b6b;white-space:nowrap;"><strong>${escapeHtml(label)}</strong></td><td style="padding:4px 0;">${escapeHtml(value)}</td></tr>`;
    })
    .join("");

  const html = `
    <div style="font-family:Arial,sans-serif;font-size:14px;color:#1a1a1a;">
      <h2 style="color:#c8302f;margin-bottom:16px;">Ny förfrågan från delco.nu</h2>
      <table>${rows}</table>
    </div>
  `;

  try {
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: fields["contact-email"] || fields.email || undefined,
        subject: `Ny förfrågan från ${name} (${phone})`,
        html,
      }),
    });

    if (!resendResponse.ok) {
      const errText = await resendResponse.text();
      console.error("Resend API error:", resendResponse.status, errText);
      return res.status(502).json({ ok: false, error: "Kunde inte skicka meddelandet just nu." });
    }

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error("Contact form send failed:", e);
    return res.status(500).json({ ok: false, error: "Något gick fel. Försök igen om en stund." });
  }
}
