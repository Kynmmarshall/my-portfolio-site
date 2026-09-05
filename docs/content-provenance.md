# Content and Media Provenance

Research date: 2026-09-05. Public-page visibility is not independent verification of production performance or ownership of third-party artwork.

## Identity

- Existing `home.html`: full name, portrait, GitHub, LinkedIn and itch.io URLs, original game descriptions.
- https://github.com/Kynmmarshall and the profile README: public bio, contact email, languages, game/DevOps interests and repository links.
- https://www.linkedin.com/in/kamdeu-yamdjeuson-neil-marshall-a70566298 is identity-correlated, but its profile body was unavailable. No employment dates, degrees, certificates, or titles were inferred.

## Project Evidence

- BatchIt: https://batchit.duckdns.org identifies Kamdeu's ScrumMaster, DevOps/VPS, pipeline and localisation contribution. It is team work; no team headcount is repeated because the page is inconsistent. The backend framework is not assigned from speculation.
- Pick My Dish: https://github.com/Kynmmarshall/Pick-My-Dish documents the Flutter/Provider, Node/Express, PostgreSQL and Jenkins boundaries. The case study credits the co-developer. Architecture labels say documented, not independently audited production topology. README uptime/coverage claims are not displayed as measured results.
- Fruit Collector: https://fruitcollector.duckdns.org documents Flutter/Flame, controls and progression. Source mapping to MobileGame comes from the GitHub profile.
- Trip-io: https://trip-io.duckdns.org documents the public product. Its browser app remained on the splash screen during capture, so the portfolio shows an actual screenshot of the project website. No backend framework or source repository mapping is guessed.
- Grid Survival: https://github.com/Kynmmarshall/Grid_Survival and its profile gameplay GIF. Math Runner and Plane Game additionally link to the developer's exact itch.io pages.

## Assets

Source inventory: `content/media.ts`. Generated provenance/checksums/dimensions: `public/media/manifest.json`. Original downloaded game GIFs are retained locally under ignored `.data/original-media/`; optimized covers and short previews are served from `public/media/`.

Imported assets include 13 numbered BatchIt screens; genuine Pick My Dish recipe, home, favourites and detail screens; Fruit Collector screenshots; five gameplay GIF conversions; the existing portrait; and the Trip-io website capture. Ninja Game footage is collected but not presented as an extra featured project.

The Pick My Dish README's placeholder screenshot was excluded. Actual screenshots came from its `website/images` directory. Team member portraits were not imported. Game sprites and underlying map/photo assets retain their original creators' rights: the portfolio presents screenshots of the developer's work, not a claim to have authored every depicted asset. Fruit Collector's credits screen is included in the asset inventory. Confirm any broader redistribution permissions before repurposing isolated third-party assets.

The hero uses the existing transparent portrait, with layered Three.js planes and procedural contour lines behind it. The original portrait is also the no-WebGL fallback. Browser tests capture the raw framebuffer separately, without baking overlaid HTML into an image. No reference-site graphics, code, or copy were reused. The site's original static files remain preserved.

## Project Logos

The listing artwork is separate from detail media. `content/logos.ts` records seven observed branding sources; `npm run assets:logos` creates optimized local WebP versions and `public/media/logos.json` records source URLs, dimensions, hashes, and import times. Screenshots and gameplay are not used on listing cards.

- BatchIt, Fruit Collector, and Trip-io: logo files published on their public project websites.
- Pick My Dish: the project's `website/images/logo.png` repository asset.
- Grid Survival: `GridSurvivalWebsite/assets/logo.png`.
- Math Runner: the original `MATH-RUNNER/Assets/Menu/Title.png` title artwork.
- Plane Game: the developer's published itch.io header branding (the original plane mark), not a fabricated replacement.
