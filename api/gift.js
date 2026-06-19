const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

function sendJson(res, status, data) {
  Object.entries(corsHeaders).forEach(([key, value]) => res.setHeader(key, value));
  res.setHeader("Content-Type", "application/json");
  return res.status(status).json(data);
}

function safeString(value, maxLength = 1200) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

function buildPrompt(input) {
  const payload = {
    description: safeString(input.description, 1800),
    receiver: safeString(input.receiver, 80),
    age: safeString(input.age, 80),
    gender: safeString(input.gender, 80),
    budget: safeString(input.budget, 80),
    country: safeString(input.country, 100),
    store: safeString(input.store, 120),
    interests: Array.isArray(input.interests) ? input.interests.map((interest) => safeString(interest, 50)).filter(Boolean).slice(0, 20) : []
  };

  return `You are Giftmatch.ai, a smart and safe gift recommendation assistant.

Create 5 very specific gift ideas.

User request JSON:
${JSON.stringify(payload, null, 2)}

Rules:
- Give specific real gift objects, not vague categories.
- Match the selected interests strongly.
- If the user likes hiking, suggest compact useful hiking gadgets or tools.
- If the user likes animals, suggest animal-related gifts.
- If the user likes gaming, suggest real gaming accessories or products.
- If the user likes Lego, suggest specific Lego-style products or set types.
- If the user selected a preferred store, respect it when possible.
- If the store is "Any secure website", suggest several trusted stores for the selected country.
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

function normalizeIdeas(data) {
  if (!data || !Array.isArray(data.ideas)) return null;
  return {
    ideas: data.ideas.slice(0, 5).map((idea, index) => ({
      name: safeString(idea.name, 140) || `Gift idea ${index + 1}`,
      why: safeString(idea.why, 260) || "A thoughtful match for the selected description and filters.",
      price: safeString(idea.price, 80) || "Estimated price not available",
      match: Math.max(1, Math.min(100, Number.parseInt(idea.match, 10) || 85)),
      googleSearchQuery: safeString(idea.googleSearchQuery, 180) || safeString(idea.name, 140),
      googleShoppingQuery: safeString(idea.googleShoppingQuery, 180) || safeString(idea.name, 140),
      stores: Array.isArray(idea.stores) ? idea.stores.map((store) => safeString(store, 80)).filter(Boolean).slice(0, 5) : []
    }))
  };
}

module.exports = async function handler(req, res) {
  if (req.method === "OPTIONS") return sendJson(res, 200, { ok: true });
  if (req.method !== "POST") return sendJson(res, 405, { error: "Method not allowed" });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return sendJson(res, 500, { error: "GEMINI_API_KEY is not configured on the backend." });
  }

  try {
    const prompt = buildPrompt(req.body || {});
    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(GEMINI_MODEL)}:generateContent?key=${encodeURIComponent(apiKey)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.75,
          responseMimeType: "application/json"
        }
      })
    });

    const raw = await geminiResponse.text();
    if (!geminiResponse.ok) {
      return sendJson(res, 502, { error: "Gemini API request failed.", status: geminiResponse.status, details: raw.slice(0, 500) });
    }

    const geminiData = JSON.parse(raw);
    const text = geminiData?.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("") || "";
    const parsed = JSON.parse(text);
    const normalized = normalizeIdeas(parsed);

    if (!normalized || normalized.ideas.length === 0) {
      return sendJson(res, 502, { error: "Gemini returned JSON, but it did not include gift ideas." });
    }

    return sendJson(res, 200, normalized);
  } catch (error) {
    return sendJson(res, 500, { error: "Giftmatch.ai could not create gift ideas right now.", details: error.message });
  }
};
