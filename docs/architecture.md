# Architecture

## Rendering

One Next.js application, not separate frontend/backend deployments. The homepage, project detail pages, profile, and privacy page are prerendered. Project filtering uses allowlisted URL query values. Unknown project slugs return HTTP 404; loading boundaries are scoped to the dashboard routes so they do not prematurely stream HTTP 200 for unknown projects.

Insights/status pages use explicit runtime rendering and read SQLite snapshots. Their GET APIs never trigger GitHub calls or probe external URLs. Failures cannot hide project content, navigation, or email links.

The shared layout contains small client islands. Wrapping server-rendered children in the visual preference provider does not make all page content client-rendered.

## Composition

```text
RootLayout
  VisualPreferencesProvider
  SiteHeader
  Main
    HomePage
      HeroSection -> HeroSceneLoader -> ArchitecturalScene
      ProjectGrid -> ProjectCard -> ProjectMedia
      SkillArchitecture
      InsightsPreview -> LanguageBreakdown
      About -> ContactSection
    ProjectPage
      ProjectMedia -> CaseStudy -> ArchitectureExplorer -> MediaGallery
    InsightsPage -> LanguageBreakdown -> ActivityCharts
    StatusPage -> StatusDashboard
    ResumePage / PrivacyPage / NotFound
  SiteFooter
```

## Animation Ownership

- React Three Fiber/Three.js owns a single hero canvas and imperative per-frame geometry changes.
- GSAP owns a scoped hero scroll-progress ref. It cleans up ScrollTrigger on preference/visibility changes and does not animate React-owned DOM transforms.
- Framer Motion owns one-time section reveals. Content never starts hidden, preserving no-JavaScript access.
- CSS owns ordinary hover/focus transitions. Reduced motion disables choreography; the canvas can render on demand, pauses offscreen/in hidden tabs, and falls back to a local rendered poster after context loss.
- Artistic/wireframe changes materials in the existing canvas. No duplicate WebGL context is created for a mode switch. Browser storage failure falls back to session memory.

The scene has no external HDR/model requests. Locally constructed geometry, lights, and environment reflection produce the visual. No camera, microphone, or geolocation access is requested.

## Content and Data

`content/projects.ts` owns editorial records and the five exact DuckDNS URLs. Project role, stack, evidence links, and media are independent of runtime metrics. The secondary collection includes Math Runner and Plane Game.

Zod validates GitHub responses and persisted analytics before they become read models. SQLite stores last-good snapshots, service samples, and expiring job locks. The server-only read facade is the only data access used by routes. Browser components receive serializable data, never tokens, database connections, or probe implementations.

Monitoring takes no visitor-supplied URLs. Host/origin allowlists, public IPv4 checks, pinned DNS resolution, same-origin redirect restrictions, and bounded requests constrain outbound probes. This is not a general-purpose URL proxy.

## Deliberate Scope

No CMS, admin login, tracking analytics, fabricated experience, speculative metrics, or unverified contact form. The playable micro-game remains a separately scoped future feature; it is not in the launch bundle. No deployment scripts are included.
