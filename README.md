# Department of CSIT — Sri Indu College of Engineering & Technology

Official website for the **Department of Computer Science and Information Technology (CSIT)** at **Sri Indu College of Engineering & Technology (Autonomous)**, Hyderabad, Telangana. The site presents the department's academics, infrastructure, faculty, placements, and student resources, and includes **IGRIS**, an AI-powered study assistant for students.

🔗 Live target:https://sriindu-csit.vercel.app/

---

## ✨ Features

- **Single-Page Application (SPA)** with a lightweight, dependency-free hash-based router (`#/objectives`, `#/faculty`, `#/notes`, etc.) — every section has a real, shareable URL and its own `<title>` / meta description.
- **IGRIS AI Study Assistant** — an in-app chat interface that answers student questions from course material, with support for streaming responses, Markdown/LaTeX rendering, and subject-aware context (year, semester, subject).
- **Academics** — objectives, vision/mission, and academic calendar.
- **Infrastructure** — computing laboratories, smart classrooms, central library, and seminar hall / auditorium pages.
- **Faculty & Staff** — searchable/filterable teaching faculty directory and technical staff listing.
- **Student Corner** — campus photo/video gallery, placement records, and a filterable notes & resources library (lecture notes, lab manuals, question banks).
- **Placement Guide** — a step-by-step roadmap from preparation to final placement.
- **Contact** — campus address, phone helpline, department/admissions emails, and Google Maps link.
- **UI details** — animated counters, scroll-reveal animations, hero image slider, media carousels with audio/skip controls, accordion panels, mobile-responsive navigation, and a "scroll to top" button.
- **Graceful degradation** — a `<noscript>` banner informs visitors that JavaScript is required, with a phone/email fallback.
- **SEO-ready** — Open Graph tags, a canonical URL, and `EducationalOrganization` JSON-LD structured data.

---

## 🗂️ Project Structure

```
.
├── index.html        # Markup for all page sections (SPA "pages" live in one document)
├── style.css         # Design system (CSS custom properties) + component/page styles
├── script.js         # SPA router, UI interactions, and the IGRIS chat client
├── vercel.json        # Vercel deployment configuration
└── Assets/            # Images referenced by index.html (e.g. Assets/Campus/...)
```

> **Note:** `script.js` calls `/api/chat/stream` and `/api/study/chat` for the IGRIS assistant. These are expected to be serverless/Edge Functions deployed alongside this static site (e.g. under an `api/` directory) — they are not part of the front-end files in this repository. Without them, IGRIS falls back to local mock responses during development.

---

## 🛠️ Tech Stack

- **HTML5 / CSS3** — semantic markup and a token-based design system (CSS custom properties for colors, spacing, radii, shadows).
- **Vanilla JavaScript (ES6+)** — no frameworks; a custom hash router drives the SPA.
- **Font Awesome 6** — iconography.
- **Google Fonts** — `Outfit`, `Plus Jakarta Sans`, and `Poppins`.
- **Vercel** — static hosting, with `api/` routes for the IGRIS backend.

---

## 🚀 Getting Started

### Run locally
No build step is required for the front end — it's a static site.

```bash
# Clone the repository
git clone https://github.com/PalliGopi-GIT/Sriindu-csit.git
cd Sriindu-csit

# Serve the folder with any static file server, e.g.:
npx serve .
# or
python -m http.server 8000
```

Then open `http://localhost:8000` (or the port shown) in your browser.

> If you have the Vercel CLI and the `api/` functions for IGRIS, run `vercel dev` instead so the chat endpoints resolve correctly.

### Deploy
This project is configured for **Vercel**:

```bash
vercel deploy
```

`vercel.json` sets `buildCommand` to a no-op and serves the repository root as-is (`outputDirectory: "."`), since no build tooling is used.

---

## 📄 Pages

| Section | Route |
|---|---|
| Home | `#/` |
| Objectives | `#/objectives` |
| Academic Calendar | `#/academic-calendar` |
| Laboratories | `#/laboratories` |
| Classrooms | `#/classrooms` |
| Central Library | `#/library` |
| Seminar Hall | `#/seminar-hall` |
| Faculty Directory | `#/faculty` |
| Technical Staff | `#/technical-staff` |
| Campus Gallery | `#/gallery` |
| Placement Records | `#/placements` |
| Notes & Resources | `#/notes` |
| IGRIS AI Study Assistant | `#/igris` |
| Placement Guide | `#/placement-guide` |
| Contact | `#/contact` |

---

## 🎓 About the Department

Department of Computer Science and Information Technology (CSIT), Sri Indu College of Engineering & Technology (Autonomous) — a **UGC Autonomous**, **NBA-accredited**, **NAAC 'A+'** graded institution approved by AICTE, offering B.Tech under JNTUH affiliation.

- 📍 Main Road, Sheriguda (V), Ibrahimpatnam (M), R.R. Dist., Telangana — 501510
- 📞 +91-93473 63999
- ✉️ csitdeptsriindu@gmail.com
- 🆔 EAPCET / ICET Code: **INDU**

---

## 📜 License

© Department of Computer Science & Information Technology, Sri Indu College of Engineering and Technology. All rights reserved.
