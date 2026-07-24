# Al-Nafi College of Technology — Website Redesign

Modern static homepage redesign for **Al-Nafi College of Technology** (TTB Peshawar affiliated).

## Preview

Open `index.html` in a browser, or serve the folder locally:

```bash
cd alnafi-college
python3 -m http.server 8080
```

Then visit `http://localhost:8080`.

## What’s included

| File | Purpose |
|------|---------|
| `index.html` | Redesigned homepage |
| `css/styles.css` | Full modern stylesheet |
| `js/main.js` | Mobile nav, scroll reveal, counters, testimonials |
| `images/logo.svg` | Placeholder logo mark (replace with your real logo) |

## Design notes

- Full-bleed hero with brand-first hierarchy
- Deep ink + teal visual direction (Syne + Figtree)
- Working mobile menu, animated stats, testimonial rotator
- Respects `prefers-reduced-motion`

## Replace before going live

1. Swap `images/logo.svg` with your real `logo.png` (update HTML refs)
2. Update placeholder phone / WhatsApp number (`923000000000`)
3. Add real social profile URLs in the footer
4. Add remaining pages linked from the nav (`about.html`, `courses.html`, etc.)
