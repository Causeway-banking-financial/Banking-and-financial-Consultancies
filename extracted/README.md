# CauseWay Financial Consulting | كوزواي للاستشارات المالية

<div align="center">
  <img src="client/public/images/causeway-logo.png" alt="CauseWay Logo" width="200" />
  
  **Building Sharia-grounded, governance-safe financial systems**
  
  *بناء أنظمة مالية قائمة على الشريعة وآمنة للحوكمة*
  
  [![Website](https://img.shields.io/badge/Website-finance.causewaygrp.com-1E4D47?style=for-the-badge)](https://finance.causewaygrp.com)
  [![YETO](https://img.shields.io/badge/YETO-yeto.causewaygrp.com-D4A84B?style=for-the-badge)](https://yeto.causewaygrp.com)
  [![License](https://img.shields.io/badge/License-Proprietary-8B9A6D?style=for-the-badge)](#license)
</div>

---

## 📋 Table of Contents

- [About CauseWay](#about-causeway)
- [Platform Overview](#platform-overview)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Brand Guidelines](#brand-guidelines)
- [Features](#features)
- [Pages & Navigation](#pages--navigation)
- [Getting Started](#getting-started)
- [Development](#development)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## About CauseWay

**CauseWay** (كوزواي) is an independent financial advisory group headquartered in Aden, Yemen, with operations extending to Cairo, Egypt, and planned expansion to Riyadh, Saudi Arabia. We specialize in building robust financial infrastructure for emerging markets, with a particular focus on:

- **Islamic Finance Advisory** - Sharia-compliant product structuring and certification
- **Institutional Transformation** - Microfinance to commercial bank transitions
- **Governance & Compliance** - AML/CFT frameworks and regulatory alignment
- **Branding & Identity** - Complete visual identity systems for financial institutions
- **Policy Development** - Internal governance manuals and operational procedures

### Our Mission

> *"Where Finance Becomes Infrastructure"*
> 
> *حيث يصبح التمويل بنية تحتية*

We believe that sound financial systems are the foundation of economic development. Our mission is to transform fragmented financial landscapes into integrated, transparent, and Sharia-compliant ecosystems.

### Target Audience

- Central Banks and Monetary Authorities
- Commercial and Islamic Banks
- Microfinance Institutions
- Development Finance Institutions
- Government Ministries and Regulatory Bodies
- International Development Organizations

---

## Platform Overview

This repository contains the official CauseWay corporate website, a bilingual (English/Arabic) platform showcasing our services, insights, and the Yemen Economic Transparency Observatory (YETO).

### Key Highlights

| Feature | Description |
|---------|-------------|
| **Bilingual Support** | Full English/Arabic parity with RTL support |
| **YETO Integration** | Preview and access to Yemen's premier economic data platform |
| **Insights Hub** | Curated articles on Islamic finance, governance, and development |
| **Responsive Design** | Optimized for desktop, tablet, and mobile devices |
| **Performance** | Built with React 19 and Tailwind CSS 4 for optimal performance |

---

## Technology Stack

### Frontend
- **React 19** - Modern UI library with concurrent features
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Utility-first styling with custom design tokens
- **Framer Motion** - Smooth animations and transitions
- **Wouter** - Lightweight client-side routing

### Build & Development
- **Vite 7** - Next-generation frontend tooling
- **pnpm** - Fast, disk space efficient package manager
- **ESBuild** - Lightning-fast bundling

### Design System
- **shadcn/ui** - High-quality accessible components
- **Lucide Icons** - Beautiful, consistent iconography
- **Google Fonts** - Playfair Display, Tajawal, Source Sans 3

---

## Project Structure

```
causeway-website/
├── client/                    # Frontend application
│   ├── public/               # Static assets
│   │   └── images/           # Brand assets, photos, screenshots
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   │   ├── ui/          # shadcn/ui components
│   │   │   ├── Header.tsx   # Navigation header
│   │   │   ├── Footer.tsx   # Site footer
│   │   │   └── ...
│   │   ├── contexts/        # React contexts
│   │   │   ├── LanguageContext.tsx  # i18n & translations
│   │   │   └── ThemeContext.tsx     # Theme management
│   │   ├── pages/           # Page components
│   │   │   ├── Home.tsx
│   │   │   ├── About.tsx
│   │   │   ├── Services.tsx
│   │   │   ├── Observatory.tsx
│   │   │   ├── Insights.tsx
│   │   │   └── Contact.tsx
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Utility functions
│   │   ├── App.tsx          # Root component & routing
│   │   ├── main.tsx         # Application entry point
│   │   └── index.css        # Global styles & design tokens
│   └── index.html           # HTML template
├── server/                   # Server placeholder (static deployment)
├── shared/                   # Shared types and constants
├── .manus-logs/             # Development logs
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── vite.config.ts           # Vite configuration
└── README.md                # This file
```

---

## Brand Guidelines

### Logo

The CauseWay logo consists of:
- A rounded bracket "C" shape in **Deep Teal Green** (#1E4D47)
- An inner **Olive Green** square (#8B9A6D)
- A **Gold/Yellow** accent square (#D4A84B)
- A small **Teal** square accent

### Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| **Deep Teal Green** | `#1E4D47` | Primary brand color, logo, headings |
| **Olive Green** | `#8B9A6D` | Secondary accents, Arabic text |
| **Brand Gold** | `#D4A84B` | CTAs, highlights, interactive elements |
| **Deep Forest Green** | `#2C3424` | Dark backgrounds, footer |
| **Cypress** | `#4C583E` | Secondary backgrounds |
| **Cedar** | `#959581` | Muted text |
| **Aloe** | `#F5F5F0` | Light backgrounds |

### Typography

| Font | Usage |
|------|-------|
| **Playfair Display** | English headings (serif, elegant) |
| **Tajawal** | Arabic text and headings |
| **Source Sans 3** | Body text (English) |

### Capitalization

The brand name must always be written as **CauseWay** (with capital C and W).

---

## Features

### 🌐 Bilingual Support
- Complete English/Arabic language toggle
- RTL (Right-to-Left) layout support for Arabic
- Culturally appropriate typography

### 📊 YETO Integration
- Yemen Economic Transparency Observatory preview
- Live economic indicators
- Direct link to yeto.causewaygrp.com

### 📝 Insights Hub
- Curated articles on Islamic finance
- Governance and compliance insights
- Development finance analysis
- Full bilingual content

### 📱 Responsive Design
- Mobile-first approach
- Optimized touch interactions
- Adaptive navigation

### ⚡ Performance
- Lazy loading images
- Code splitting
- Optimized bundle size

---

## Pages & Navigation

| Page | Route | Description |
|------|-------|-------------|
| **Home** | `/` | Hero section, services overview, insights preview |
| **About** | `/about` | Company story, mission, core capabilities |
| **Services** | `/services` | Full service catalog with details |
| **Observatory** | `/observatory` | YETO platform preview and features |
| **Insights** | `/insights` | Articles, analysis, and publications |
| **Contact** | `/contact` | Contact form, locations, and information |

### Legal Pages
- Privacy Policy (`/privacy`)
- Terms of Use (`/terms`)
- Cookie Notice (`/cookies`)

---

## Getting Started

### Prerequisites

- Node.js 22.x or higher
- pnpm 10.x or higher

### Installation

```bash
# Clone the repository
git clone https://github.com/Causeway-banking-financial/Yto.git
cd Yto

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

The development server will start at `http://localhost:3000`

---

## Development

### Available Scripts

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Type checking
pnpm check

# Format code
pnpm format
```

### Environment Variables

The following environment variables are automatically injected:

| Variable | Description |
|----------|-------------|
| `VITE_APP_TITLE` | Application title |
| `VITE_APP_LOGO` | Logo URL |
| `VITE_ANALYTICS_ENDPOINT` | Analytics endpoint |
| `VITE_ANALYTICS_WEBSITE_ID` | Analytics website ID |

---

## Deployment

This project is configured for static deployment. The build output is optimized for CDN hosting.

```bash
# Build for production
pnpm build

# Output directory: dist/
```

### Hosting

The website is hosted at:
- **Production**: https://finance.causewaygrp.com
- **YETO Platform**: https://yeto.causewaygrp.com

---

## Contributing

This is a proprietary project. Contributions are limited to authorized team members.

### Code Standards

- Follow TypeScript best practices
- Use Tailwind CSS utility classes
- Maintain bilingual parity for all content
- Ensure mobile responsiveness
- Write semantic HTML

---

## License

© 2026 CauseWay Financial Consulting. All rights reserved.

This software is proprietary and confidential. Unauthorized copying, distribution, or use of this software is strictly prohibited.

---

## Contact

**CauseWay Financial Consulting**

- 🌐 Website: [finance.causewaygrp.com](https://finance.causewaygrp.com)
- 📧 Email: info@causewaygrp.com
- 📍 Headquarters: Aden, Yemen
- 📍 Regional Office: Cairo, Egypt

---

<div align="center">
  <sub>Built with ❤️ by CauseWay | كوزواي</sub>
</div>
