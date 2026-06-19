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

This error means the browser requested `/api/gift`, but the response was an HTML page, usually because the deployed URL is serving only the static frontend and not the Vercel serverless API route. Follow this checklist in order. Do not skip the health-check steps.

> **GitHub Pages note:** URLs like `https://username.github.io/...` are static hosting only. They cannot run `api/gift.js`, so a browser POST to `https://username.github.io/api/gift` will fail with `405 Method Not Allowed` or return HTML instead of JSON. Use the Vercel deployment URL for the app, or configure the frontend to call a deployed Vercel API endpoint by setting `window.GIFTMATCH_BACKEND_URL` or a `<meta name="giftmatch-backend-url" content="https://your-project.vercel.app/api/gift">` tag before the gift script runs.

### Step 1: Confirm the API file exists in the deployed repository

Your GitHub repository must include these files at the repository root:

- `index.html`
- `api/gift.js`
- `package.json`
- `vercel.json`

If you uploaded only `index.html` to Vercel, `/api/gift` will not exist and Vercel will return an HTML page.

### Step 2: Import the repository root in Vercel

1. Open your Vercel project dashboard.
2. Go to **Settings → General**.
3. Confirm **Root Directory** is empty or points to the folder containing `api/gift.js`.
4. Confirm the project is connected to the GitHub repository that contains this code.
5. If the wrong folder or repository is selected, create a new Vercel project and import the correct repository root.

### Step 3: Add the Gemini environment variable

1. In Vercel, open **Settings → Environment Variables**.
2. Add `GEMINI_API_KEY` with your Google Gemini API key.
3. Select the same environment you are testing, usually **Production** for the public `vercel.app` URL.
4. Click **Save**.
5. Redeploy after saving. Vercel does not automatically inject new environment variables into an already-built deployment.

Optional environment variables:

- `GEMINI_MODEL`: defaults to `gemini-2.0-flash`.
- `ALLOWED_ORIGIN` or `ALLOWED_ORIGINS`: leave unset while testing. If you set it, use the exact origin such as `https://your-project.vercel.app` with no trailing slash.

### Step 4: Redeploy from Vercel

1. Open **Deployments** in Vercel.
2. Click the three-dot menu on the latest deployment.
3. Choose **Redeploy**.
4. Wait until the deployment status is **Ready**.

### Step 5: Run the browser health check

Open this URL, replacing the domain with your real Vercel domain:

```text
https://your-project.vercel.app/api/gift
```

A working deployment returns JSON like this:

```json
{
  "ok": true,
  "route": "/api/gift",
  "geminiApiKeyConfigured": true
}
```

Use the result to decide the next step:

- If you see the JSON object and `geminiApiKeyConfigured` is `true`, the API route is deployed correctly. Test the website again.
- If you see the JSON object but `geminiApiKeyConfigured` is `false`, the Vercel environment variable is missing from that deployment environment. Add `GEMINI_API_KEY` and redeploy.
- If you see an HTML page, Vercel is not serving `api/gift.js` for that domain. Recheck the repository, root directory, and custom-domain target.
- If you see a Gemini error in JSON, the backend is deployed, but the Gemini key or model is wrong. Regenerate the API key or set `GEMINI_MODEL` to a model your key can use.

### Step 6: Test with curl

After the browser health check returns JSON, test a real POST request:

```bash
curl -i -X POST https://your-project.vercel.app/api/gift \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  --data '{"description":"gift for a hiker","interests":["hiking"],"budget":"CHF 20-50","country":"Switzerland"}'
```

The response should have a `content-type: application/json` header and a JSON body containing an `ideas` array.

### Step 7: Check custom domains last

If `https://your-project.vercel.app/api/gift` works but your custom domain does not, the custom domain points to the wrong Vercel project or an old deployment. In Vercel, open **Settings → Domains**, attach the custom domain to the project that contains this repository, then redeploy.

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
