# Haircut

A phone-friendly personal haircut lookbook: 10 cuts for today and 5 grow-out goals. Each includes an AI preview, barber notes, styling steps, daily effort, change level, styling time, and trim interval.

Open `index.html` directly for a local preview, or run `python3 -m http.server 8000` here and visit http://localhost:8000. No build or dependencies are needed. GitHub Pages serves the root of `main` at https://talrme.github.io/haircut/.

## Controls

- Drag the six-dot handle to reorder cards on touch or desktop. Hold near the top or bottom of the screen to scroll during dragging.
- Move up/down buttons and arrow keys on the handle provide accessible alternatives.
- Order and favorites save in browser localStorage on this device; they do not sync between devices or between localhost and the published site.
- Filter all, today, grow into, or saved. Reordering a filtered list moves the chosen card in the global order.
- Open a card for the full plan, copy its barber notes, or print it. Individual styles support direct links such as `#style-03`.
- Reset order restores the original sequence and keeps favorites.

## Images and recommendations

The 15 WebP previews in `assets/` were generated individually with the built-in image_gen tool using the supplied photos as identity, texture, and profile references. `generation-prompts.json` records the exact prompt set. The original user photos are not included in this repository. AI images can vary from the user's actual appearance and attainable result; the barber should confirm dry length, density, wave, and crown direction. Lengths, maintenance ratings, styling times, and trim intervals are editorial estimates. Growth timelines assume preserving current length and vary individually.

Hair-care and growth references are linked within the page. The site has no external fonts, analytics, accounts, or runtime dependencies.
