# Content and Media Provenance

Research date: 2026-09-05. Public-page visibility is not independent verification of production performance or ownership of third-party artwork.

## Identity

- Existing `home.html`: full name, portrait, GitHub, LinkedIn and itch.io URLs, original game descriptions.
- https://github.com/Kynmmarshall and the profile README: public bio, contact email, languages, game/DevOps interests and repository links.
- WhatsApp: the user supplied 676093910 and the original home.html already linked the same number with Cameroon's +237 prefix. The published click-to-chat URL is https://wa.me/237676093910, with no plus sign or spaces in the URL.
- https://www.linkedin.com/in/kamdeu-yamdjeuson-neil-marshall-a70566298 is identity-correlated, but its profile body was unavailable. No employment dates, degrees, certificates, or titles were inferred.

## Project Evidence

- BatchIt: https://batchit.duckdns.org identifies Kamdeu's ScrumMaster, DevOps/VPS, pipeline and localisation contribution. It is team work; no team headcount is repeated because the page is inconsistent. The backend framework is not assigned from speculation.
- Pick My Dish: https://github.com/Kynmmarshall/Pick-My-Dish documents the Flutter/Provider, Node/Express, PostgreSQL and Jenkins boundaries. The case study credits the co-developer. Architecture labels say documented, not independently audited production topology. README uptime/coverage claims are not displayed as measured results.
- Fruit Collector: https://fruitcollector.duckdns.org documents Flutter/Flame, controls and progression. Source mapping to MobileGame comes from the GitHub profile.
- Google Play: https://play.google.com/store/apps/details?id=com.kynmmarshall.fruitcollector&hl=fr was supplied by the user and retrieved on 2026-09-05. It identifies the game as fruit collector and the developer as Kamdeu Yamdjeuson Neil Marshall, linking to https://play.google.com/store/apps/developer?id=Kamdeu+Yamdjeuson+Neil+Marshall. The portfolio uses this single verified account and app; volatile download/rating statistics are not copied. Store-published data-safety statements are not treated as an independent audit.
- Trip-io: https://trip-io.duckdns.org documents the public product. Six later user-supplied application screenshots (destinations, itinerary, map, assistant, chat, About) now populate the detail page instead of the earlier website capture. The original PNGs remain intact; optimized copies and hashes are recorded in `public/media/projects/trip-io/screenshots.json`. No backend framework or source repository mapping is guessed.
- Grid Survival: https://github.com/Kynmmarshall/Grid_Survival and its profile gameplay GIF. Math Runner and Plane Game additionally link to the developer's exact itch.io pages.

## Assets

Source inventory: `content/media.ts`. Generated provenance/checksums/dimensions: `public/media/manifest.json`. Original downloaded game GIFs are retained locally under ignored `.data/original-media/`; optimized covers and short previews are served from `public/media/`.

Imported assets include 13 numbered BatchIt screens; genuine Pick My Dish recipe, home, favourites and detail screens; Fruit Collector screenshots; five gameplay GIF conversions; the existing portrait; and the Trip-io website capture. Ninja Game footage is collected but not presented as an extra featured project.

The Pick My Dish README's placeholder screenshot was excluded. Actual screenshots came from its `website/images` directory. Team member portraits were not imported. Game sprites and underlying map/photo assets retain their original creators' rights: the portfolio presents screenshots of the developer's work, not a claim to have authored every depicted asset. Fruit Collector's credits screen is included in the asset inventory. Confirm any broader redistribution permissions before repurposing isolated third-party assets.

The hero uses the existing transparent portrait, with layered Three.js planes and the global procedural terrain behind it. The original portrait is also the no-WebGL fallback. Browser tests capture the raw framebuffer separately, without baking overlaid HTML into an image. No reference-site graphics, code, or copy were reused. The site's original static files remain preserved.

## Expertise and Technology Marks

- `content/github-stack.ts` records all 31 unique badge technologies plus Java, OpenGL, and the custom C++ engine named in the profile text, reviewed on 2026-09-05. Duplicated Jenkins badges are represented once. Profile-listed tools without project-level verification are labeled accordingly rather than given invented proficiency levels.
- Standard logos come from pinned Devicon 2.17.0 SVG assets bundled locally. The library's license is available in `node_modules/devicon/LICENSE`; each trademark remains the property of its owner. TeX uses the familiar LaTeX wordmark and is labeled Typesetting / LaTeX.
- Flame's logo is the image linked by the official flame-engine/flame README. Pygame's wordmark comes from its official logos documentation. `jobs/prepare-tool-logos.ts` records original URLs and asset hashes.
- Tiled uses a named map-grid symbol: the initially located itch.io banner was unsuitable as a small application mark and is not rendered. GLSL, graphics.h, and nonbranded practices also use semantic Lucide icons rather than fabricated official logos.

## Project Logos

The listing artwork is separate from detail media. `content/logos.ts` records seven observed branding sources; `npm run assets:logos` creates optimized local WebP versions and `public/media/logos.json` records source URLs, dimensions, hashes, and import times. Screenshots and gameplay are not used on listing cards.

- BatchIt, Fruit Collector, and Trip-io: logo files published on their public project websites.
- Pick My Dish: the project's `website/images/logo.png` repository asset.
- Grid Survival: `GridSurvivalWebsite/assets/logo.png`.
- Math Runner: the original `MATH-RUNNER/Assets/Menu/Title.png` title artwork.
- Plane Game: the developer's published itch.io header branding (the original plane mark), not a fabricated replacement.
