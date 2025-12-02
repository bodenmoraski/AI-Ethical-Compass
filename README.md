# AI Ethical Compass

An educational platform for teaching AI ethics through interactive scenarios. Built for the ISTE+ASCD AI Innovator Challenge 2025.

**Live site:** [aiethicalcompass.org](https://aiethicalcompass.org)

---

## What This Is

AI Ethical Compass helps students develop critical thinking about AI through real-world dilemmas. Teachers can manage classrooms, assign scenarios, and track student engagement.

**Core features:**
- 10 curated AI ethics scenarios (essay detection, facial recognition, content moderation, etc.)
- Teacher dashboard with class management, assignments, and grading
- Real-time classroom monitoring
- Student perspective sharing with AI-powered moderation
- Gamification (achievements, leaderboards)
- 7 languages (EN, ES, FR, DE, ZH, AR, IT)

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui |
| Backend | Vercel Serverless Functions |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| AI | OpenAI GPT-4o-mini (content moderation, perspective analysis) |

---

## Quick Start

### Prerequisites
- Node.js 20+
- Supabase account
- OpenAI API key (optional, for AI features)

### Setup

```bash
# Clone and install
git clone https://github.com/bodenmoraski/AI-Ethical-Compass.git
cd AI-Ethical-Compass
npm install

# Configure environment
cp .env.example .env
# Edit .env with your keys:
#   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
#   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
#   SUPABASE_SERVICE_ROLE_KEY=your-service-key
#   OPENAI_API_KEY=your-openai-key (optional)

# Run locally
npm run dev
```

The app runs at `http://localhost:3000`.

### Database Setup

Apply migrations to your Supabase project:

```bash
# Option 1: Use the consolidated migration
psql $DATABASE_URL < server/migrations/APPLY_MIGRATIONS.sql

# Option 2: Run individual migrations in order
ls server/migrations/*.sql
```

---

## Project Structure

```
├── api/                    # Serverless API endpoints (12 files)
├── client/
│   ├── src/
│   │   ├── components/     # React components (78 files)
│   │   ├── pages/          # Route pages (22 files)
│   │   ├── locales/        # i18n translations (7 languages)
│   │   └── lib/            # Utilities, auth, hooks
│   └── public/             # Static assets
├── lib/                    # Shared backend utilities
│   └── ai-analysis.ts      # OpenAI integration
├── server/
│   └── migrations/         # SQL migrations
├── shared/
│   ├── schema.ts           # Database schema (Drizzle)
│   └── scenarios.json      # Scenario content
└── tests/                  # Jest test suites
```

---

## API Overview

| Endpoint | Purpose |
|----------|---------|
| `/api/teacher` | Class management, assignments, grading |
| `/api/student` | Student enrollment, submissions |
| `/api/perspectives` | Submit/fetch community perspectives |
| `/api/realtime-classroom` | Live activity feed for teachers |
| `/api/achievements` | Gamification system |
| `/api/leaderboard` | Community rankings |
| `/api/user-dashboard` | Student analytics |
| `/api/user-scenarios` | User-generated scenarios |

---

## Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# Integration tests (requires test env)
npm run test:integration
```

Current: 64+ tests across 7 suites.

---

## Deployment

Deployed on Vercel. Push to `main` triggers automatic deployment.

```bash
# Build locally to verify
npm run build

# Preview production build
npm run preview
```

**Environment variables** to configure in Vercel:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`

---

## Key Files

| File | What it does |
|------|--------------|
| `lib/ai-analysis.ts` | OpenAI integration for moderation and analysis |
| `api/teacher.ts` | Teacher dashboard API (classes, assignments, grading) |
| `api/realtime-classroom.ts` | WebSocket-based live monitoring |
| `shared/scenarios.json` | All scenario content |
| `client/src/components/teacher/` | Teacher UI components |
| `client/src/components/student/` | Student UI components |

---

## Scenarios Included

1. **AI-Generated Essay** — Academic integrity vs. ESL support
2. **Facial Recognition in Schools** — Security vs. privacy and bias
3. **AI Content Moderation** — Academic freedom vs. safety
4. **AI in College Admissions** — Algorithmic fairness
5. **Personalized Learning AI** — Educational benefit vs. surveillance
6. **Automated Grading Systems** — Efficiency vs. nuance
7. **AI-Generated Art** — Creativity and attribution
8. **Predictive Analytics for Students** — Early intervention vs. labeling
9. **Language Translation in Classrooms** — Inclusion vs. language development
10. **Social Media Monitoring** — Student safety vs. privacy

Each scenario includes multiple resolution paths, discussion questions, and links to real-world resources.

---

## Contributing

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/thing`)
3. Write tests for new functionality
4. Submit a PR

Please follow existing code style (TypeScript strict mode, Tailwind for styling).

---

## Security

- Supabase Row-Level Security (RLS) on all tables
- JWT authentication via Supabase Auth
- Content moderation via OpenAI
- No PII stored in perspectives (anonymous by default)

Report security issues to: bodenmoraski@gmail.com

---

## License

MIT

---

## Credits

Built by Boden Moraski with help from Benji Beall and Roshan Kshirsagar.

**Powered by:**
- [Supabase](https://supabase.com) — Backend
- [Vercel](https://vercel.com) — Hosting
- [OpenAI](https://openai.com) — AI analysis
- [shadcn/ui](https://ui.shadcn.com) — Components
