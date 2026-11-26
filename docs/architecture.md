# Architecture

## Rendering

One Next.js application, not separate frontend/backend deployments. The homepage, project detail pages, profile, and privacy page are prerendered. Project filtering uses allowlisted URL query values. Unknown project slugs return HTTP 404; loading boundaries are scoped to the dashboard routes so they do not prematurely stream HTTP 200 for unknown projects.

The Insights page uses explicit runtime rendering and shares a server-only Next Data Cache reader with `/api/insights`. A cold request fetches GitHub; subsequent requests reuse the validated aggregate, with request-triggered background revalidation after six hours. Failed refreshes leave the last-good cache untouched. Insights has no SQLite imports or filesystem requirements. The status API still only reads monitoring snapshots and never probes external URLs. The public Status page remains removed. Failures cannot hide project content, navigation, or email links.

The shared layout contains small client islands. Wrapping server-rendered children in the visual preference provider does not make all page content client-rendered.

## Composition

```text
RootLayout
  ThemeProvider
  VisualPreferencesProvider
  ScrollMotionProvider (Lenis + GSAP ticker + shared scene pose)
    ReactiveBackground -> KeyboardBackground -> SceneFrameBridge + Keyboard
                          (Keycaps, Switches/Underglow, PcbTraces; PressedKeys, useRealTyping)
    SceneLoadingStatus
    SceneChoreography
    SiteHeader
    SocialLinks (shared by hero and footer)
    Main
      HomePage
        HeroSection -> HeroSceneLoader -> PortraitScene, SceneInteractionZone
        ProjectGrid -> ProjectCard -> ProjectLogo
        InsightsPreview -> LanguageBreakdown
        About -> ContactSection
      ProjectPage
        ProjectMedia -> CaseStudy -> ArchitectureExplorer -> MediaGallery
      ExpertisePage -> SkillArchitecture -> TechnologyMark
      InsightsPage -> LanguageBreakdown -> ActivityCharts
      ResumePage -> ResumeDocument -> TechnologyMark + SocialLinks + PrintButton
      PrivacyPage / NotFound
    SiteFooter
```

## Animation Ownership

- ScrollMotionProvider owns scrolling and the frame clock. Lenis smooths the native document scroll with `autoRaf` disabled, and a single GSAP ticker callback advances Lenis, updates ScrollTrigger and then dispatches one frame to every renderer root. Both canvases run `frameloop="never"` and are advanced through `SceneFrameBridge`, so scroll position and rendered scene always agree within a frame. Frames are deadline-scheduled to at most 60 Hz, including one-shot redraws, and Lenis is advanced before any render gating so scrolling can never depend on the scene. While Lenis is attached, native `scroll-behavior` is switched off imperatively; the stylesheet keeps smooth scrolling as the no-JavaScript fallback.
- React Three Fiber/Three.js owns the hero's textured portrait planes. The actual transparent portrait is preserved, with shallow parallax and subtle depth shadows rather than an invented face mesh. The texture is owned explicitly through a scene-level LoadingManager rather than left in the `useTexture` cache, so disposal is deterministic and a response arriving after unmount cannot leak. The portrait image stays visible until the canvas has actually drawn a textured frame, and returns if the context is lost.
- GSAP owns scroll-to-scene mapping. `SceneChoreography` measures `[data-scene]` section boxes and maps scroll progress onto the keyboard pose: pan, zoom, tilt, roll, explode amount, focus layer, glow and presence. It uses a plain ScrollTrigger `onUpdate` rather than a scrubbed tween, because Lenis already owns smoothing and a second easing layer would lag the content. Pure interpolation lives in `lib/visuals/scene-choreography.ts`. Section re-measurement is debounced, and a global ScrollTrigger refresh only runs when the document height actually changed and in safe mode, because an unconditional refresh restores scroll position and would cancel an in-flight scroll.
- Framer Motion owns one-time section reveals and in-view logo float animation. Content never starts hidden, preserving no-JavaScript access. Project listing cards render only logos, with screenshots and gameplay isolated to detail pages.
- ReactiveBackground lazily loads KeyboardBackground, one persistent Three.js mechanical keyboard that fills the whole viewport below the content stacking layer with pointer-events disabled. The keyboard is five layers (case, PCB, plate, switches, keycaps) that rise apart as the pose's explode amount grows, so scrolling takes it to pieces (keycaps first, then switches and plate, then the bare board at About) and puts it back together at Contact. Interior routes keep it assembled and dimmer. Everything is procedural: rounded boxes, a plate extruded with one real cutout per switch, instanced switches, underglow and keycaps, a USB cable, and a PCB whose glowing traces are drawn in a fragment shader. Keycap legends (esc, ctrl, git, `</>`, `{}`, enter, ...) are drawn once into a canvas atlas and looked up per instance in the keycap fragment shader, so all 83 legends cost one draw call. The atlas is owned and disposed explicitly, and repainted when the web font arrives. The keyboard uses one dark palette and dark lighting in both site themes; only the page around it changes with the theme. There are no per-frame React renders or buffer reallocations.
- Whole-screen framing lives in the pure `frameScale` and `panLimits` helpers in `lib/visuals/keyboard-layout.ts`: the keyboard is scaled from the viewport aspect, field of view, camera distance and tilt, so it fills the screen on wide, ultra-wide and tall displays, and scroll pans inside whatever room the zoom leaves. Wide screens use 70% of the exact cover scale and a very large desk-mat plane fills the rest, so no edge ever shows. Below 768px the keyboard rolls 90 degrees to fill the tall viewport.
- Real typing is observation only. `useRealTyping` listens passively for `keydown`/`keyup`, maps `KeyboardEvent.code` to a keycap through a fixed table and presses that cap. Only which caps are down is kept, never what was typed: nothing is stored, logged or sent, events are never cancelled so typing, shortcuts and form fields behave as before, and presses are ignored while motion is paused, reduced or the tab is hidden. Held keys are cleared on blur and visibility change so no cap sticks down. Automatic "typists" press three pseudo-random caps from a deterministic schedule.
- CSS owns ordinary hover/focus transitions and all frosted-glass surfaces. WebGL cannot refract the DOM above it, so `backdrop-filter` provides the actual glass on the header, reading panels and structural surfaces, with opaque `@supports` and forced-colors fallbacks and reduced blur on small screens. Project logos are styled as rounded keycap tiles with a raised top face that presses on hover. Reduced motion disables choreography; the canvas can render on demand, pauses in hidden tabs, and falls back to the original portrait after context loss. A header control pauses all visual effects from any page.
- Direct manipulation is opt-in and scoped. `SceneInteractionZone` is a labelled hero control that uses pointer capture, so the background canvas stays `pointer-events: none` and page text selection, links and scrolling are untouched. Arrow keys rotate, Home and Escape reset, and the control redraws on explicit input even while ambient motion is paused. Optional device tilt keeps its existing consent flow.
- The hero no longer exposes the Artistic/Wireframe selector. Portrait/background rendering and the motion-pause controls remain intact; existing internal appearance preference support is retained.

The scene has no external HDR, model, font or decoder requests. A local portrait texture, a procedurally generated in-scene environment, generated geometry and a canvas-drawn legend atlas produce the visual. Scene rendering targets 60 Hz, schedules at most one draw pass per browser frame, and carries deadline remainder forward instead of dropping frames due to timer rounding. Geometry and resolution change only on quality transitions/resizes, never per animation frame.

Performance policy lives in `lib/visuals/scene-performance.ts`. Vertex counts come from `keyboardStats` in `lib/visuals/keyboard-layout.ts` and were checked against the geometry the builders actually produce. A frame issues 9 draw calls on every tier (desk mat, case, glow, board, traces, plate, switches, underglow, keycaps):

| Quality                   | Vertices | Pixel ceiling | Pixel-ratio ceiling | Reflections | Keycap / case corners | Legend tile |
| ------------------------- | -------- | ------------- | ------------------- | ----------- | --------------------- | ----------- |
| Desktop                   | 33,831   | 800,000       | 1                   | on          | rounded (2 / 2)       | 96px        |
| Mobile / lower capability | 20,878   | 180,000       | 0.75                | off         | rounded (1 / 1)       | 64px        |
| Minimal                   | 13,373   | 90,000        | 0.75                | off         | sharp                 | 48px        |
| Static protection         | 13,373   | 90,000        | 0.75                | off         | sharp                 | 48px        |

Device pixel ratio is additionally capped at 2 before the per-tier ceiling applies. Shadow maps are disabled on every tier, and there is no transmission pass. The studio reflections are rendered once from local lightformers and only on the top tier.

Small screens, coarse pointers, <=4 logical cores, or <=4GB reported device memory select the conservative initial tier. Device hints are heuristics, not a reliable hardware benchmark. Two consecutive 2.5-second windows of persistent missed/slow frames lower quality; continued pressure freezes the last surface. Quality never increases again during the mount, avoiding oscillation or repeatedly loading a struggling GPU. Pause/resume resets pressure history. A smaller viewport also lowers the budget; a larger viewport never silently restores higher quality.

The background context uses a depth buffer for real overlapping geometry, no stencil buffer, `preserveDrawingBuffer: false`, and antialiasing only on the top tier. Geometry is merged per layer and instanced where it repeats, so frustum culling is disabled only on instanced meshes whose instances span the whole board. Resize handling is debounced at 120ms. Direct visibility events suspend the frame subscription, and owned GPU resources and listeners are released on unmount: merged geometries, the legend atlas and the portrait texture are disposed by their effect cleanups, React Three Fiber disposes the declaratively created materials, and the scroll controller, the ScrollTrigger context and every event listener are released by their own owner. There is no continuous React state update or layout read in the frame loop.

On low-capability coarse-pointer devices, HeroSceneLoader keeps the actual portrait image and does not initialize the separate portrait canvas. This reserves the single WebGL context for the background keyboard; capable desktop devices retain interactive portrait depth. The hero canvas also stops rendering while it is scrolled out of view. The portrait asset is a real WebP of about 53KB (the source PNG is 1254px; the shipped file is 1000px), small enough that the poster paints with the first frame and the WebGL texture follows without a visible pop. No discrete bokeh sprites or new external assets are used.

Because the keyboard fills the viewport, every block of text sits on a frosted reading surface (`--read-surface`, with `backdrop-filter` and an opaque forced-colors fallback), and a light veil over the canvas keeps the rest of the page legible. The light theme uses a soft sage paper colour rather than near-white, and its grey text shades are chosen to keep WCAG AA contrast on that tone; axe checks in the browser suite enforce this on every page.

DeviceTiltControl only appears on supported coarse-pointer secure contexts. It requests permission inside a deliberate click handler, calibrates relative orientation, adjusts for screen rotation, and handles denial without affecting navigation. Sensors stop driving visuals under pause, reduced motion, or hidden-page conditions. No sensor values are stored or sent. No camera, microphone, or geolocation access is requested.

The scene browser tests distinguish visual capture from performance: `canvas-readback.ts` opts pixel tests into framebuffer retention, while budget/CPU-throttled tests use actual production settings. Rendered frames are counted by clustering draw timestamps, and the budget test asserts the median frame issues exactly the declared number of draws (a stalled scheduler can land two frames closer together than the clustering gap, so up to twice that is tolerated). Tests verify 60 Hz scheduling mathematically, pixel/vertex limits, the largest single draw, a single mobile WebGL canvas, hidden-tab suspension, context loss, scroll-driven change, the opt-in shaping control, that real key presses are never cancelled, and pointer/tilt interaction. Quality adaptation under sustained pressure is covered by pure unit tests rather than a timing-dependent browser test. The mobile benchmark uses 4x Chromium CPU throttling and reports a measured frame-interval distribution. This does not emulate a physical low-end GPU or measure battery/temperature; flawless 60 FPS and zero overheating cannot be guaranteed.

## Content and Data

Shared SocialLinks presents the existing GitHub, LinkedIn, and itch.io logo assets alongside text labels and an email icon. Only identity-verified profile URLs are included. Get in touch uses a native mailto link to kynmmarshall@gmail.com with a percent-encoded subject based on the selected inquiry type. Browser tests verify pointer/keyboard activation while intercepting the external-protocol launch; actual email-client setup and delivery remain outside the site's control.

Compose in Gmail provides a browser-based alternative with the selected subject, without guessing whether a mailto handler exists or automatically opening multiple destinations. It opens only after an explicit click and sends no email automatically.

`content/projects.ts` owns editorial records and the five exact DuckDNS URLs. Project role, stack, evidence links, and media are independent of runtime metrics. The secondary collection includes Math Runner and Plane Game.

Optional project playStore metadata holds the verified app URL, package ID, publisher display name, and public developer URL. Fruit Collector has a verified listing; other projects do not receive speculative store links. Profile navigation points to `/resume`, whose server-rendered ResumeDocument reuses the same project/profile data and logo components. Its route-scoped stylesheet defines readable screen and A4 print layouts. No employment history or qualifications were invented for the document.

`content/github-stack.ts` records the reviewed 2026-09-05 profile stack. A unit test requires every entry to appear in the four expertise pillars. TechnologyMark uses locally bundled Devicon logos, imported game-tool logos, and meaningful symbols for nonbranded practices. Profile-listed entries are distinct from project-evidenced work. This is a reviewed snapshot, not live scraping during page rendering.

Zod validates GitHub responses and cached analytics before they become read models. `lib/server/insights.ts` uses `unstable_cache`, supported by the current non-Cache-Components configuration, to store complete aggregates. Cache keys distinguish authenticated/public collection without including the token. GitHub requests read `GITHUB_TOKEN` only on the server. SQLite remains only for legacy exports, service samples and job locks. Browser components receive serializable data, never tokens, database connections, or probe implementations.

Monitoring takes no visitor-supplied URLs. Host/origin allowlists, public IPv4 checks, pinned DNS resolution, same-origin redirect restrictions, and bounded requests constrain outbound probes. This is not a general-purpose URL proxy.

## Deliberate Scope

No CMS, admin login, tracking analytics, fabricated experience, speculative metrics, or unverified contact form. The playable micro-game remains a separately scoped future feature; it is not in the launch bundle. No deployment scripts are included.
