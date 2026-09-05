export const profile = {
  name: "Kamdeu Yamdjeuson Neil Marshall",
  handle: "Kynmmarshall",
  email: "kynmmarshall@gmail.com",
  github: "https://github.com/Kynmmarshall",
  linkedin: "https://www.linkedin.com/in/kamdeu-yamdjeuson-neil-marshall-a70566298",
  itch: "https://kynmarshall.itch.io",
  bio: "I build thoughtful applications, playful worlds, and the systems that keep them running. A software engineer in Cameroon, working across full-stack development, game development, and DevOps.",
};

export const pillars = [
  { id: "infrastructure", number: "01", title: "Build. Ship. Keep it running.", label: "DevOps & infrastructure", description: "From a source change to a working release. Automated builds, testing, packaging, and VPS delivery, with attention to the work after launch.", tools: ["Jenkins", "GitHub Actions", "NGINX", "VPS", "Git", "Release automation"], evidence: "BatchIt: deployment, VPS setup, and localisation", slug: "batchit", icon: "server" },
  { id: "games", number: "02", title: "A little logic. A lot of play.", label: "Game development & graphics", description: "Responsive movement, readable systems, and satisfying feedback. From Python prototypes to Flutter games and low-level C++ experiments.", tools: ["Flame", "Pygame", "C++", "graphics.h", "Tiled", "Game loops"], evidence: "Fruit Collector: gameplay, progression, and controls", slug: "fruit-collector", icon: "game" },
  { id: "full-stack", number: "03", title: "Useful from end to end.", label: "Full-stack & automation", description: "Interfaces connected to practical services. Cross-platform Flutter applications, JavaScript backends, and data models that keep concerns separate.", tools: ["Flutter / Dart", "JavaScript", "Node.js", "Express", "PostgreSQL", "REST APIs"], evidence: "Pick My Dish: a documented full-stack architecture", slug: "pick-my-dish", icon: "code" },
  { id: "engineering", number: "04", title: "Understand the foundations.", label: "Core engineering", description: "Clean boundaries and deliberate tradeoffs. I work with Python, C, and C++, and continue exploring Java, graphics, and better developer tooling.", tools: ["Python", "C / C++", "Java", "UML", "Design patterns", "Testing"], evidence: "Plane Game: C++ and Windows rendering fundamentals", slug: "plane-game", icon: "layers" },
] as const;