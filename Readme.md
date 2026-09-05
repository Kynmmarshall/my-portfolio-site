# Kynmmarshall Portfolio

Next.js App Router, React, TypeScript, and Tailwind CSS. An editorial portfolio with a layered portrait hero, mouse/scroll-reactive backgrounds, animated project logos, case studies, locally optimized media, GitHub insights, and recognizable social-profile links.

Expertise has a separate `/expertise` page, with individually labeled technology logos and practice icons. Its reviewed stack includes every technology explicitly named in the GitHub profile snapshot, plus current portfolio tools; entries without corroborating project evidence are marked Profile-listed. The homepage links to this page instead of duplicating its full content.

The top navigation includes Profile, linking to `/resume`. This is a styled engineering document with a portrait, social links, compact technology logos, project logos, role attribution, and a verified Google Play publication. Print / Save PDF uses a dedicated A4 stylesheet; print output hides site navigation and animated backgrounds.

The header sun/moon button switches between light and dark themes. Every fresh page load follows the system color scheme, including before JavaScript runs; manual selections last only for the current visit and survive client-side navigation, but reset on reload or a new tab. Theme choices are not stored. System changes update the theme until a manual selection is made. Print output stays dark-on-white. Theme colors use CSS `light-dark()` in current browsers.

The header, footer, browser tab, and touch icon use the developer's portrait. `npm run assets:icons` regenerates the 64px browser icon and 180px touch icon from the locally optimized portrait, using a tighter face crop for small sizes.

Fruit Collector links to its verified Google Play listing (`com.kynmmarshall.fruitcollector`) from project cards and its detail page. The public Google Play developer account is included in social links and the profile. No download counts, ratings, or additional store accounts are inferred.

The continuous wireframe terrain is rendered strictly behind content and targets 60 FPS with drift-free scheduling. Mobile/low-capability devices start with 1,271 vertices and at most 180,000 drawing-buffer pixels, a simpler shader, and no retained framebuffer, depth buffer, or stencil buffer. Sustained slow frames reduce quality to 475 vertices/90,000 pixels; persistent pressure freezes the surface rather than fighting the browser. Quality never ramps back up during the same mount. Reduced motion, pause, hidden tabs, and offscreen state stop the loop. Low-capability touch devices keep the portrait image instead of running a second WebGL canvas. Optional device tilt remains opt-in. Real-device GPU speed, battery state, and thermal limits vary, so flawless 60 FPS or no overheating cannot be guaranteed.

## Run Locally

Requires Node.js 24.x and npm. The original static site files remain untouched.

```powershell
npm ci
npm run dev
```

Open http://localhost:3000. For an optimized local build, run `npm run build` followed by `npm start`.

## Data Configuration

The app works without credentials; missing data is explicitly labeled. Configure optional values in `.env.local` using `.env.example` as the field reference. Never expose a token through a `NEXT_PUBLIC_` variable.

- `SITE_URL`: the actual public portfolio origin, used for sitemap and social metadata.
- `GITHUB_TOKEN`: a minimum-permission GitHub token for contribution-calendar queries and higher API quotas. Repository/language refreshes also work without a token, subject to public rate limits.
- `PORTFOLIO_DB_PATH`: optional SQLite file path; defaults to `.data/portfolio.sqlite`. Node 24 currently emits an experimental SQLite warning.

```powershell
npm run data:github
npm run data:status
```

These are one-shot application data jobs, not deployment scripts. Run GitHub refreshes every six hours and service checks every five minutes through your chosen scheduler after deployment. There is no request-triggered probing or automatic server timer. Keep the SQLite directory persistent across releases and backed up.

The public Status page has been removed, including its navigation and sitemap links. Existing monitoring jobs, API, and stored observations are retained; running service checks is optional and does not recreate the page.

## Validate

```powershell
npm run typecheck
npm run lint
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

Browser tests require a running site at http://127.0.0.1:3000; `PLAYWRIGHT_BASE_URL` selects another origin. They cover portrait canvas pixels, mouse/scroll response, logo motion and pause, responsive overflow, route status, links, detail media, gallery focus, and accessibility. Tests capture screenshots and the raw portrait frame under `.data/screenshots/`. The hero falls back to the original portrait if WebGL is unavailable.

`tests/e2e/theme.spec.ts` covers system-first startup, reload resets, keyboard toggling, blocked storage, header layout, dark-page contrast, print colors, dark-mode canvas pixels, and served portrait icons.

Terrain visual tests enable framebuffer retention only through test instrumentation for deterministic pixel capture; performance tests exercise the normal production setting with retention disabled. A separate mobile benchmark uses 4x Chromium CPU throttling, a DPR-3 viewport, and low-capability hints. Its short-run measurements are not a physical-phone GPU, battery, or thermal certification.

`npm run assets:prepare` downloads the source-attributed media inventory, creates WebP images and short MP4 previews, and captures Trip-io. Existing optimized assets are already included. FFmpeg and Playwright are development-only dependencies.

`npm run assets:logos` imports the seven project branding assets listed in `content/logos.ts`. Listings show these logos only; screenshots and gameplay are kept on project detail pages. The header pause control stops logo, portrait, and ambient background motion across the site. OS reduced-motion preferences are respected.

`npm run assets:tools` imports the official Flame/Pygame marks; other technology logos are local Devicon SVG imports. Tiled and unbranded engineering practices use named Lucide symbols. `npm run assets:trip` regenerates optimized copies of the six user-supplied Trip-io PNG screenshots, without changing the originals. Trip-io now uses the destination UI as its cover, not the older website capture.

The hero no longer displays an Artistic/Wireframe toggle. GitHub, LinkedIn, itch.io, Google Play, WhatsApp, and email links have labeled logos/icons in the hero, footer, and profile. WhatsApp opens `https://wa.me/237676093910`; the contact section displays +237 676 093 910. No message is sent automatically.

## Main Boundaries

- `app/`: server-rendered routes, metadata, and read-only snapshot APIs.
- `components/`: layout, hero/3D, motion, projects, skills, insights, and status.
- `content/`: reviewed profile, project collection, and source media URLs.
- `context/` and `hooks/`: visual preferences and browser visibility.
- `lib/`: validated schemas, GitHub/probe adapters, pure aggregates, SQLite storage, server-only read models.
- `jobs/`: explicit data refresh and asset preparation entrypoints.
- `tests/`: deterministic unit tests and Playwright workflows.
- `docs/`: architecture, provenance, metrics definitions, and VPS runtime contract.

Get in touch opens `mailto:kynmmarshall@gmail.com` with the selected inquiry subject. It requires a configured mailto handler (desktop email app or browser webmail handler); it does not send messages by itself. The plain email link and copy button remain available. Browser tests validate all three subjects and mouse/keyboard activation without opening an external app or sending a message. The legacy Formspree endpoint is not enabled in the new app. Employment dates, certificates, numeric performance claims, and an embedded micro-game have not been invented or added.

<details>
<summary>Original static portfolio documentation</summary>

Portfolio Website
A modern, responsive portfolio website showcasing my skills, projects, and professional background as a Software Engineer and Game Developer.

🌟 Features
Responsive Design: Optimized for both desktop and mobile devices

Smooth Scrolling: Seamless navigation between sections

Interactive Elements: Hover effects and animations

Contact Form: Functional contact form with Formspree integration

Modern UI: Clean, professional design with gradient backgrounds

Mobile Menu: Collapsible navigation for smaller screens

🛠️ Technologies Used
Frontend
HTML5: Semantic structure and accessibility

CSS3: Modern styling with gradients, transitions, and flexbox

JavaScript: Interactive features and form handling

Skills & Tools
Languages: Python, C, C++, Java, Dart, JavaScript

Web Technologies: HTML, CSS, Flutter

Tools: Git, GitHub

Game Development: Graphics programming, Pygame

📁 Project Structure
text
portfolio/
├── home.html          # Main HTML file
├── home.css           # Stylesheet
├── script.js          # JavaScript functionality
├── images/            # Asset directory
│   ├── me.png         # Profile photo
│   ├── github.png     # Social icons
│   ├── gmail.png
│   ├── linkedin.png
│   ├── css.png        # Technology logos
│   ├── html.png
│   └── ...
└── README.md          # This file
🚀 Sections
Home: Hero section with introduction and social links

About Me: Professional background and interests

Skills: Technical skills categorized by proficiency

Projects: Portfolio of completed projects with descriptions

Contact Me: Functional contact form

🎮 Featured Projects
Plane Game
Description: 2D airplane bombing survival game

Technology: C++ with graphics.h & Windows APIs

Features: Dynamic graphics, sound effects, real-time gameplay

Math Runner
Description: Educational adventure game combining math and gameplay

Technology: Python with Pygame

Features: Fast-paced learning experience

📧 Contact Integration
The contact form uses Formspree for backend functionality, allowing visitors to send messages directly to your email without server-side code.

🌐 Live Demo
[Add your live portfolio link here]

🔧 Setup & Customization
Clone or Download the project files

Update Personal Information:

Replace profile image (images/me.png)

Update name, bio, and descriptions in home.html

Modify social media links and contact information

Customize Styles:

Edit colors in home.css (look for color variables)

Modify gradients in #Home and other sections

Adjust layout dimensions as needed

Add Your Projects:

Update project descriptions and images

Add new project entries in the Projects section

Include relevant links and technologies

📱 Responsive Features
Mobile-friendly navigation with hamburger menu

Flexible grid layouts

Optimized typography scaling

Touch-friendly interactive elements

🔄 Browser Compatibility
Chrome (recommended)

Firefox

Safari

Edge

📄 License
© 2025 Kamdeu Yamdjeuson Neil Marshall. All Rights Reserved.

🤝 Contributing
This is a personal portfolio project. Feel free to use it as inspiration for your own portfolio, but please create your unique design and content.

📞 Connect With Me
GitHub: github.com/Kynmmarshall

LinkedIn: LinkedIn Profile

Email: [Add your email]

Itch.io: kynmarshall.itch.io

</details>