"use client";

import { useState } from "react";
import { HelpCircle, X, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export function GoogleDriveHelp() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
        className="text-text-muted hover:text-text-primary"
      >
        <HelpCircle className="h-4 w-4" />
        <span className="hidden sm:inline">Setup Guide</span>
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-2xl bg-bg-elevated p-6 shadow-2xl">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 rounded-lg p-2 text-text-muted hover:bg-bg-subtle hover:text-text-primary"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-2xl font-bold text-text-primary mb-4">
              Google Drive Export Setup
            </h2>

            <div className="space-y-6 text-sm text-text-secondary">
              <section>
                <h3 className="font-semibold text-text-primary mb-2">Step 1: Crea Progetto Google Cloud</h3>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Vai su <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1 w-fit">console.cloud.google.com <ExternalLink className="h-3 w-3" /></a></li>
                  <li><strong>Select a project</strong> → <strong>NEW PROJECT</strong></li>
                  <li>Nome: <code className="bg-bg-subtle px-1.5 py-0.5 rounded">ValgeMed</code></li>
                  <li>Clicca <strong>CREATE</strong></li>
                </ol>
              </section>

              <section>
                <h3 className="font-semibold text-text-primary mb-2">Step 2: Abilita Google Drive API</h3>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Menu: <strong>APIs & Services</strong> → <strong>Library</strong></li>
                  <li>Cerca <strong>Google Drive API</strong></li>
                  <li>Clicca <strong>ENABLE</strong></li>
                </ol>
              </section>

              <section>
                <h3 className="font-semibold text-text-primary mb-2">Step 3: OAuth Consent Screen</h3>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Menu: <strong>APIs & Services</strong> → <strong>OAuth consent screen</strong></li>
                  <li>Seleziona <strong>External</strong> → <strong>CREATE</strong></li>
                  <li>Compila: App name (<code className="bg-bg-subtle px-1.5 py-0.5 rounded">ValgeMed</code>), email</li>
                  <li><strong>Scopes</strong> → Aggiungi: <code className="bg-bg-subtle px-1.5 py-0.5 rounded text-xs break-all">.../auth/drive.file</code></li>
                  <li><strong>Test users</strong> → Aggiungi il tuo indirizzo email</li>
                </ol>
              </section>

              <section>
                <h3 className="font-semibold text-text-primary mb-2">Step 4: Crea OAuth Client ID</h3>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Menu: <strong>APIs & Services</strong> → <strong>Credentials</strong></li>
                  <li><strong>+ CREATE CREDENTIALS</strong> → <strong>OAuth client ID</strong></li>
                  <li>Type: <strong>Web application</strong></li>
                  <li><strong>Authorized JavaScript origins</strong>:
                    <ul className="list-disc list-inside ml-4 mt-1 space-y-0.5">
                      <li><code className="bg-bg-subtle px-1.5 py-0.5 rounded text-xs">https://valgemed.vercel.app</code></li>
                    </ul>
                  </li>
                  <li><strong>Authorized redirect URIs</strong>:
                    <ul className="list-disc list-inside ml-4 mt-1 space-y-0.5">
                      <li><code className="bg-bg-subtle px-1.5 py-0.5 rounded text-xs">https://valgemed.vercel.app/api/export/google-callback</code></li>
                    </ul>
                  </li>
                  <li>Clicca <strong>CREATE</strong></li>
                </ol>
              </section>

              <section>
                <h3 className="font-semibold text-text-primary mb-2">Step 5: Copia Client ID</h3>
                <p className="mb-2">Copia il <strong>Client ID</strong> (quello che finisce con <code className="bg-bg-subtle px-1.5 py-0.5 rounded text-xs">.apps.googleusercontent.com</code>)</p>
              </section>

              <section>
                <h3 className="font-semibold text-text-primary mb-2">Step 6: Aggiungi a Vercel</h3>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Vai su <a href="https://vercel.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1 w-fit">vercel.com/dashboard <ExternalLink className="h-3 w-3" /></a></li>
                  <li>Progetto <strong>ValgeMed</strong> → <strong>Settings</strong> → <strong>Environment Variables</strong></li>
                  <li><strong>Add New</strong>:
                    <ul className="list-disc list-inside ml-4 mt-1 space-y-0.5">
                      <li>Name: <code className="bg-bg-subtle px-1.5 py-0.5 rounded text-xs">NEXT_PUBLIC_GOOGLE_CLIENT_ID</code></li>
                      <li>Value: incolla il Client ID</li>
                      <li>Environment: <strong>Production</strong></li>
                    </ul>
                  </li>
                  <li><strong>Save</strong></li>
                </ol>
              </section>

              <section>
                <h3 className="font-semibold text-text-primary mb-2">Step 7: Redeploy</h3>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Vercel → <strong>Deployments</strong></li>
                  <li>3 puntini → <strong>Redeploy</strong></li>
                  <li>Aspetta ~2 minuti</li>
                </ol>
              </section>

              <div className="pt-4 border-t border-border">
                <h3 className="font-semibold text-text-primary mb-2">Test</h3>
                <p>1. Apri l'app → Settings → Import/Export</p>
                <p>2. Clicca <strong>Google Drive</strong></p>
                <p>3. Login Google → Upload automatico!</p>
              </div>

              <div className="pt-4 border-t border-border">
                <h3 className="font-semibold text-rose mb-2">Problemi comuni</h3>
                <ul className="space-y-2">
                  <li><strong className="text-text-primary">"Access blocked"</strong>: Controlla redirect URI (deve essere esatto)</li>
                  <li><strong className="text-text-primary">"Access denied"</strong>: Aggiungi email in Test users</li>
                  <li><strong className="text-text-primary">Popup non si apre</strong>: Disabilita popup blocker</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button onClick={() => setOpen(false)}>
                Got it
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}