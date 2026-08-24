# Launch graphics

| File | Size | Use |
| --- | --- | --- |
| `pathwise-square.png` | 1080×1080 | LinkedIn feed post, and sharing into WhatsApp |
| `pathwise-story.png` | 1080×1920 | Instagram / WhatsApp story |
| `pathwise-link.png` | 1200×627 | Preview card when the **link** is pasted rather than an image uploaded |

Upload the square as an image attachment on LinkedIn — it renders larger than a
link card. `pathwise-link.png` only appears if you paste the URL on its own.

## How they are made

Each `.html` is a fixed-size canvas rendered with Playwright at exactly the
output dimensions. `tokens.css` holds the product's real dark palette, copied
from `theme/tokens.ts`, so the artwork cannot drift from the app.

`shots/` holds screenshots captured from the live site in demo mode at
`deviceScaleFactor: 2`. `story.html` crops its screenshot with a fixed-height
window and a negative `margin-top` — the offsets in that file are tied to the
capture size, so re-capturing at a different viewport means re-tuning them.

## Regenerating

Re-capture the screenshots (dark theme, demo mode, 2x) into `shots/`, then
render each template to its PNG at the sizes in the table above. Verify the
output dimensions are exact — Instagram letterboxes a story that is even
slightly off.
