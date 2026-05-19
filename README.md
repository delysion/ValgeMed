# Tartu Med/Dent OS

Console privata single-user per organizzare studio, esami, active recall, spaced review, errori, energia e obiettivi per una futura studentessa di Medicina/Odontoiatria a Tartu.

Non e un SaaS: niente registrazione pubblica, billing, social feature, scraping, integrazioni email o AI cloud nella prima versione.

## Stack

- Next.js App Router, TypeScript strict, Tailwind CSS
- Neon Postgres + Drizzle ORM
- Zod validators lato server
- shadcn-style UI locale, TanStack Table, Recharts, lucide-react, date-fns
- pnpm

## Setup locale

```bash
pnpm install
cp .env.example .env
pnpm auth:hash "scegli-una-password-lunga"
```

Inserisci il valore generato in `APP_PASSWORD_HASH` dentro `.env`.

Genera anche un secret di sessione:

```bash
openssl rand -base64 32
```

Poi configura:

```bash
DATABASE_URL=
OWNER_EMAIL=
APP_PASSWORD_HASH=
SESSION_SECRET=
```

Avvio locale:

```bash
pnpm dev
```

## Setup Neon

1. Crea un progetto Neon.
2. Copia la connection string Postgres pooled o standard.
3. Incollala in `DATABASE_URL`.
4. Esegui migrations e seed:

```bash
pnpm db:migrate
pnpm db:seed
```

## Setup Vercel

1. Importa il repository in Vercel.
2. Aggiungi le variabili ambiente:
   - `DATABASE_URL`
   - `OWNER_EMAIL`
   - `APP_PASSWORD_HASH`
   - `SESSION_SECRET`
3. Esegui `pnpm db:migrate` da locale o da job separato prima del primo uso.
4. Deploy.

Il cookie di sessione e `httpOnly`, `sameSite=lax` e `secure` in produzione.

## Comandi

```bash
pnpm dev
pnpm build
pnpm lint
pnpm typecheck
pnpm db:generate
pnpm db:migrate
pnpm db:seed
pnpm test
```

## Auth privata

- Non esiste registrazione utenti.
- L'unico accesso e la pagina `/login`.
- La password non viene mai salvata in chiaro.
- `APP_PASSWORD_HASH` deve essere un hash bcrypt generato con:

```bash
pnpm auth:hash "password"
```

Se `APP_PASSWORD_HASH` o `SESSION_SECRET` mancano, il login mostra un errore chiaro.

## Privacy

- Nessuna AI cloud nella prima versione.
- Nessun dato viene inviato a servizi AI.
- Export dati disponibile in `/settings` e `/settings/import-export` come JSON o CSV.
- Tutte le pagine private e gli export sono protetti dalla sessione.
- Il database e Neon Postgres configurato via `DATABASE_URL`.
- La pagina `/ai` documenta la governance: AI_PROVIDER resta `none` nella v1.

## Implementato

- Schema Drizzle completo con migration iniziale e migration estesa.
- Seed con dati fittizi.
- Login single-user.
- CRUD per subjects, exams, topics, study sessions, review items, error logs, daily logs, goals, tasks e identity notes.
- CRUD locale per Tartu notes, time blocks, health logs, language progress, reputation events, opportunities, professional contacts, life admin items, portfolio items e strategic reviews.
- `/command` come pagina madre: next best action, weak topic, exam at risk, error retest, language move, opportunity radar, life admin e daily log.
- Dashboard con next best action, due reviews, open errors, study minutes, active/passive, burnout risk, readiness chart e weak topics.
- Subject command center in `/subjects/[id]` con mastery, active topics, weak topics, reviews, open errors, quiz accuracy e last active recall.
- Exam command center con breakdown, topics, errors, quiz attempts, sessions e piano 7 giorni.
- Scoring engine locale con Exam Readiness, Study Efficiency, Burnout Risk, Time Leverage, Medical Mastery, Error Destruction, Energy Integrity, Estonia Integration, Reputation Capital, Opportunity Capture ed Elise Elite Index.
- Next best action engine senza AI con logica per recovery, exam risk, error review, review due, active recall, passivo eccessivo, language move, opportunity, reputation e life admin.
- Export JSON/CSV per tabelle studio, obiettivi, identity e moduli life/elite.
- Test minimi per scoring, validators e scheduling.
- Documentazione di prodotto in `docs/PRODUCT_BIBLE.md` e guida iniziale in `docs/ELISE_START_GUIDE.md`.

## Limiti noti

- Lo spaced repetition segue una cadenza base semplice: domani, +3, +7, +14, +30 giorni, con ripetizione domani se confidence e molto bassa.
- I pesi scoring sono costanti versionate in `lib/scoring/engine.ts`.
- CSV export e un singolo file con sezioni per tabella.
- Non c'e upload file, import esami, calendario o notifiche.
- Non c'e AI locale o cloud.
- L'import dati e volutamente non attivo nella v1: evitare overwrite e duplicati richiede una UI di revisione create-only.

## Cosa non e stato implementato

Le idee future sono in `TODO.md`: AI locale, calendar integration, file upload, PDF notes, semantic search, PWA notifications, advanced spaced repetition, exam import, import create-only, Anki import/export, encrypted backup, offline mode e multilingual Estonian study layer avanzato.
