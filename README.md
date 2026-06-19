# Giftmatch.ai

Giftmatch.ai is a static, AI-powered gift-finder website. A user describes someone, chooses filters such as age, budget, country, store, and interests, and the page can call the Gemini API directly from the browser.

> **Important:** this static setup exposes the Gemini API key to anyone who can view the page source or browser network requests. The current project supports this because it is intended for simple GitHub Pages hosting and the owner accepts that risk. For private production keys, use a backend proxy instead.

## Static GitHub Pages setup

The app is plain HTML, CSS, and vanilla JavaScript. It does not require Node.js, a database, or a serverless backend when deployed as a static page.

1. Open `index.html`.
2. Add your Gemini API key before the main gift script runs. The easiest option is to add this in the `<head>` or before the final app script:

```html
<script>
  window.GIFTMATCH_GEMINI_API_KEY = "your_gemini_api_key_here";
</script>
```

You can also use a meta tag:

```html
<meta name="giftmatch-gemini-api-key" content="your_gemini_api_key_here">
```

3. Commit and push to GitHub Pages.
4. Open the GitHub Pages URL and use the gift finder. The browser will POST directly to Google Gemini's `generateContent` endpoint.

## How the static AI call works

When `window.GIFTMATCH_GEMINI_API_KEY` or `<meta name="giftmatch-gemini-api-key">` is present, `index.html` calls Gemini directly from the browser:

```text
https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={apiKey}
```

The page asks Gemini to return JSON gift ideas, then renders the ideas with Google Search, Google Shopping, and image-search links. If Gemini fails, the page still shows built-in fallback gift ideas.

## No backend required for GitHub Pages

GitHub Pages cannot run `/api` routes. If no browser Gemini key is configured, the frontend does **not** post to `/api/gift`; it shows smart built-in fallback gift ideas so the static site still works.

The repository still includes `api/gift.js` for people who want to build a separate backend deployment later, but the GitHub Pages frontend does not depend on it.

## Project structure

```text
giftmatch-ai/
├── index.html      # Static frontend and direct Gemini browser integration
├── api/gift.js     # Optional Vercel backend proxy
├── package.json    # Optional Vercel dev dependency
├── vercel.json     # Optional Vercel config
└── README.md
```

## Local testing without Node.js

Because this is a static site, you can open `index.html` directly in a browser after adding a Gemini key. For the closest GitHub Pages behavior, serve the folder with any simple static server, for example:

```bash
python3 -m http.server 8080
```

Then open:

```text
http://localhost:8080
```

## Notes

- Giftmatch.ai is a student project and not an official Google product.
- Shopping buttons open Google Search, Google Shopping, or image search queries with SafeSearch active.
- The site does not fetch live product prices, so it uses estimated prices and asks users to check current price, safety, delivery, and availability themselves.
