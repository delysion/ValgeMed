# Google Drive Export - Setup Guide

## Step 1: Crea Progetto Google Cloud

1. Vai su https://console.cloud.google.com
2. Clicca **Select a project** → **NEW PROJECT**
3. Nome: `ValgeMed` (o quello che preferisci)
4. Clicca **CREATE**
5. Aspetta che il progetto venga creato

---

## Step 2: Abilita Google Drive API

1. Nel menu laterale, vai su **APIs & Services** → **Library**
2. Cerca **"Google Drive API"**
3. Clicca su **Google Drive API**
4. Clicca **ENABLE**
5. Aspetta che si attivi (pochi secondi)

---

## Step 3: Configura OAuth Consent Screen

1. Nel menu laterale, vai su **APIs & Services** → **OAuth consent screen**
2. Seleziona **External** (perché non hai Google Workspace)
3. Clicca **CREATE**
4. Compila:
   - **App name**: `ValgeMed`
   - **User support email**: il tuo indirizzo email
   - **App logo**: (opzionale)
   - **App domain**: lascia vuoto per ora
   - **Developer contact**: il tuo indirizzo email
5. Clicca **SAVE AND CONTINUE**
6. **Scopes**: clicca **ADD OR REMOVE SCOPES**
   - Seleziona: `.../auth/drive.file` (Google Drive)
   - Clicca **UPDATE** → **SAVE AND CONTINUE**
7. **Test users**: clicca **ADD USERS**
   - Aggiungi il tuo indirizzo email (quello che usi per login)
   - Clicca **SAVE AND CONTINUE**
8. Clicca **BACK TO DASHBOARD**

---

## Step 4: Crea OAuth 2.0 Client ID

1. Nel menu laterale, vai su **APIs & Services** → **Credentials**
2. Clicca **+ CREATE CREDENTIALS** → **OAuth client ID**
3. **Application type**: **Web application**
4. **Name**: `ValgeMed Web Client`
5. **Authorized JavaScript origins**:
   - Clicca **+ ADD URI**
   - `https://valgemed.vercel.app`
   - (Opzionale per test locale: `http://localhost:3000`)
6. **Authorized redirect URIs**:
   - Clicca **+ ADD URI**
   - `https://valgemed.vercel.app/api/export/google-callback`
   - (Opzionale per test locale: `http://localhost:3000/api/export/google-callback`)
7. Clicca **CREATE**

---

## Step 5: Copia il Client ID

Si aprirà un popup con:

```
Your OAuth Client
Client ID: 123456789-abc123def456.apps.googleusercontent.com
Client Secret: GOCSPX-xyz789
```

**Copia solo il Client ID** (quello che finisce con `.apps.googleusercontent.com`)

---

## Step 6: Aggiungi a Vercel

1. Vai su https://vercel.com/dashboard
2. Seleziona il progetto **ValgeMed**
3. Vai su **Settings** → **Environment Variables**
4. Clicca **Add New**
5. Compila:
   - **Name**: `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
   - **Value**: incolla il Client ID copiato prima
   - **Environment**: seleziona **Production** (e **Preview** se vuoi)
6. Clicca **Save**

---

## Step 7: Redeploy su Vercel

1. Sempre su Vercel, vai su **Deployments**
2. Clicca sui **3 puntini** sull'ultimo deployment
3. Clicca **Redeploy**
4. Aspetta che finisca (~2 minuti)

---

## Step 8: Test

1. Apri https://valgemed.vercel.app
2. Vai su **Settings** → **Import/Export**
3. Clicca **Google Drive**
4. Dovrebbe aprirsi un popup di Google per il login
5. Dopo il login, torni all'app e il file viene uploadato

---

## Risoluzione Problemi

### Errore: "Access blocked: This app's request is invalid"
- Controlla che il redirect URI sia **esattamente** uguale
- Deve essere: `https://valgemed.vercel.app/api/export/google-callback`
- Niente slash finale, niente http

### Errore: "Google Drive access denied"
- Assicurati di aver aggiunto il tuo email in **Test users** (Step 3)
- O pubblica l'app (ma richiede verifica Google)

### Il popup non si apre
- Controlla i popup blocker del browser
- Su mobile: prova da desktop prima

---

## OneDrive Setup (opzionale)

Per OneDrive serve:
1. Registrare app su https://portal.azure.com
2. Usare OneDrive File Picker SDK
3. Più complesso di Google Drive

Per ora il bottone OneDrive **scarica solo il file** — l'utente può poi uploadarlo manualmente.
