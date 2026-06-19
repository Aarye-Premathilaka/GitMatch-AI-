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

Opening `/api/gift` in a browser returns:

```json
{"error":"Method not allowed"}
```

That is correct because the route only accepts POST requests.

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
6. Deploy.

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
