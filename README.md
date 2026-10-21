# MM Tech Guide — Myanmar Computer & IT Ecosystem

A static, single-page website built with HTML5, CSS3 and vanilla JavaScript.

## Run locally

From this directory, start a simple static server:

```bash
python3 -m http.server 3000
```

Then open http://localhost:3000 in a browser. The site uses a local MICT Park image in `public/assets/` and loads DM Sans / Noto Sans Myanmar fonts from Google Fonts when internet access is available. No package installation or build step is required.

## Main files

- `index.html` — page content and structure
- `styles.css` — responsive layout and light/dark visual themes
- `app.js` — topic tabs, cross-topic search, Unicode preview, mobile navigation, theme and back-to-top behavior
- `manus-routes.json` — route declaration
- `public/assets/mict-campus.jpg` — hero image
- `TODO.md` — completed project criteria
