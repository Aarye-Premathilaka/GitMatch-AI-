const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";

const corsHeaders = {
  "Access-Control-Allow-Origin": process.env.ALLOWED_ORIGIN || "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept",
  "Access-Control-Max-Age": "86400",
  "Content-Type": "application/json; charset=utf-8"
};

function setCorsHeaders(res) {
  Object.entries(corsHeaders).forEach(([key, value]) => res.setHeader(key, value));
}

function sendJson(res, statusCode, body) {
  setCorsHeaders(res);
  res.status(statusCode).json(body);
}

async function readJsonSafely(response) {
  const text = await response.text();

  try {
    return text ? JSON.parse(text) : {};
  } catch (error) {
    return {
      error: {
        message: text.trim().startsWith("<")
          ? "Gemini returned an HTML response instead of JSON. Check the API URL, key, and model name."
          : "Gemini returned a non-JSON response.",
        raw: text.slice(0, 500),
        parseError: error.message
      }
    };
  }
}

function cleanGeminiJson(text = "") {
  return text
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();
}

function buildPrompt(input) {
  return `You are Giftmatch.ai, a smart and safe gift recommendation assistant.

Create 5 very specific gift ideas.

User request JSON:
${JSON.stringify(input, null, 2)}

Rules:
- Give specific real gift objects, not vague categories.
- Match the selected interests strongly.
- If the user likes hiking, suggest compact useful hiking gadgets or tools.
- If the user likes animals, suggest animal-related gifts.
- If the user likes gaming, suggest real gaming accessories or products.
- If the user likes Lego, suggest specific Lego-style products or set types.
- If the user selected a preferred store, respect it when possible.
- If the store is “Any secure website”, suggest several trusted stores for the selected country.
- Avoid unsafe, suspicious, illegal, adult, gambling, alcohol, nicotine, weapon, or fake-shop suggestions.
- Do not recommend Temu, AliExpress, fake shops, illegal sites, or unsafe links.
- Use realistic estimated prices in CHF.
- Include Google Search and Google Shopping queries so the frontend can open fresh product results.
- Return only valid JSON. No markdown.

Required JSON format:
{
  "ideas": [
    {
      "name": "specific gift object name",
      "why": "short reason why it matches",
      "price": "estimated CHF price",
      "match": 95,
      "googleSearchQuery": "specific Google search query",
      "googleShoppingQuery": "specific Google Shopping query",
      "stores": ["store 1", "store 2", "store 3"]
    }
  ]
}`;
}

module.exports = async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method === "GET") {
    return sendJson(res, 200, {
      ok: true,
      route: "/api/gift",
      message: "Giftmatch.ai API is deployed. Send a POST request to generate gift ideas.",
      geminiApiKeyConfigured: Boolean(process.env.GEMINI_API_KEY),
      model: GEMINI_MODEL
    });
  }

  if (req.method !== "POST") {
    return sendJson(res, 405, { error: "Method not allowed. Use POST /api/gift." });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return sendJson(res, 500, {
      error: "GEMINI_API_KEY is not configured. Add it in Vercel Project Settings > Environment Variables, then redeploy."
    });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const input = {
      description: String(body.description || "").slice(0, 2000),
      receiver: String(body.receiver || "other"),
      age: String(body.age || "any age"),
      gender: String(body.gender || "any"),
      budget: String(body.budget || "CHF 20–50"),
      country: String(body.country || "Switzerland"),
      store: String(body.store || "Any secure website"),
      interests: Array.isArray(body.interests) ? body.interests.map(String).slice(0, 20) : []
    };

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(GEMINI_MODEL)}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: buildPrompt(input) }] }],
          generationConfig: {
            temperature: 0.65,
            topP: 0.9,
            maxOutputTokens: 1800,
            responseMimeType: "application/json"
          }
        })
      }
    );

    const geminiData = await readJsonSafely(geminiResponse);

    if (!geminiResponse.ok) {
      return sendJson(res, geminiResponse.status, {
        error: "Gemini API request failed.",
        details: geminiData?.error?.message || "Unknown Gemini error",
        model: GEMINI_MODEL
      });
    }

    const text = geminiData?.candidates?.[0]?.content?.parts?.map(part => part.text || "").join("") || "";
    let parsed;
    try {
      parsed = JSON.parse(cleanGeminiJson(text));
    } catch (parseError) {
      return sendJson(res, 502, {
        error: "Gemini returned a response that was not valid JSON.",
        details: parseError.message
      });
    }

    const ideas = Array.isArray(parsed.ideas) ? parsed.ideas.slice(0, 5) : [];
    return sendJson(res, 200, { ideas, model: GEMINI_MODEL });
  } catch (error) {
    const statusCode = error instanceof SyntaxError ? 400 : 500;
    return sendJson(res, statusCode, {
      error: statusCode === 400 ? "Request body must be valid JSON." : "Giftmatch.ai backend error.",
      details: error.message
    });
  }
};
