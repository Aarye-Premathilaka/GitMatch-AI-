# Giftmatch.ai

Giftmatch.ai is a modern AI-powered gift-finder website. A user describes someone, selects filters like age, budget, country, store, and interests, and the frontend asks a secure backend for specific gift ideas.

The project is intentionally simple and student-friendly:

- Vanilla `index.html` with HTML, CSS, and JavaScript
- Vercel serverless backend at `/api/gift`
- Gemini API key stored only as a backend environment variable
- No React, database, login, or paid frontend libraries
- Designed to run on the free Vercel Hobby plan and Gemini free tier within limits

## Project structure

```text
giftmatch-ai/
├── index.html
├── package.json
├── README.md
└── api/
    └── gift.js
```

## Important API key safety

Never put API keys in frontend HTML, CSS, or JavaScript. The browser can see frontend code.

Giftmatch.ai uses this backend-only environment variable:

```text
GEMINI_API_KEY
```

The frontend calls:

```text
POST /api/gift
```

Then the backend calls Gemini securely using:

```js
process.env.GEMINI_API_KEY
```

The frontend never receives or exposes the key.

## Backend route

The Vercel serverless function lives at:

```text
/api/gift
```

It accepts `POST` requests with JSON like this:

```json
{
  "description": "My dad enjoys hiking in Switzerland and likes compact useful gadgets.",
  "receiver": "father",
  "age": "40–60 years",
  "gender": "man",
  "budget": "CHF 50–100",
  "country": "Switzerland",
  "store": "Any secure website",
  "interests": ["hiking", "outdoor", "technology"]
}
```

It returns JSON like this:

```json
{
  "ideas": [
    {
      "name": "compact hiking multitool",
      "why": "Useful for small outdoor fixes and everyday carry.",
      "price": "estimated CHF 40–80",
      "match": 95,
      "googleSearchQuery": "compact hiking multitool Switzerland CHF 50 100",
      "googleShoppingQuery": "compact hiking multitool Switzerland",
      "stores": ["Galaxus", "Brack", "Ochsner Sport"]
    }
  ]
}
```

If a user opens `/api/gift` directly in a browser with `GET`, the route returns:

```json
{"error":"Method not allowed"}
```

That is correct because gift generation only accepts `POST`.

## Gemini model

The backend uses this default model:

```js
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";
```

You can change the model later by setting a `GEMINI_MODEL` environment variable in Vercel.

## Run locally

1. Install dependencies:

   ```bash
   npm install
   ```

2. Install or use the Vercel CLI through the included dev dependency.

3. Create a local environment file for development if you want to test Gemini locally:

   ```bash
   GEMINI_API_KEY=your_key_here
   ```

   Do not commit local secret files to GitHub.

4. Start the Vercel development server:

   ```bash
   npm run dev
   ```

5. Open the local Vercel URL shown in the terminal.

## Test the backend

With the dev server running, test the expected `GET` behavior:

```bash
curl http://localhost:3000/api/gift
```

Expected result:

```json
{"error":"Method not allowed"}
```

Test a real `POST` request after setting `GEMINI_API_KEY`:

```bash
curl -X POST http://localhost:3000/api/gift \
  -H "Content-Type: application/json" \
  -d '{
    "description":"My dad enjoys hiking in Switzerland, compact tools, and clever gadgets.",
    "receiver":"father",
    "age":"40–60 years",
    "gender":"man",
    "budget":"CHF 50–100",
    "country":"Switzerland",
    "store":"Any secure website",
    "interests":["hiking","outdoor","technology"]
  }'
```

## Deploy for free on Vercel

1. Push this project to GitHub.
2. Create a new project on Vercel and import the GitHub repository.
3. In Vercel, open **Project Settings → Environment Variables**.
4. Add:

   ```text
   GEMINI_API_KEY=your_real_gemini_api_key
   ```

5. Deploy the project.
6. Visit the free Vercel domain, for example:

   ```text
   https://giftmatch-ai.vercel.app
   ```

## Custom domain note

A true custom domain like `giftmatch.ai` is not free. `.ai` domains usually cost money. This project works perfectly on the free Vercel subdomain, and a paid custom domain can easily be added later in Vercel if needed.

## Shopping safety

Giftmatch.ai creates search links, not guaranteed product listings. It does not fetch live prices or stock availability. Users should always check seller safety, current price, delivery, and availability themselves.

Giftmatch.ai is a student project and not an official Google product.
