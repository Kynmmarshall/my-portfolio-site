import type { Localized } from "../lib/i18n.ts";

export type Category = "Applications" | "Games";

/** The category value stays English: it is the `?category=` URL filter. */
export const CATEGORY_LABEL: Record<Category, Localized> = {
  Applications: { en: "Applications", fr: "Applications" },
  Games: { en: "Games", fr: "Jeux" },
};

export type Project = {
  slug: string;
  title: string;
  category: Category;
  number: string;
  description: Localized;
  role: Localized;
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
  problem: Localized;
  approach: Localized;
  highlights: Localized[];
  evidence: { label: Localized; url: string }[];
};

export const projects: Project[] = [
  {
    slug: "batchit",
    title: "BatchIt",
    number: "01",
    category: "Applications",
    description: {
      en: "A little community. A lot more buying power.",
      fr: "Une petite communauté. Bien plus de pouvoir d'achat.",
    },
    role: {
      en: "ScrumMaster / DevOps / localisation",
      fr: "ScrumMaster / DevOps / localisation",
    },
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
    problem: {
      en: "Buying alone can make everyday essentials more expensive. BatchIt brings nearby shoppers together to pool purchases and coordinate a shared order.",
      fr: "Acheter seul peut rendre les produits du quotidien plus chers. BatchIt réunit des acheteurs du voisinage pour mutualiser leurs achats et coordonner une commande commune.",
    },
    approach: {
      en: "My contribution brings delivery and product execution together: ScrumMaster responsibilities, VPS setup, deployment automation, and localisation. The product is collaborative work, with dedicated contributors across backend, maps, chat, and core Flutter features.",
      fr: "Ma contribution réunit la livraison et l'exécution produit : responsabilités de ScrumMaster, mise en place du VPS, automatisation du déploiement et localisation. Le produit est un travail collaboratif, avec des contributeurs dédiés au backend, aux cartes, au chat et aux fonctionnalités Flutter principales.",
    },
    highlights: [
      {
        en: "Neighbourhood batch discovery and shared order progress",
        fr: "Découverte des achats groupés du quartier et suivi de la commande commune",
      },
      {
        en: "Automated delivery pipeline and VPS hosting",
        fr: "Pipeline de livraison automatisé et hébergement sur VPS",
      },
      {
        en: "French and English localisation",
        fr: "Localisation en français et en anglais",
      },
      {
        en: "A collaborative product with clearly defined team roles",
        fr: "Un produit collaboratif aux rôles d'équipe clairement définis",
      },
    ],
    evidence: [
      {
        label: { en: "Product and team", fr: "Produit et équipe" },
        url: "https://batchit.duckdns.org/#team",
      },
      {
        label: { en: "Source repository", fr: "Dépôt du code source" },
        url: "https://github.com/Kynmmarshall/BatchIt",
      },
    ],
  },
  {
    slug: "fruit-collector",
    title: "Fruit Collector",
    number: "02",
    category: "Games",
    description: {
      en: "Small pixels. Precise physics. One more level.",
      fr: "Petits pixels. Physique précise. Encore un niveau.",
    },
    role: { en: "Game development", fr: "Développement de jeu" },
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
    problem: {
      en: "A platformer lives or dies by how it feels. Fruit Collector explores movement, collision, progression, and readable level design within a mobile-friendly game.",
      fr: "Un jeu de plateforme tient à sa sensation de jeu. Fruit Collector explore le mouvement, les collisions, la progression et la lisibilité des niveaux dans un jeu adapté au mobile.",
    },
    approach: {
      en: "Built with Flutter and the Flame engine, the game combines character animation and collision-driven gameplay with touch and keyboard controls. SharedPreferences persists progress. Game-art credits remain with their respective creators.",
      fr: "Conçu avec Flutter et le moteur Flame, le jeu associe animation des personnages et gameplay basé sur les collisions, avec des commandes tactiles et clavier. SharedPreferences conserve la progression. Les crédits des visuels restent attribués à leurs créateurs respectifs.",
    },
    highlights: [
      {
        en: "Published on Google Play for Android",
        fr: "Publié sur Google Play pour Android",
      },
      {
        en: "Five levels and four selectable characters",
        fr: "Cinq niveaux et quatre personnages au choix",
      },
      { en: "Touch and keyboard input", fr: "Commandes tactiles et clavier" },
      {
        en: "Collision, gravity, and movement systems",
        fr: "Systèmes de collision, de gravité et de mouvement",
      },
      {
        en: "Locally saved progression",
        fr: "Progression sauvegardée localement",
      },
    ],
    evidence: [
      {
        label: { en: "Google Play release", fr: "Version Google Play" },
        url: "https://play.google.com/store/apps/details?id=com.kynmmarshall.fruitcollector&hl=fr",
      },
      {
        label: {
          en: "Game and technical details",
          fr: "Détails du jeu et aspects techniques",
        },
        url: "https://fruitcollector.duckdns.org",
      },
      {
        label: { en: "Source repository", fr: "Dépôt du code source" },
        url: "https://github.com/Kynmmarshall/MobileGame",
      },
    ],
  },
  {
    slug: "pick-my-dish",
    title: "Pick My Dish",
    number: "03",
    category: "Applications",
    description: {
      en: "From what's in your kitchen to what's for dinner.",
      fr: "De ce qu'il y a dans votre cuisine à ce qu'il y a pour dîner.",
    },
    role: {
      en: "Co-development / delivery automation",
      fr: "Co-développement / automatisation de la livraison",
    },
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
    problem: {
      en: "Choosing a recipe involves more than a search term. Available ingredients, time, and mood all shape what people actually want to cook.",
      fr: "Choisir une recette ne se résume pas à un mot-clé. Les ingrédients disponibles, le temps et l'humeur influencent ce que les gens ont réellement envie de cuisiner.",
    },
    approach: {
      en: "Co-developed with Tuheu Tchoubi Pempem Moussa Fahdil. The documented architecture separates Flutter/Provider presentation from Node.js/Express services and PostgreSQL persistence. The repository includes a Jenkins pipeline for analysis, testing, packaging, and delivery.",
      fr: "Co-développé avec Tuheu Tchoubi Pempem Moussa Fahdil. L'architecture documentée sépare la présentation Flutter/Provider des services Node.js/Express et de la persistance PostgreSQL. Le dépôt inclut un pipeline Jenkins pour l'analyse, les tests, le packaging et la livraison.",
    },
    highlights: [
      {
        en: "Mood, ingredient, and cooking-time discovery",
        fr: "Découverte par humeur, ingrédients et temps de cuisson",
      },
      {
        en: "Saved favourites and recipe details",
        fr: "Favoris enregistrés et détails des recettes",
      },
      {
        en: "Documented layered architecture and design patterns",
        fr: "Architecture en couches et patrons de conception documentés",
      },
      {
        en: "Jenkins build and release pipeline",
        fr: "Pipeline Jenkins de build et de publication",
      },
    ],
    evidence: [
      {
        label: {
          en: "Architecture and contributors",
          fr: "Architecture et contributeurs",
        },
        url: "https://github.com/Kynmmarshall/Pick-My-Dish",
      },
      {
        label: { en: "Build pipeline", fr: "Pipeline de build" },
        url: "https://github.com/Kynmmarshall/Pick-My-Dish/blob/main/jenkinsfile",
      },
    ],
  },
  {
    slug: "trip-io",
    title: "Trip-io",
    number: "04",
    category: "Applications",
    description: {
      en: "A better day out, built around Yaounde.",
      fr: "Une meilleure sortie, pensée pour Yaoundé.",
    },
    role: { en: "Application development", fr: "Développement d'application" },
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
    problem: {
      en: "Discovering a city is one thing; fitting its destinations into a useful day plan is another. Trip-io focuses on real places in Cameroon's capital.",
      fr: "Découvrir une ville est une chose ; intégrer ses lieux dans un programme de journée utile en est une autre. Trip-io se concentre sur de vrais lieux de la capitale du Cameroun.",
    },
    approach: {
      en: "The application brings curated destinations and timed itineraries together, with English and French support. Its public distribution includes Android, Windows, and a browser app. The portfolio keeps its backend and repository mapping unspecified until verified.",
      fr: "L'application réunit des destinations sélectionnées et des itinéraires chronométrés, avec une prise en charge de l'anglais et du français. Sa distribution publique comprend Android, Windows et une application web. Ce portfolio laisse son backend et la correspondance avec le dépôt non précisés tant qu'ils ne sont pas vérifiés.",
    },
    highlights: [
      {
        en: "Curated destinations around Yaounde",
        fr: "Destinations sélectionnées autour de Yaoundé",
      },
      {
        en: "Time-aware itinerary planning",
        fr: "Planification d'itinéraires selon l'heure",
      },
      { en: "English and French", fr: "Anglais et français" },
      {
        en: "Android, Windows, and web distribution",
        fr: "Distribution Android, Windows et web",
      },
    ],
    evidence: [
      {
        label: { en: "Project website", fr: "Site du projet" },
        url: "https://trip-io.duckdns.org",
      },
      {
        label: { en: "Browser app", fr: "Application web" },
        url: "https://trip-io.duckdns.org/app/",
      },
    ],
  },
  {
    slug: "grid-survival",
    title: "Grid Survival",
    number: "05",
    category: "Games",
    description: {
      en: "Think ahead. Keep moving. Survive the grid.",
      fr: "Anticipez. Avancez. Survivez à la grille.",
    },
    role: { en: "Game development", fr: "Développement de jeu" },
    stack: ["Python", "Pygame", "Game logic"],
    liveUrl: "https://grid-survival.duckdns.org",
    sourceUrl: "https://github.com/Kynmmarshall/Grid_Survival",
    color: "yellow",
    logo: "/media/projects/grid-survival/logo.webp",
    cover: "/media/projects/grid-survival/cover.webp",
    gallery: ["/media/projects/grid-survival/cover.webp"],
    video: "/media/projects/grid-survival/preview.mp4",
    featured: true,
    problem: {
      en: "A constrained grid creates room for readable decisions and repeatable game rules. This Python project explores survival mechanics in a compact play space.",
      fr: "Une grille contrainte laisse la place à des décisions lisibles et à des règles de jeu reproductibles. Ce projet Python explore des mécaniques de survie dans un espace de jeu compact.",
    },
    approach: {
      en: "The project combines Python gameplay logic with a visual game loop. Its source repository and recorded gameplay provide a direct look at the implementation; the companion website is maintained separately.",
      fr: "Le projet associe une logique de jeu Python à une boucle de jeu visuelle. Son dépôt de code source et une partie enregistrée offrent un aperçu direct de l'implémentation ; le site compagnon est maintenu séparément.",
    },
    highlights: [
      { en: "Grid-based survival gameplay", fr: "Gameplay de survie sur grille" },
      {
        en: "Python game-loop implementation",
        fr: "Implémentation de la boucle de jeu en Python",
      },
      {
        en: "Recorded gameplay preview",
        fr: "Aperçu du gameplay enregistré",
      },
      {
        en: "Separate game and distribution website repositories",
        fr: "Dépôts distincts pour le jeu et le site de distribution",
      },
    ],
    evidence: [
      {
        label: { en: "Game source", fr: "Code source du jeu" },
        url: "https://github.com/Kynmmarshall/Grid_Survival",
      },
    ],
  },
  {
    slug: "math-runner",
    title: "Math Runner",
    number: "06",
    category: "Games",
    description: {
      en: "A learning experience with a little momentum.",
      fr: "Un apprentissage avec un peu d'élan.",
    },
    role: { en: "Game development", fr: "Développement de jeu" },
    stack: ["Python", "Pygame", "Educational games"],
    liveUrl: "https://kynmarshall.itch.io/math-runner",
    sourceUrl: "https://github.com/Kynmmarshall/MATH-RUNNER",
    color: "blue",
    logo: "/media/projects/math-runner/logo.webp",
    cover: "/media/projects/math-runner/cover.webp",
    gallery: ["/media/projects/math-runner/cover.webp"],
    video: "/media/projects/math-runner/preview.mp4",
    featured: false,
    problem: {
      en: "Math practice can feel disconnected from play. Math Runner brings questions into a fast-paced educational game.",
      fr: "Les exercices de maths peuvent sembler éloignés du jeu. Math Runner intègre les questions dans un jeu éducatif au rythme rapide.",
    },
    approach: {
      en: "A Python/Pygame project connecting runner mechanics with mathematical challenges. The itch.io release provides the downloadable game and its system requirements.",
      fr: "Un projet Python/Pygame qui relie les mécaniques d'un jeu de course à des défis mathématiques. La version itch.io propose le jeu à télécharger et sa configuration requise.",
    },
    highlights: [
      {
        en: "Educational runner mechanics",
        fr: "Mécaniques de jeu de course éducatives",
      },
      { en: "Mathematical challenges", fr: "Défis mathématiques" },
      {
        en: "Python and Pygame implementation",
        fr: "Implémentation en Python et Pygame",
      },
    ],
    evidence: [
      {
        label: { en: "itch.io release", fr: "Version itch.io" },
        url: "https://kynmarshall.itch.io/math-runner",
      },
    ],
  },
  {
    slug: "plane-game",
    title: "Plane Game",
    number: "07",
    category: "Games",
    description: {
      en: "An arcade experiment, close to the metal.",
      fr: "Une expérience d'arcade, au plus près de la machine.",
    },
    role: { en: "Game development", fr: "Développement de jeu" },
    stack: ["C++", "graphics.h", "Windows APIs"],
    liveUrl: "https://kynmarshall.itch.io/kynm-plane-game",
    sourceUrl: "https://github.com/Kynmmarshall/PlaneGame",
    color: "peach",
    logo: "/media/projects/plane-game/logo.webp",
    cover: "/media/projects/plane-game/cover.webp",
    gallery: ["/media/projects/plane-game/cover.webp"],
    video: "/media/projects/plane-game/preview.mp4",
    featured: false,
    problem: {
      en: "Building an arcade game without a large engine is a practical way to study input, rendering, and real-time state.",
      fr: "Créer un jeu d'arcade sans gros moteur est un bon moyen d'étudier les entrées, le rendu et l'état en temps réel.",
    },
    approach: {
      en: "A Windows arcade game built with C++, graphics.h, and Windows APIs. The project focuses on responsive controls, game progression, and two-player interaction.",
      fr: "Un jeu d'arcade Windows construit avec C++, graphics.h et les API Windows. Le projet met l'accent sur des commandes réactives, la progression du jeu et l'interaction à deux joueurs.",
    },
    highlights: [
      {
        en: "Single-player and two-player modes",
        fr: "Modes solo et deux joueurs",
      },
      {
        en: "Real-time input and rendering",
        fr: "Entrées et rendu en temps réel",
      },
      { en: "Persistent high scores", fr: "Meilleurs scores conservés" },
    ],
    evidence: [
      {
        label: { en: "itch.io release", fr: "Version itch.io" },
        url: "https://kynmarshall.itch.io/kynm-plane-game",
      },
    ],
  },
];

export const featuredProjects = projects.filter((project) => project.featured);
export const getProject = (slug: string) =>
  projects.find((project) => project.slug === slug);
