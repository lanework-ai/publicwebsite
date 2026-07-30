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

## Expected filenames

Present today:

| File | Brand |
|---|---|
| `repowr.svg` | REPOWR |

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
