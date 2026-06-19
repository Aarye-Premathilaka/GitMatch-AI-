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

3. Optional: choose a model. If omitted, the app uses `gemini-2.0-flash`.

```html
<script>
  window.GIFTMATCH_GEMINI_MODEL = "gemini-2.0-flash";
</script>
```

or:

```html
<meta name="giftmatch-gemini-model" content="gemini-2.0-flash">
```

4. Commit and push to GitHub Pages.
5. Open the GitHub Pages URL and use the gift finder. The browser will POST directly to Google Gemini's `generateContent` endpoint.

## How the static AI call works

When `window.GIFTMATCH_GEMINI_API_KEY` or `<meta name="giftmatch-gemini-api-key">` is present, `index.html` skips `/api/gift` and calls Gemini directly:

```text
https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={apiKey}
```

The page asks Gemini to return JSON gift ideas, then renders the ideas with Google Search, Google Shopping, and image-search links. If Gemini fails, the page still shows built-in fallback gift ideas.

## Optional backend mode

The repository still includes `api/gift.js` for people who want to deploy on Vercel with a private API key. Static GitHub Pages users can ignore it.

If no browser Gemini key is configured, the frontend falls back to posting to `/api/gift`, which requires a backend host such as Vercel.

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
