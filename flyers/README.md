# Country Club Services — Print Fliers

Four print-ready fliers for door-to-door distribution. Each ships as both an HTML source and a PDF.

## Files

| File | Description |
|------|-------------|
| `window-washing.html` / `.pdf` | Window washing service flier |
| `lawn-yardwork.html` / `.pdf` | Lawn care & yardwork service flier |
| `car-detailing.html` / `.pdf` | Mobile car detailing flier |
| `multi-service.html` / `.pdf` | All 3 services — the door-knock universal |

---

## How to Print

**From PDF (recommended for print shops):**
1. Open the `.pdf` file in any PDF viewer.
2. Print at **100% scale** (do not fit to page).
3. Paper: standard 8.5 × 11 letter, white or cream.
4. Color printing required — the forest green and gold branding do not work in B&W.

**From browser (home printing):**
1. Open the `.html` file in Google Chrome or Edge.
2. Press `Ctrl+P` (Windows) or `Cmd+P` (Mac).
3. Set **Destination** to your printer.
4. Set **More settings → Paper size** to Letter.
5. Set **Scale** to Default (100%).
6. Enable **Background graphics** (required for the colored header/footer).
7. Set margins to **None**.
8. Print.

---

## How to Update Phone Number

All 4 fliers use the placeholder: `{{TBD per Brooks/JDM: phone number}}`

To fill it in:
1. Open the `.html` file in any text editor (VS Code, Notepad, TextEdit).
2. Find-and-replace `{{TBD per Brooks/JDM: phone number}}` with Brooks' actual phone.
3. Save and re-print (or regenerate PDF via Chrome headless — see below).

---

## How to Update the QR Code Target URL

The QR codes currently point to:
- Window washing: `https://countryclubservices.com/book.html?ref=flier-window-washing`
- Lawn/yardwork: `https://countryclubservices.com/book.html?ref=flier-lawn-yardwork`
- Car detailing: `https://countryclubservices.com/book.html?ref=flier-car-detailing`
- Multi-service: `https://countryclubservices.com/book.html?ref=flier-multi-service`

To update to the real booking URL once Brooks' site is live:
1. Install Node.js and the `qrcode` package: `npm install qrcode`
2. Edit the URLs in the generation script at `/qr-gen/generate.js` (or ask your developer).
3. Re-run the script and replace the `<svg>` blocks inside each `.html` file.

Quick path: use [qr-code-generator.com](https://www.qr-code-generator.com) to generate a new QR, export as SVG, and paste it into the `.qr-wrap` div in the HTML.

---

## How to Swap Pricing

Every price in all 4 fliers is a placeholder in this format:
- Single-service fliers: `{{TBD per Brooks/JDM}}`
- Multi-service tiles: `{{TBD per Brooks}}`

Find-and-replace in your text editor once Brooks sets his prices. Example:
- `{{TBD per Brooks/JDM}}` → `from $40`
- `{{TBD per Brooks}}` (window tile) → `from $40`

---

## How to Update Other Placeholders

| Placeholder | What it is | Where to find it |
|-------------|-----------|------------------|
| `{{TBD per Brooks/JDM: neighborhood}}` | Service area name | Ask Brooks/JDM |
| `{{TBD per Brooks/JDM: insurance status}}` | Insured / bonded statement | Ask Brooks/JDM |
| `{{TBD: @handle}}` | Instagram handle | Ask Brooks |
| `{{TBD: page name}}` | Facebook page name | Ask Brooks |

---

## Regenerating PDFs (Chrome headless)

After editing HTML files, regenerate PDFs with:

```bash
google-chrome --headless --disable-gpu --no-sandbox \
  --print-to-pdf=window-washing.pdf \
  --no-pdf-header-footer \
  "file://$(pwd)/window-washing.html"
```

Repeat for each flier. macOS users: replace `google-chrome` with `/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome`.

---

## Brand Colors (for reference)

| Token | Hex | Use |
|-------|-----|-----|
| Forest Green | `#1B4332` | Headers, accents, wordmark background |
| Accent Gold | `#C8A35E` | Rules, checkmarks, highlights |
| Cream | `#F8F4ED` | Page background |
| Charcoal | `#1F1F1F` | Footer background, body text |
