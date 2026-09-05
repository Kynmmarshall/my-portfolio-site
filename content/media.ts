const githubGifs = "https://raw.githubusercontent.com/Kynmmarshall/Kynmmarshall/main/assets/gifs";
const dishImages = "https://raw.githubusercontent.com/Kynmmarshall/Pick-My-Dish/main/website/images";

export const imageSources = [
  ...[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 13, 14].map((number) => ({ destination: `batchit/${number === 1 ? "cover" : `screen-${number}`}.webp`, url: `https://batchit.duckdns.org/images/${number}.png` })),
  { destination: "pick-my-dish/cover.webp", url: `${dishImages}/home%20bright.jpg` },
  { destination: "pick-my-dish/recipes.webp", url: `${dishImages}/all%20recipes%20bright.jpg` },
  { destination: "pick-my-dish/detail.webp", url: `${dishImages}/recipe%20detail.jpg` },
  { destination: "pick-my-dish/favourites.webp", url: `${dishImages}/favorites%20bright.jpg` },
  { destination: "fruit-collector/cover.webp", url: "https://fruitcollector.duckdns.org/assets/level1.png" },
  { destination: "fruit-collector/menu.webp", url: "https://fruitcollector.duckdns.org/assets/menu.png" },
  { destination: "fruit-collector/level-4.webp", url: "https://fruitcollector.duckdns.org/assets/level4.png" },
  { destination: "fruit-collector/options.webp", url: "https://fruitcollector.duckdns.org/assets/options.png" },
  { destination: "fruit-collector/credits.webp", url: "https://fruitcollector.duckdns.org/assets/credit.png" },
];

export const animationSources = [
  { slug: "grid-survival", url: `${githubGifs}/Grid-survival.gif` },
  { slug: "fruit-collector", url: `${githubGifs}/fruitcollector.gif` },
  { slug: "math-runner", url: `${githubGifs}/mathrunner.gif` },
  { slug: "plane-game", url: `${githubGifs}/planegame.gif` },
  { slug: "ninja-game", url: `${githubGifs}/ninjagame.gif` },
];