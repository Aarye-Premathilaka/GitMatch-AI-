# Giftmatch.ai

Giftmatch.ai is a modern AI-powered gift-finder website. A user describes someone, chooses filters such as age, budget, country, store, and interests, and the site asks a secure backend for specific gift ideas.

The frontend is plain HTML, CSS, and vanilla JavaScript. The backend is a Vercel serverless function at `/api/gift` that calls the Gemini API using `process.env.GEMINI_API_KEY`.

## Important API key safety

Never put API keys in frontend HTML, CSS, or JavaScript. This project only reads the Gemini API key on the backend:

```js
process.env.GEMINI_API_KEY
```

The browser calls `/api/gift`. The serverless function calls Gemini securely and returns JSON gift ideas to the browser.

## Project structure

```text
giftmatch-ai/
├── index.html
├── package.json
├── README.md
└── api/
    └── gift.js
```

## Run locally

1. Install dependencies:

```bash
npm install
```

2. Create a local environment file (do not commit it):

```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

With Vercel CLI, you can place this in `.env.local` or export it in your terminal.

3. Start the Vercel local server:

```bash
npm run dev
```

4. Open the local URL shown by Vercel, usually `http://localhost:3000`.

## Backend route

### `GET /api/gift`

Opening `/api/gift` in a browser returns a JSON health check:

```json
{
  "ok": true,
  "route": "/api/gift",
  "message": "Giftmatch.ai API is deployed. Send a POST request to generate gift ideas.",
  "geminiApiKeyConfigured": true,
  "model": "gemini-2.0-flash"
}
```

If you see an HTML page instead of this JSON object, the API function is not deployed for that URL. Confirm the project is deployed on Vercel from the repository root and redeploy.

### `POST /api/gift`

Example request body:

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

Example test command:

```bash
curl -X POST http://localhost:3000/api/gift \
  -H "Content-Type: application/json" \
  -d '{"description":"My dad enjoys hiking in Switzerland and likes compact useful gadgets.","receiver":"father","age":"40–60 years","gender":"man","budget":"CHF 50–100","country":"Switzerland","store":"Any secure website","interests":["hiking","outdoor","technology"]}'
```

## Deploy on Vercel for free

1. Push this project to GitHub.
2. Create a new project on Vercel and import the GitHub repository.
3. In Vercel, open **Project Settings → Environment Variables**.
4. Add:
   - Name: `GEMINI_API_KEY`
   - Value: your Gemini API key
5. Optional: add `GEMINI_MODEL` if you want to change the model. By default the backend uses `gemini-2.0-flash`.
6. Optional: add `ALLOWED_ORIGIN` or `ALLOWED_ORIGINS` if you want to restrict CORS. Use a comma-separated list for multiple origins, such as `https://giftmatch-ai.vercel.app,https://www.example.com`. Leave it unset to allow `*`.
7. Deploy.
8. After deployment, open `https://your-project.vercel.app/api/gift`. It should show the JSON health check above.

## Fix `AI backend returned an HTML page instead of JSON`

This error means the browser requested `/api/gift`, but the response was an HTML page, usually because the serverless API route is missing from the deployed site. Check these items:

1. Deploy the repository root to Vercel, not only `index.html`. The deployed project must include `api/gift.js`, `package.json`, and `vercel.json`.
2. In Vercel, verify **Project Settings → Environment Variables** contains `GEMINI_API_KEY` for the environment you are using, then redeploy.
3. If you set `ALLOWED_ORIGIN` or `ALLOWED_ORIGINS`, confirm the deployed site origin is included exactly. For example, `https://giftmatch-ai.vercel.app` and `https://www.example.com` are different origins.
4. Visit `/api/gift` on the deployed domain. It should return JSON with `ok: true`, `geminiApiKeyConfigured: true`, and the configured `allowedOrigins`.
5. If `geminiApiKeyConfigured` is `false`, add or fix the environment variable and redeploy.
6. If `/api/gift` still returns HTML, check that your custom domain points to the Vercel project that contains this repo.

The project should work on the free Vercel Hobby plan and Gemini free tier within their limits. There is no database, no paid backend, and no paid frontend library.

## Free domain information

A true custom domain like `giftmatch.ai` is not normally free. `.ai` domains usually cost money. The project works perfectly on the default free Vercel subdomain, for example:

```text
https://giftmatch-ai.vercel.app
```

A paid custom domain can be added later in Vercel, but it is not required.

## Notes

- Giftmatch.ai is a student project and not an official Google product.
- Shopping buttons open Google Search, Google Shopping, or image search queries with SafeSearch active.
- The site does not fetch live product prices, so it uses estimated prices and asks users to check current price, safety, delivery, and availability themselves.
