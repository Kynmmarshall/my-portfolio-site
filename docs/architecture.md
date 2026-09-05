# Architecture

## Rendering

One Next.js application, not separate frontend/backend deployments. The homepage, project detail pages, profile, and privacy page are prerendered. Project filtering uses allowlisted URL query values. Unknown project slugs return HTTP 404; loading boundaries are scoped to the dashboard routes so they do not prematurely stream HTTP 200 for unknown projects.

The Insights page uses explicit runtime rendering and reads SQLite snapshots. Read-only GET APIs never trigger GitHub calls or probe external URLs. The public Status page and its navigation/sitemap entries have been removed; the existing monitoring API, jobs, and stored observations remain intact. Failures cannot hide project content, navigation, or email links.

The shared layout contains small client islands. Wrapping server-rendered children in the visual preference provider does not make all page content client-rendered.

## Composition

```text
RootLayout
  VisualPreferencesProvider
  SiteHeader
  SocialLinks (shared by hero and footer)
  Main
    ReactiveBackground -> TerrainBackground
    HomePage
      HeroSection -> HeroSceneLoader -> PortraitScene
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

- React Three Fiber/Three.js owns the hero's textured portrait planes. The actual transparent portrait is preserved, with shallow parallax and subtle depth shadows rather than an invented face mesh. A Suspense boundary inside the canvas contains texture loading and prevents WebGL context disposal during initialization. The old hero contour shader was removed in favor of the global terrain.
- GSAP owns a scoped hero scroll-progress ref. It cleans up ScrollTrigger on preference/visibility changes and does not animate React-owned DOM transforms.
- Framer Motion owns one-time section reveals and in-view logo float animation. Content never starts hidden, preserving no-JavaScript access. Project listing cards render only logos, with screenshots and gameplay isolated to detail pages.
- ReactiveBackground lazily loads TerrainBackground, one persistent Three.js wireframe surface below the content stacking layer with pointer-events disabled. All vertex displacement happens on the GPU. Camera parallax reads desktop pointer input or explicitly enabled device orientation, and scrolling offsets the ripple phase. There are no per-frame React renders or vertex-buffer reallocations.
- CSS owns ordinary hover/focus transitions. Reduced motion disables choreography; the canvas can render on demand, pauses offscreen/in hidden tabs, and falls back to the original portrait after context loss. A header control pauses all visual effects from any page.
- The hero no longer exposes the Artistic/Wireframe selector. Portrait/background rendering and the motion-pause controls remain intact; existing internal appearance preference support is retained.

The scene has no external HDR/model requests. A local portrait texture and procedural terrain produce the visual. Terrain rendering targets 60 Hz, schedules at most one draw per browser frame, and carries deadline remainder forward instead of dropping frames due to timer rounding. Geometry and resolution change only on quality transitions/resizes, never per animation frame. Camera matrices are updated only while input is settling.

Performance policy lives in `lib/visuals/terrain-performance.ts`:

| Quality                   | Vertices | Triangles | Pixel ceiling | Pixel-ratio ceiling |
| ------------------------- | -------- | --------- | ------------- | ------------------- |
| Desktop                   | 3,185    | 6,144     | 800,000       | 1                   |
| Mobile / lower capability | 1,271    | 2,400     | 180,000       | 0.75                |
| Minimal                   | 475      | 864       | 90,000        | 0.75                |
| Static protection         | 475      | 864       | 90,000        | 0.75                |

Small screens, coarse pointers, <=4 logical cores, or <=4GB reported device memory select the conservative initial tier. Device hints are heuristics, not a reliable hardware benchmark. Two consecutive 2.5-second windows of persistent missed/slow frames lower quality; continued pressure freezes the last surface. Quality never increases again during the mount, avoiding oscillation or repeatedly loading a struggling GPU. Pause/resume resets pressure history. A smaller viewport also lowers the budget; a larger viewport never silently restores higher quality.

The one terrain draw uses no depth/stencil buffer, no antialiasing, and `preserveDrawingBuffer: false`. The low-power shader removes the halo calculation; the desktop halo uses smoothstep instead of per-fragment exp/pow. Derivative-based line softening still suggests depth without expensive full-screen postprocessing. An expanded bounding sphere includes shader displacement and preserves frustum culling. ResizeObserver updates are debounced at 120ms. Direct visibility events and IntersectionObserver suspend the animation loop, and all GPU resources/listeners are disposed on unmount. There is no continuous React state update or layout read in the frame loop.

On low-capability coarse-pointer devices, HeroSceneLoader keeps the actual portrait image and does not initialize the separate portrait canvas. This reserves the single WebGL context for the requested terrain background; capable desktop devices retain interactive portrait depth. No discrete bokeh sprites or new external assets are used.

DeviceTiltControl only appears on supported coarse-pointer secure contexts. It requests permission inside a deliberate click handler, calibrates relative orientation, adjusts for screen rotation, and handles denial without affecting navigation. Sensors stop driving visuals under pause, reduced motion, or hidden-page conditions. No sensor values are stored or sent. No camera, microphone, or geolocation access is requested.

The terrain browser tests distinguish visual capture from performance: `canvas-readback.ts` opts pixel tests into framebuffer retention, while budget/CPU-throttled tests use actual production settings. Tests verify 60 Hz scheduling mathematically, pixel/vertex limits, adaptation under injected slow intervals, a single mobile WebGL canvas, hidden-tab suspension, context loss, and pointer/tilt interaction. The mobile benchmark uses 4x Chromium CPU throttling and reports a measured frame-interval distribution. This does not emulate a physical low-end GPU or measure battery/temperature; flawless 60 FPS and zero overheating cannot be guaranteed.

## Content and Data

Shared SocialLinks presents the existing GitHub, LinkedIn, and itch.io logo assets alongside text labels and an email icon. Only identity-verified profile URLs are included. Get in touch uses a native mailto link to kynmmarshall@gmail.com with a percent-encoded subject based on the selected inquiry type. Browser tests verify pointer/keyboard activation while intercepting the external-protocol launch; actual email-client setup and delivery remain outside the site's control.

`content/projects.ts` owns editorial records and the five exact DuckDNS URLs. Project role, stack, evidence links, and media are independent of runtime metrics. The secondary collection includes Math Runner and Plane Game.

Optional project playStore metadata holds the verified app URL, package ID, publisher display name, and public developer URL. Fruit Collector has a verified listing; other projects do not receive speculative store links. Profile navigation points to `/resume`, whose server-rendered ResumeDocument reuses the same project/profile data and logo components. Its route-scoped stylesheet defines readable screen and A4 print layouts. No employment history or qualifications were invented for the document.

`content/github-stack.ts` records the reviewed 2026-09-05 profile stack. A unit test requires every entry to appear in the four expertise pillars. TechnologyMark uses locally bundled Devicon logos, imported game-tool logos, and meaningful symbols for nonbranded practices. Profile-listed entries are distinct from project-evidenced work. This is a reviewed snapshot, not live scraping during page rendering.

Zod validates GitHub responses and persisted analytics before they become read models. SQLite stores last-good snapshots, service samples, and expiring job locks. The server-only read facade is the only data access used by routes. Browser components receive serializable data, never tokens, database connections, or probe implementations.

Monitoring takes no visitor-supplied URLs. Host/origin allowlists, public IPv4 checks, pinned DNS resolution, same-origin redirect restrictions, and bounded requests constrain outbound probes. This is not a general-purpose URL proxy.

## Deliberate Scope

No CMS, admin login, tracking analytics, fabricated experience, speculative metrics, or unverified contact form. The playable micro-game remains a separately scoped future feature; it is not in the launch bundle. No deployment scripts are included.
