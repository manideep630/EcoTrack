# 🌿 EcoTrack — Personal Carbon Footprint & Sustainability Platform

EcoTrack is a modern, responsive web application designed to empower individuals to track their carbon footprint, adopt sustainable daily habits, participate in eco-friendly challenges, earn rewards, and visualize actionable environmental data.

EcoTrack features an offline-first architecture with persistent browser storage, interactive data visualizations, and client-side multi-page PDF sustainability report generation.

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Technology Stack](#-technology-stack)
- [Project Folder Structure](#-project-folder-structure)
- [Installation Instructions](#-installation-instructions)
- [How to Run Locally](#-how-to-run-locally)
- [Screenshots](#-screenshots)
- [Future Enhancements](#-future-enhancements)
- [License](#-license)

---

## 📖 Overview

Human activities are the primary driver of climate change, yet individual carbon footprints often feel abstract and hard to quantify. **EcoTrack** bridges this gap by providing an intuitive, gamified platform where users can:
- Calculate daily greenhouse gas emissions ($kg\text{ CO}_2\text{e}$) across transport, power, water, and waste.
- Build lasting habits with daily streak tracking.
- Earn badges and reward points that can be redeemed for environmental actions (e.g., planting trees).
- Review historical trends with interactive charts.
- Export audit-grade, formatted PDF sustainability summaries.

---

## ✨ Key Features

- **🧮 Interactive Carbon Calculator**:
  - Multi-category inputs: Commute type (car, EV, public transport, bike/walk), electricity usage, water consumption, and weekly waste generation.
  - Dynamic recycling habit weighting to adjust emission totals.
  - Immediate visual breakdown with percentage-based category distribution.

- **🔥 Daily Habit Tracker & Eco-Streaks**:
  - Daily checklist of high-impact green habits (public transit, energy saving, plant-based diets, zero-waste).
  - Habit streak counters with automated once-per-day increment logic to maintain streak integrity.
  - Overall Eco-Streak counter rewarded when all daily goals are completed.

- **🏆 Gamified Challenges & Rewards**:
  - Time-bound sustainability challenges (e.g., *7-Day Plastic-Free*, *Walk or Cycle for a Week*).
  - Tiered reward points and achievement badges (*First Step*, *Zero Waste Week*, *Habit Hero*).
  - Virtual reward redemption for conservation projects and eco-discounts.

- **📊 Comprehensive Analytics Dashboard**:
  - Historical emissions trends over time using interactive line charts, area charts, and bar charts.
  - Category breakdown comparison against regional and national averages.
  - Real-time Sustainability Score gauge (0–100 scale).

- **📄 Audit-Ready PDF Sustainability Report Generation**:
  - In-browser, multi-page vector PDF generation using `jspdf` and `jspdf-autotable`.
  - Export Weekly, Monthly, or All-Time reports with color-coded score badges, metrics grids, habit completion tables, and personalized recommendation matrices.

- **💡 Tailored Recommendations**:
  - Actionable suggestions dynamically ranked by carbon reduction potential and difficulty.

- **👥 Eco Community Hub**:
  - Share sustainable living tips, achievements, and milestones.
  - Interactive like and comment feeds with per-user state tracking.

- **📚 Educational Resource Center**:
  - Curated articles, zero-waste guides, and conservation literature.
  - Real-time search and category filtering with a personal bookmarking system.

- **🔒 Offline-First & Private**:
  - No external backend dependencies required; user data is maintained privately in `localStorage`.

---

## 🛠 Technology Stack

### Frontend & Core
- **React 19** — Component-driven declarative UI library
- **Vite 8** — Next-generation frontend build tool and dev server
- **React Router v7** — Dynamic client-side routing and layout management
- **Tailwind CSS 3** — Utility-first styling with custom eco-palette tokens (`eco-forest`, `eco-mint`, `eco-beige`, `eco-leaf`, `eco-charcoal`)
- **Lucide React** — Modern, clean iconography

### Data Visualization & Document Generation
- **Recharts 3** — Composable charting library for React
- **jsPDF 4 & jspdf-autotable 5** — Client-side programmatic PDF generation and table styling

### Code Quality & Utilities
- **Oxlint** — High-performance JavaScript/JSX linter
- **clsx & tailwind-merge** — Conditional CSS class utilities

---

## 📁 Project Folder Structure

```
ecotrack/
├── public/
│   ├── favicon.svg               # Application icon
│   ├── icons.svg                 # SVG sprite definitions
│   └── images/
│       └── resources/            # Educational resource thumbnails
│           ├── carbon-footprint.jpg
│           ├── composting.jpg
│           ├── default-resource.jpg
│           └── water-conservation.jpg
├── src/
│   ├── assets/                   # Static images and brand marks
│   │   ├── hero.png
│   │   ├── react.svg
│   │   └── vite.svg
│   ├── contexts/
│   │   └── UserContext.jsx       # Global state management & persistence
│   ├── layouts/
│   │   ├── DashboardLayout.jsx   # Sidebar, header & authenticated wrapper
│   │   └── MainLayout.jsx        # Public page layout wrapper
│   ├── pages/
│   │   ├── About.jsx             # Project mission & vision
│   │   ├── Analytics.jsx         # Detailed charts, historical data & PDF export
│   │   ├── Calculator.jsx        # Carbon footprint calculator
│   │   ├── Challenges.jsx        # Eco challenges & gamification
│   │   ├── Community.jsx         # Community feed & interactions
│   │   ├── Dashboard.jsx         # User overview & quick stats
│   │   ├── EducationalResources.jsx # Articles, search & bookmarking
│   │   ├── Habits.jsx            # Habit checklist & streak tracking
│   │   ├── Landing.jsx           # Public landing page & value proposition
│   │   ├── Login.jsx             # User sign-in
│   │   ├── Recommendations.jsx   # Personalized carbon reduction tips
│   │   ├── Rewards.jsx           # Point store & redemption
│   │   ├── Settings.jsx          # Profile settings, preferences & data management
│   │   └── Signup.jsx            # Account registration
│   ├── utils/
│   │   └── pdfGenerator.js       # Multi-page PDF report generation utility
│   ├── App.css                   # Custom global animations & component styles
│   ├── App.jsx                   # Route declarations & route guards
│   ├── index.css                 # Tailwind directives & design system variables
│   └── main.jsx                  # Application entry point
├── .gitignore                    # Git exclusion rules
├── .oxlintrc.json                # Oxlint linter rules
├── EcoTrack_Short_Documentation_Codes.md # Code reference for documentation
├── EcoTrack_Sustainability_Report_Weekly_User.pdf # Sample generated sustainability report
├── index.html                    # HTML document entry
├── package.json                  # Dependencies and scripts
├── postcss.config.js             # PostCSS plugins
├── tailwind.config.js            # Tailwind theme extensions
└── vite.config.js                # Vite build configuration
```

---

## 📦 Installation Instructions

### Prerequisites
Make sure you have the following installed on your machine:
- **Node.js** (v18.0.0 or higher recommended)
- **npm** (v9.0.0 or higher) or **yarn** / **pnpm**
- **Git**

### Clone the Repository
```bash
git clone https://github.com/<your-username>/ecotrack.git
cd ecotrack
```

### Install Dependencies
```bash
npm install
```

---

## 🚀 How to Run Locally

### Start Development Server
```bash
npm run dev
```
The application will start locally at `http://localhost:5173/` (or the next available port).

### Build for Production
```bash
npm run build
```
Builds the optimized production assets into the `dist/` directory.

### Preview Production Build
```bash
npm run preview
```
Locally serve the production build to verify behavior before deployment.

### Run Code Linter
```bash
npm run lint
```

---

## 📸 Screenshots

*(Add your screenshots to an `assets/screenshots/` directory or upload them directly to your GitHub repository after pushing)*

### 1. Dashboard Overview
![Dashboard Overview](https://via.placeholder.com/1200x675.png?text=EcoTrack+Dashboard+Overview)
*Unified dashboard displaying total emissions, sustainability score gauge, active habits, and streak metrics.*

### 2. Carbon Footprint Calculator
![Carbon Calculator](https://via.placeholder.com/1200x675.png?text=Carbon+Footprint+Calculator)
*Interactive multi-category emission calculator with immediate visual feedback.*

### 3. Analytics & Exportable PDF Report
![Analytics and Reports](https://via.placeholder.com/1200x675.png?text=Analytics+and+PDF+Export)
*Comprehensive historical charts, breakdown metrics, and instant multi-page PDF generation.*

### 4. Daily Habits & Challenges
![Habits and Challenges](https://via.placeholder.com/1200x675.png?text=Habits+and+Challenges)
*Daily habit checklist with streak protection and gamified reward challenges.*

---

## 🔮 Future Enhancements

- [ ] **Cloud Backend Integration**: Integrate Supabase / Firebase for encrypted cloud backup and cross-device synchronization.
- [ ] **Smart Meter & IoT Connectivity**: Ingest automated electricity and water meter readings via standard smart home APIs.
- [ ] **AI-Driven Sustainability Coach**: Personalized insights powered by an LLM assistant suggesting weekly targets.
- [ ] **Team & Organization Leaderboards**: Support for schools, companies, and community groups to run collective eco-challenges.
- [ ] **Native Mobile Application**: Cross-platform mobile version using React Native or enhanced PWA capabilities.
- [ ] **Carbon Offset Marketplace**: Direct integration with verified carbon removal and reforestation partners.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) — feel free to use, modify, and distribute this project for educational and open-source purposes.
