export type Project = {
  slug: string;
  title: string;
  category: "Applications" | "Games";
  number: string;
  description: string;
  role: string;
  stack: string[];
  liveUrl: string;
  sourceUrl?: string;
  playStore?: {
    url: string;
    developer: string;
    developerUrl: string;
    packageId: string;
  };
  color: string;
  logo: string;
  cover: string;
  gallery: string[];
  video?: string;
  portrait?: boolean;
  featured: boolean;
  problem: string;
  approach: string;
  highlights: string[];
  evidence: { label: string; url: string }[];
};

export const projects: Project[] = [
  {
    slug: "batchit",
    title: "BatchIt",
    number: "01",
    category: "Applications",
    description: "A little community. A lot more buying power.",
    role: "ScrumMaster / DevOps / localisation",
    stack: ["Flutter", "Dart", "CI/CD", "VPS"],
    liveUrl: "https://batchit.duckdns.org",
    sourceUrl: "https://github.com/Kynmmarshall/BatchIt",
    color: "mint",
    logo: "/media/projects/batchit/logo.webp",
    cover: "/media/projects/batchit/screen-10.webp",
    portrait: true,
    gallery: [
      "/media/projects/batchit/screen-10.webp",
      "/media/projects/batchit/screen-3.webp",
      "/media/projects/batchit/screen-5.webp",
      "/media/projects/batchit/screen-4.webp",
      "/media/projects/batchit/screen-12.webp",
      "/media/projects/batchit/cover.webp",
    ],
    featured: true,
    problem:
      "Buying alone can make everyday essentials more expensive. BatchIt brings nearby shoppers together to pool purchases and coordinate a shared order.",
    approach:
      "My contribution brings delivery and product execution together: ScrumMaster responsibilities, VPS setup, deployment automation, and localisation. The product is collaborative work, with dedicated contributors across backend, maps, chat, and core Flutter features.",
    highlights: [
      "Neighbourhood batch discovery and shared order progress",
      "Automated delivery pipeline and VPS hosting",
      "French and English localisation",
      "A collaborative product with clearly defined team roles",
    ],
    evidence: [
      { label: "Product and team", url: "https://batchit.duckdns.org/#team" },
      {
        label: "Source repository",
        url: "https://github.com/Kynmmarshall/BatchIt",
      },
    ],
  },
  {
    slug: "fruit-collector",
    title: "Fruit Collector",
    number: "02",
    category: "Games",
    description: "Small pixels. Precise physics. One more level.",
    role: "Game development",
    stack: ["Flutter", "Flame", "Dart", "Tiled"],
    liveUrl: "https://fruitcollector.duckdns.org",
    sourceUrl: "https://github.com/Kynmmarshall/MobileGame",
    playStore: {
      url: "https://play.google.com/store/apps/details?id=com.kynmmarshall.fruitcollector&hl=fr",
      developer: "Kamdeu Yamdjeuson Neil Marshall",
      developerUrl:
        "https://play.google.com/store/apps/developer?id=Kamdeu+Yamdjeuson+Neil+Marshall",
      packageId: "com.kynmmarshall.fruitcollector",
    },
    color: "lilac",
    logo: "/media/projects/fruit-collector/logo.webp",
    cover: "/media/projects/fruit-collector/cover.webp",
    gallery: [
      "/media/projects/fruit-collector/cover.webp",
      "/media/projects/fruit-collector/menu.webp",
      "/media/projects/fruit-collector/level-4.webp",
    ],
    video: "/media/projects/fruit-collector/preview.mp4",
    featured: true,
    problem:
      "A platformer lives or dies by how it feels. Fruit Collector explores movement, collision, progression, and readable level design within a mobile-friendly game.",
    approach:
      "Built with Flutter and the Flame engine, the game combines character animation and collision-driven gameplay with touch and keyboard controls. SharedPreferences persists progress. Game-art credits remain with their respective creators.",
    highlights: [
      "Published on Google Play for Android",
      "Five levels and four selectable characters",
      "Touch and keyboard input",
      "Collision, gravity, and movement systems",
      "Locally saved progression",
    ],
    evidence: [
      {
        label: "Google Play release",
        url: "https://play.google.com/store/apps/details?id=com.kynmmarshall.fruitcollector&hl=fr",
      },
      {
        label: "Game and technical details",
        url: "https://fruitcollector.duckdns.org",
      },
      {
        label: "Source repository",
        url: "https://github.com/Kynmmarshall/MobileGame",
      },
    ],
  },
  {
    slug: "pick-my-dish",
    title: "Pick My Dish",
    number: "03",
    category: "Applications",
    description: "From what's in your kitchen to what's for dinner.",
    role: "Co-development / delivery automation",
    stack: ["Flutter", "Node.js", "PostgreSQL", "Jenkins"],
    liveUrl: "https://pickmydish.duckdns.org",
    sourceUrl: "https://github.com/Kynmmarshall/Pick-My-Dish",
    color: "peach",
    logo: "/media/projects/pick-my-dish/logo.webp",
    cover: "/media/projects/pick-my-dish/cover.webp",
    portrait: true,
    gallery: [
      "/media/projects/pick-my-dish/cover.webp",
      "/media/projects/pick-my-dish/recipes.webp",
      "/media/projects/pick-my-dish/detail.webp",
    ],
    featured: true,
    problem:
      "Choosing a recipe involves more than a search term. Available ingredients, time, and mood all shape what people actually want to cook.",
    approach:
      "Co-developed with Tuheu Tchoubi Pempem Moussa Fahdil. The documented architecture separates Flutter/Provider presentation from Node.js/Express services and PostgreSQL persistence. The repository includes a Jenkins pipeline for analysis, testing, packaging, and delivery.",
    highlights: [
      "Mood, ingredient, and cooking-time discovery",
      "Saved favourites and recipe details",
      "Documented layered architecture and design patterns",
      "Jenkins build and release pipeline",
    ],
    evidence: [
      {
        label: "Architecture and contributors",
        url: "https://github.com/Kynmmarshall/Pick-My-Dish",
      },
      {
        label: "Build pipeline",
        url: "https://github.com/Kynmmarshall/Pick-My-Dish/blob/main/jenkinsfile",
      },
    ],
  },
  {
    slug: "trip-io",
    title: "Trip-io",
    number: "04",
    category: "Applications",
    description: "A better day out, built around Yaounde.",
    role: "Application development",
    stack: ["Cross-platform", "Itineraries", "Localisation"],
    liveUrl: "https://trip-io.duckdns.org",
    color: "blue",
    logo: "/media/projects/trip-io/logo.webp",
    cover: "/media/projects/trip-io/destinations.webp",
    gallery: [
      "/media/projects/trip-io/destinations.webp",
      "/media/projects/trip-io/itinerary.webp",
      "/media/projects/trip-io/map.webp",
      "/media/projects/trip-io/tia-assistant.webp",
      "/media/projects/trip-io/chat.webp",
      "/media/projects/trip-io/about.webp",
    ],
    featured: true,
    problem:
      "Discovering a city is one thing; fitting its destinations into a useful day plan is another. Trip-io focuses on real places in Cameroon's capital.",
    approach:
      "The application brings curated destinations and timed itineraries together, with English and French support. Its public distribution includes Android, Windows, and a browser app. The portfolio keeps its backend and repository mapping unspecified until verified.",
    highlights: [
      "Curated destinations around Yaounde",
      "Time-aware itinerary planning",
      "English and French",
      "Android, Windows, and web distribution",
    ],
    evidence: [
      { label: "Project website", url: "https://trip-io.duckdns.org" },
      { label: "Browser app", url: "https://trip-io.duckdns.org/app/" },
    ],
  },
  {
    slug: "grid-survival",
    title: "Grid Survival",
    number: "05",
    category: "Games",
    description: "Think ahead. Keep moving. Survive the grid.",
    role: "Game development",
    stack: ["Python", "Pygame", "Game logic"],
    liveUrl: "https://grid-survival.duckdns.org",
    sourceUrl: "https://github.com/Kynmmarshall/Grid_Survival",
    color: "yellow",
    logo: "/media/projects/grid-survival/logo.webp",
    cover: "/media/projects/grid-survival/cover.webp",
    gallery: ["/media/projects/grid-survival/cover.webp"],
    video: "/media/projects/grid-survival/preview.mp4",
    featured: true,
    problem:
      "A constrained grid creates room for readable decisions and repeatable game rules. This Python project explores survival mechanics in a compact play space.",
    approach:
      "The project combines Python gameplay logic with a visual game loop. Its source repository and recorded gameplay provide a direct look at the implementation; the companion website is maintained separately.",
    highlights: [
      "Grid-based survival gameplay",
      "Python game-loop implementation",
      "Recorded gameplay preview",
      "Separate game and distribution website repositories",
    ],
    evidence: [
      {
        label: "Game source",
        url: "https://github.com/Kynmmarshall/Grid_Survival",
      },
    ],
  },
  {
    slug: "math-runner",
    title: "Math Runner",
    number: "06",
    category: "Games",
    description: "A learning experience with a little momentum.",
    role: "Game development",
    stack: ["Python", "Pygame", "Educational games"],
    liveUrl: "https://kynmarshall.itch.io/math-runner",
    sourceUrl: "https://github.com/Kynmmarshall/MATH-RUNNER",
    color: "blue",
    logo: "/media/projects/math-runner/logo.webp",
    cover: "/media/projects/math-runner/cover.webp",
    gallery: ["/media/projects/math-runner/cover.webp"],
    video: "/media/projects/math-runner/preview.mp4",
    featured: false,
    problem:
      "Math practice can feel disconnected from play. Math Runner brings questions into a fast-paced educational game.",
    approach:
      "A Python/Pygame project connecting runner mechanics with mathematical challenges. The itch.io release provides the downloadable game and its system requirements.",
    highlights: [
      "Educational runner mechanics",
      "Mathematical challenges",
      "Python and Pygame implementation",
    ],
    evidence: [
      {
        label: "itch.io release",
        url: "https://kynmarshall.itch.io/math-runner",
      },
    ],
  },
  {
    slug: "plane-game",
    title: "Plane Game",
    number: "07",
    category: "Games",
    description: "An arcade experiment, close to the metal.",
    role: "Game development",
    stack: ["C++", "graphics.h", "Windows APIs"],
    liveUrl: "https://kynmarshall.itch.io/kynm-plane-game",
    sourceUrl: "https://github.com/Kynmmarshall/PlaneGame",
    color: "peach",
    logo: "/media/projects/plane-game/logo.webp",
    cover: "/media/projects/plane-game/cover.webp",
    gallery: ["/media/projects/plane-game/cover.webp"],
    video: "/media/projects/plane-game/preview.mp4",
    featured: false,
    problem:
      "Building an arcade game without a large engine is a practical way to study input, rendering, and real-time state.",
    approach:
      "A Windows arcade game built with C++, graphics.h, and Windows APIs. The project focuses on responsive controls, game progression, and two-player interaction.",
    highlights: [
      "Single-player and two-player modes",
      "Real-time input and rendering",
      "Persistent high scores",
    ],
    evidence: [
      {
        label: "itch.io release",
        url: "https://kynmarshall.itch.io/kynm-plane-game",
      },
    ],
  },
];

export const featuredProjects = projects.filter((project) => project.featured);
export const getProject = (slug: string) =>
  projects.find((project) => project.slug === slug);
