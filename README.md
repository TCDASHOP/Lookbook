# SAIREN COLOR ARCHIVE — Lookbook (v4)

## What this ZIP fixes
- Images are **not cropped** (uses `object-fit: contain`).
- UI overlay does **not block taps** on iPad (pointer-events fixed).
- Cover has **no ENTER button** (scroll-based magazine).

## Where to put your images
Put your files here (same as before):
- `/assets/img/looks/`

Then edit:
- `/data/issue-01.json`

Example entry:
```json
{
  "code": "LOOK 07",
  "label": "Zip Hoodie / hs",
  "webp": "/assets/img/looks/007.webp",
  "jpg": "/assets/img/looks/007.jpg",
  "alt": "Look 07"
}
```

## UI images (optional)
Place:
- `/assets/img/ui/og-default.jpg`
- `/assets/img/ui/og-issue-01.jpg`
- `/assets/img/ui/favicon.png`

If you don't have them yet, it won't break the page.
