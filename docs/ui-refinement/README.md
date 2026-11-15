# ValgeMed · Nordic Clinical Intelligence

Command assegna alla prossima azione la superficie più ampia, il titolo più evidente e il solo pulsante pieno della sezione. Il contesto su esame e ripassi occupa una colonna a destra da 1280 px e passa sotto la raccomandazione negli spazi più stretti. I punteggi restano nei dettagli di performance.

I temi conservano l’indaco, le tinte di stato, le superfici calde del tema chiaro e quelle fredde del tema scuro. Le superfici opache e i separatori sottili sostituiscono i gradienti nelle card condivise. I pulsanti pieni usano un colore del testo specifico per tema. Il colore dei badge, delle barre e degli archi indica uno stato o identifica una metrica, mentre il valore numerico resta ad alto contrasto.

| Token | Uso |
| --- | --- |
| `bg-page`, `bg-surface`, `bg-subtle`, `bg-elevated` | Sfondo, pannelli, raggruppamenti e livelli elevati |
| `action`, `action-hover`, `action-foreground` | Azione primaria nei due temi |
| `primary-ring`, `control-border` | Focus da tastiera e contorno dei campi |
| `ui-label`, `ui-body`, `ui-metric` | Testo a 12, 14 e 24 px con interlinea dedicata |
| `panel`, `control`, `chip` | Raggi a 12, 8 e 6 px. Il padding dei pannelli varia da 16 a 24 px |
| `shadow-panel`, `shadow-dialog` | Ombra leggera sulle superfici e profondità sui dialoghi |

## Screenshot con dati demo

Le immagini mostrano la stessa fixture sintetica su una copia locale del commit `86e694f` e sulla versione rifinita. La fixture include l’esame *Cardiovascular Physiology*, tre ripassi in scadenza e un punteggio di performance. Le acquisizioni usano un account fittizio e un servizio di autenticazione locale.

| Vista | Prima | Dopo |
| --- | --- | --- |
| Command · dark · 1440 px | [PNG](screenshots/before-dark-1440.png) | [PNG](screenshots/after-dark-1440.png) |
| Command · light · 1440 px | [PNG](screenshots/before-light-1440.png) | [PNG](screenshots/after-light-1440.png) |
| Command · dark · 375 px | [PNG](screenshots/before-dark-375.png) | [PNG](screenshots/after-dark-375.png) |
| Command · light · 375 px | [PNG](screenshots/before-light-375.png) | [PNG](screenshots/after-light-375.png) |
| Dettagli performance · dark · 1440 px | [PNG](screenshots/before-dark-metrics-1440.png) | [PNG](screenshots/after-dark-metrics-1440.png) |
| Dettagli performance · light · 1440 px | [PNG](screenshots/before-light-metrics-1440.png) | [PNG](screenshots/after-light-metrics-1440.png) |

## File modificati

- Token e accessibilità di base in [app/globals.css](../../app/globals.css).
- Gerarchia, shell e navigazione in [Command](../../app/command/page.tsx), [AppShell](../../components/app-shell.tsx), [MobileDrawer](../../components/mobile-drawer.tsx) e [NavLink](../../components/nav-link.tsx).
- Superfici e metriche in [GlassCard](../../components/premium/glass-card.tsx), [MetricCard](../../components/premium/metric-card.tsx), [ScoreRing](../../components/premium/score-ring.tsx), [MomentumBar](../../components/premium/momentum-bar.tsx), [SectionHeader](../../components/premium/section-header.tsx), [CollapsiblePanel](../../components/premium/collapsible-panel.tsx) e [Gamification](../../components/premium/gamification.tsx).
- Controlli e overlay in [Button](../../components/ui/button.tsx), [Badge](../../components/ui/badge.tsx), [Card](../../components/ui/card.tsx), [Input](../../components/ui/input.tsx), [Textarea](../../components/ui/textarea.tsx), [Select](../../components/ui/select.tsx), [Dialog](../../components/ui/dialog.tsx) e [Sheet](../../components/ui/sheet.tsx).
- Tabelle in [DataTable](../../components/tables/data-table.tsx), [DataTableShell](../../components/tables/data-table-shell.tsx) e [ResourceTable](../../components/tables/resource-table.tsx).
- Raffinamenti locali in [Dashboard](../../app/dashboard/page.tsx), [Study](../../app/study/page.tsx) ed [Exams](../../app/exams/page.tsx).
- Etichette accessibili negli stessi dizionari [EN](../../lib/i18n/dictionaries/en.ts) ed [ET](../../lib/i18n/dictionaries/et.ts), con verifica di regressione in [product-hardening.test.ts](../../tests/product-hardening.test.ts).

## Verifica e limiti

- Chromium in dark e light a 375, 768, 1440 e 1920 px. Command è stato verificato con i dettagli chiusi e aperti, senza overflow orizzontale. Sono stati verificati focus visibile da tastiera, ritorno del focus dal drawer e rispetto di `prefers-reduced-motion`.
- Le coppie di testo e superficie misurate raggiungono almeno 4,55:1 in light e 5,95:1 in dark. Sono state misurate anche le coppie dei badge di stato, del pulsante primario in hover e dei campi. Le verifiche riguardano i token e le viste provate, non costituiscono un audit completo dell’app. [WCAG 2.2 sul contrasto](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)
- Il lint dei file modificati, il typecheck, i test e la build passano. La suite ha 368 test superati e 10 test Groq saltati. La build usa un URL di database locale per la configurazione richiesta da Next.js.
- Il lint globale segnala ancora sei errori preesistenti in [Terms of Service](../../app/terms-of-service/page.tsx), [Flashcard Grid](../../components/flashcards/flashcard-grid.tsx) e [azioni sulle risorse](../../lib/actions/resources.ts). La build segnala inoltre l’avviso preesistente su `metadataBase`.
