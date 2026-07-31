# Partner and integration marks

Drop a logo file in this folder and it appears on the site. **No code change is
needed.** `components/labs/Ecosystem.tsx` reads this directory at build time and
renders the real mark for any partner whose id matches a filename here; anything
missing falls back to a monospace wordmark chip, so a brand without a file never
produces a broken image.

## Naming

`<id>.svg` (`.png` and `.webp` also work). The id must match the entry in
`components/labs/Ecosystem.tsx` (the "Runs with your stack" band) or in
`lib/labs/field-work.ts` (`integrations`, the per-deployment "Connects with" row).

**SVG is strongly preferred**: these render small and on a near-black background,
where a low-resolution PNG shows its edges.

## How marks are rendered

As **white knockouts**, not in brand colour (`.ll-partner img` in `app/labs-theme.css`).
That is deliberate and measured: against the `#08090a` canvas several supplied marks
were not legible, KNX at 22 mean luminance, Truckstop at 40, Ship.cars at 52, which
at 65% opacity land near 18, 29 and 37. A knockout fixes all of them at once and
keeps a fifteen-logo row from reading as a badge farm on an otherwise austere page.

To restore brand colour, delete that one rule. Replace the three dark marks above
with light-background variants first, or they will vanish.

## Expected filenames

Present today (14 traced from supplied artwork, plus REPOWR):

| File | Brand | | File | Brand |
|---|---|---|---|---|
| `repowr.svg` | REPOWR | | `tql.svg` | TQL |
| `dat.svg` | DAT | | `trinity.svg` | Trinity Logistics |
| `truckstop.svg` | Truckstop | | `landstar.svg` | Landstar |
| `chrobinson.svg` | C.H. Robinson | | `werner.svg` | Werner |
| `schneider.svg` | Schneider | | `spot.svg` | Spot |
| `echo.svg` | Echo | | `ntg.svg` | Nolan (NTG) |
| `loadsmart.svg` | Loadsmart | | `shipcars.svg` | Ship.cars |
| `knx.svg` | KNX Logistics | | | |

Still missing, so still showing its name in the mark slot: **`nfi.svg`** (or `nfi.png`).

## Render size

Do not set per-logo heights. Every mark sits in an identical cell (108px wide, 44px
tall) and is scaled to fit with `object-fit: contain`, which is what makes a row of
wide wordmarks and square badge icons read as one grid. An earlier per-brand
`LOGO_HEIGHTS` map was removed once the cell took over sizing.

A note on weight: these were traced from raster art, so a few are heavy for what
they are. `ntg.svg` is 238 KB raw (88 KB gzipped) to draw a 24px silhouette,
`shipcars.svg` 122 KB and `spot.svg` 97 KB. They are static and CDN-cached so this
is not urgent, but an official SVG from the brand's press kit would be both sharper
and far smaller if one is easy to get.

Wanted for the "Runs with your stack" band:

| File | Brand | Category |
|---|---|---|
| `mcleod.svg` | McLeod | Transportation management |
| `trimble.svg` | Trimble | Transportation management |
| `mercurygate.svg` | MercuryGate | Transportation management |
| `roserocket.svg` | Rose Rocket | Transportation management |
| `motive.svg` | Motive | Telematics and ELD |
| `samsara.svg` | Samsara | Telematics and ELD |
| `omnitracs.svg` | Omnitracs | Telematics and ELD |
| `geotab.svg` | Geotab | Telematics and ELD |
| `project44.svg` | project44 | Visibility |
| `fourkites.svg` | FourKites | Visibility |
| `macropoint.svg` | MacroPoint | Visibility |
| `transporeon.svg` | Transporeon | Visibility |
| `dat.svg` | DAT | Spot market |
| `truckstop.svg` | Truckstop | Spot market |
| `chrobinson.svg` | C.H. Robinson | Spot market |
| `schneider.svg` | Schneider | Spot market |

Wanted for the Rapid Load "Connects with" row:

| File | Brand |
|---|---|
| `echo.svg` | Echo |
| `loadsmart.svg` | Loadsmart |
| `knx.svg` | KNX Logistics |
| `tql.svg` | TQL |
| `nfi.svg` | NFI Industries |
| `werner.svg` | Werner |
| `trinity.svg` | Trinity Logistics |
| `landstar.svg` | Landstar |
| `spot.svg` | Spot |
| `ntg.svg` | Nolan (NTG) |
| `shipcars.svg` | Ship.cars |

## Render height

Marks render at 65% opacity and go to full opacity on hover (`.ll-partner` in
`app/labs-theme.css`). That muting is what lets full-colour third-party logos sit in
an otherwise austere palette without dominating it.

Per-brand heights live in `LOGO_HEIGHTS` in `Ecosystem.tsx`, defaulting to 20px.
Wordmark-shaped logos (a word set in type, like Truckstop) need less height than
square icon marks to carry the same visual weight. If a new logo looks too big or
too small next to its neighbours, adjust its entry there rather than editing the SVG.

## A note on usage

These marks indicate compatibility and integration. They are not customer logos and
imply no endorsement, which is why the row is headed "Connects with" and why the
Terms carry a third-party trademark notice. Keep it that way unless a brand is
genuinely a named customer or partner.
