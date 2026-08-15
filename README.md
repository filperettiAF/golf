# Registra Giro — HCP+Stat

App per registrare i giri di golf colpo per colpo, con calcolo degli *strokes gained*
per categoria (colpo dal tee, approccio, gioco corto, putting).

Funziona interamente nel browser: nessun server, nessun account, nessuna installazione.
Sull'iPhone si aggiunge alla schermata Home da Safari e da lì parte a schermo intero,
anche senza connessione.

**Indirizzo dell'app:** `https://TUONOME.github.io/golf/`

---

## I file

| File | A cosa serve | Si aggiorna? |
|---|---|---|
| `index.html` | l'app: schermate, calcoli, archivio dei campi | **sì, è l'unico** |
| `sw.js` | fa funzionare l'app senza connessione | mai |
| `manifest.webmanifest` | nome e icona sulla schermata Home | mai |
| `icon-180.png` | icona sul telefono | mai |
| `icon-512.png` | icona grande | mai |

I nomi non vanno cambiati: i file si cercano fra loro per nome.

## Come si aggiorna

Si sostituisce `index.html` e basta. L'indirizzo non cambia, quindi **i giri già
registrati restano tutti**. Sul telefono la versione nuova compare alla prima apertura
con connessione; senza connessione parte l'ultima versione salvata, quindi sul campo
non ci si blocca mai.

---

## I dati

**In questo repository non c'è nessun dato personale.** Qui c'è solo il programma.

I giri vivono nel telefono e, se la sincronizzazione è attiva, in un secondo repository
**privato** (`golf-dati`), un file JSON per ogni giro. Chi apre questo repository vede
il codice di un'app da golf vuota.

## Metodo di calcolo

Gli strokes gained sono calcolati su tabelle di colpi attesi per lie e distanza,
con baseline PGA Tour e una baseline scratch ricostruita. Metodo, fonti e limiti
dichiarati sono nella schermata **Metodo e fonti** dentro l'app.
