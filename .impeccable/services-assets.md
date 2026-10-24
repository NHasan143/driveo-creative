# Services photography

The approved four-panel Services gallery uses four portrait photographs generated with native imagegen from the approved mockup’s photographic references. These are illustrative chauffeur scenes. The gallery uses full photographs with overlaid labels and arrows; no comp crops ship as page assets.

| Asset | Dimensions | Exact generation prompt |
| --- | --- | --- |
| `frontend/public/media/services/gallery-airport-transfer.png` | 1024 × 1536 | [Airport prompt](build/gallery-crops/airport-photo.prompt.txt) |
| `frontend/public/media/services/gallery-point-to-point.png` | 1024 × 1536 | [Point-to-point prompt](build/gallery-crops/journey-photo.prompt.txt) |
| `frontend/public/media/services/gallery-hourly-hire.png` | 1024 × 1536 | [Hourly prompt](build/gallery-crops/hourly-photo.prompt.txt) |
| `frontend/public/media/services/gallery-private-events.png` | 1024 × 1536 | [Events prompt](build/gallery-crops/events-photo.prompt.txt) |

Every shipping PNG embeds its exact generation prompt in an `impeccable:prompt` PNG text chunk, matching the linked local prompt file. Recover it with `impeccable embed-prompt <asset> --read`. Next.js optimizes these portrait masters for delivery at the requested responsive size.

The four earlier landscape assets have been removed; `frontend/src/config/services.ts` maps the gallery to the portrait assets listed here.
