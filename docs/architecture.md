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

The scene has no external HDR/model requests. A local portrait texture and procedural terrain produce the visual. The terrain uses 5,525 vertices, 10,752 triangles, one draw call, an expanded bounding sphere for shader displacement, and frustum culling. Pixel ratio caps are 1 on mobile and 1.5 on desktop; render targets are 24 and 30 FPS respectively. ResizeObserver updates are debounced at 120ms, and all GPU resources/listeners are disposed on unmount. Depth-dependent line widening and a restrained halo approximate defocus without expensive postprocessing. No discrete bokeh sprites are used.

DeviceTiltControl only appears on supported coarse-pointer secure contexts. It requests permission inside a deliberate click handler, calibrates relative orientation, adjusts for screen rotation, and handles denial without affecting navigation. Sensors stop driving visuals under pause, reduced motion, or hidden-page conditions. No sensor values are stored or sent. No camera, microphone, or geolocation access is requested.

The terrain browser test measures draw-call frequency and WebGL submission duration in its environment. That is not an end-to-end GPU completion, input-latency, battery, or all-device benchmark; zero lag cannot be guaranteed.

## Content and Data

Shared SocialLinks presents the existing GitHub, LinkedIn, and itch.io logo assets alongside text labels and an email icon. Only identity-verified profile URLs are included. Get in touch uses a native mailto link to kynmmarshall@gmail.com with a percent-encoded subject based on the selected inquiry type. Browser tests verify pointer/keyboard activation while intercepting the external-protocol launch; actual email-client setup and delivery remain outside the site's control.

`content/projects.ts` owns editorial records and the five exact DuckDNS URLs. Project role, stack, evidence links, and media are independent of runtime metrics. The secondary collection includes Math Runner and Plane Game.

Optional project playStore metadata holds the verified app URL, package ID, publisher display name, and public developer URL. Fruit Collector has a verified listing; other projects do not receive speculative store links. Profile navigation points to `/resume`, whose server-rendered ResumeDocument reuses the same project/profile data and logo components. Its route-scoped stylesheet defines readable screen and A4 print layouts. No employment history or qualifications were invented for the document.

`content/github-stack.ts` records the reviewed 2026-09-05 profile stack. A unit test requires every entry to appear in the four expertise pillars. TechnologyMark uses locally bundled Devicon logos, imported game-tool logos, and meaningful symbols for nonbranded practices. Profile-listed entries are distinct from project-evidenced work. This is a reviewed snapshot, not live scraping during page rendering.

Zod validates GitHub responses and persisted analytics before they become read models. SQLite stores last-good snapshots, service samples, and expiring job locks. The server-only read facade is the only data access used by routes. Browser components receive serializable data, never tokens, database connections, or probe implementations.

Monitoring takes no visitor-supplied URLs. Host/origin allowlists, public IPv4 checks, pinned DNS resolution, same-origin redirect restrictions, and bounded requests constrain outbound probes. This is not a general-purpose URL proxy.

## Deliberate Scope

No CMS, admin login, tracking analytics, fabricated experience, speculative metrics, or unverified contact form. The playable micro-game remains a separately scoped future feature; it is not in the launch bundle. No deployment scripts are included.
