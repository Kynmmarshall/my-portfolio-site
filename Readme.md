# Kynmmarshall Portfolio

Next.js App Router, React, TypeScript, and Tailwind CSS. An editorial portfolio with a React Three Fiber scene, project case studies, locally optimized media, GitHub insights, and timestamped service reachability.

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

## Validate

```powershell
npm run typecheck
npm run lint
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

Browser tests require a running site at http://127.0.0.1:3000; `PLAYWRIGHT_BASE_URL` selects another origin. They cover canvas pixels, motion, responsive overflow, route status, links, media, gallery focus, and accessibility. Tests capture screenshots under `.data/screenshots/` and generate the real 3D fallback poster.

`npm run assets:prepare` downloads the source-attributed media inventory, creates WebP images and short MP4 previews, and captures Trip-io. Existing optimized assets are already included. FFmpeg and Playwright are development-only dependencies.

## Main Boundaries

- `app/`: server-rendered routes, metadata, and read-only snapshot APIs.
- `components/`: layout, hero/3D, motion, projects, skills, insights, and status.
- `content/`: reviewed profile, project collection, and source media URLs.
- `context/` and `hooks/`: visual preferences and browser visibility.
- `lib/`: validated schemas, GitHub/probe adapters, pure aggregates, SQLite storage, server-only read models.
- `jobs/`: explicit data refresh and asset preparation entrypoints.
- `tests/`: deterministic unit tests and Playwright workflows.
- `docs/`: architecture, provenance, metrics definitions, and VPS runtime contract.

Contact opens the visitor's email application. The legacy Formspree endpoint is not enabled in the new app. Employment dates, certificates, numeric performance claims, and an embedded micro-game have not been invented or added.

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