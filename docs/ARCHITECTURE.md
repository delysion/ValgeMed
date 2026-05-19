# Architecture

Tartu Med/Dent OS e una console privata single-user.

## Boundaries

- UI e server actions vivono in Next.js App Router.
- La sessione e stateless JWT firmato in cookie httpOnly.
- Il database e Neon Postgres via Drizzle ORM.
- Tutte le mutazioni passano da server actions con `requireOwnerSession`.
- Export JSON/CSV passa da route handler protetti.

## Security notes

- Nessuna registrazione pubblica.
- Nessun provider auth esterno.
- Nessuna password in chiaro.
- Nessuna AI cloud nella prima versione.
- Proxy Next protegge pagine private e route export.
- Le server actions verificano comunque la sessione per evitare chiamate POST dirette non autorizzate.

## Scoring

Lo scoring engine e euristico, locale e spiegabile. Ogni score restituisce fattori, pesi e nota di cautela. Lo score non viene presentato come verita assoluta.

## Product modules

- `/command` aggrega dati e decide la next best action senza AI.
- `/elite-index` calcola i segnali strategici estesi.
- I moduli life/elite (`/tartu`, `/time`, `/health`, `/language`, `/reputation`, `/opportunities`, `/network`, `/life-admin`, `/portfolio`, `/strategic-review`) usano le stesse server actions protette e lo stesso database Neon.
- `/ai` e solo governance nella v1: nessun provider viene chiamato.
