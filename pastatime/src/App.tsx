// ─────────────────────────────────────────────────────────────
// IMPORT
// ─────────────────────────────────────────────────────────────


import { useState } from "react";
import { useCookingTimer } from "./hooks/useCookingTimer";
import type { FeedbackValue, Product, Screen } from "./types";

// Componenti delle due schermate principali dell'app.
// Ogni schermata è un componente separato: App fa da "router" manuale.
import HomeScreen from "./screens/HomeScreen";
import TimerScreen from "./screens/TimerScreen";

// Modale di feedback mostrata a fine cottura.
// Componente separato perché ha vita propria (mostrata/nascosta via boolean).
import FeedbackModal from "./components/FeedbackModal";

// ─────────────────────────────────────────────────────────────
// COSTANTI DI MODULO
// ─────────────────────────────────────────────────────────────

// Numero massimo di elementi da conservare nella cronologia dei prodotti scansionati.
// Definito fuori dal componente così:
//   - non viene ricreato ad ogni render (irrilevante per un numero, ma è buona pratica)
//   - è facile da cambiare in un unico punto
//   - può essere importato altrove se serve
const MAX_HISTORY = 10;

// ─────────────────────────────────────────────────────────────
// COMPONENTE APP
// ─────────────────────────────────────────────────────────────

export default function App() {
  // ── STATO 1: schermata corrente ─────────────────────────────
  // `screen` è una macchina a stati semplice: 'home' | 'timer'.
  // Inizializzata a 'home': l'app parte sempre dalla schermata iniziale.
  // Il tipo `Screen` (importato) garantisce che non si possano assegnare
  // valori non previsti (typo, stringhe arbitrarie, ecc.).
  const [screen, setScreen] = useState<Screen>("home");

  // ── STATO 2: prodotto corrente ──────────────────────────────
  // `product` contiene i dati del prodotto scansionato attualmente "attivo".
  // È `Product | null` perché all'avvio non c'è nessun prodotto.
  // Viene popolato in `handleScanned` e usato da TimerScreen (che mostra i dettagli in un pannello al suo interno).
  const [product, setProduct] = useState<Product | null>(null);

  // ── STATO 3: cronologia dei prodotti scansionati ────────────
  // Array di `Product`, inizialmente vuoto.
  // Serve a mostrare nella Home gli ultimi prodotti scansionati (max MAX_HISTORY).
  // Nota: è uno stato separato da `product` perché la cronologia è una lista,
  // mentre `product` è il singolo elemento attivo.
  const [history, setHistory] = useState<Product[]>([]);

  // ── STATO 4: visibilità della modale di feedback ────────────
  // Boolean semplice: true = modale mostrata, false = nascosta.
  // Separato da `screen` perché la modale è un overlay che può apparire
  // sopra qualsiasi schermata senza cambiare la schermata sottostante.
  const [showFeedback, setShowFeedback] = useState<boolean>(false);

  // ── HOOK CUSTOM: timer di cottura ───────────────────────────
  // `timer` è un oggetto restituito da useCookingTimer().
  // Contiene tipicamente: secondi rimanenti, running, start(), stop(), reset(sec), ecc.
  // Incapsulare la logica del timer in un hook custom mantiene App "pulito":
  // qui non c'è nessun setInterval, nessun conteggio, nessuna logica temporale.
  // Il vantaggio è che lo stesso hook può essere testato isolatamente.
  const timer = useCookingTimer();

  // ───────────────────────────────────────────────────────────
  // HANDLER: prodotto scansionato
  // ───────────────────────────────────────────────────────────
  // Chiamato da HomeScreen quando lo scanner rileva un codice a barre
  // e riesce a risolvere un `Product` (via API o mock locale).
  //
  // Responsabilità:
  //   1. salvare il prodotto come "corrente"
  //   2. inserirlo in cima alla cronologia (deduplicando per barcode)
  //   3. inizializzare il timer con i secondi di cottura del prodotto
  //   4. passare alla schermata 'timer'
  const handleScanned = (scanned: Product) => {
    // 1. Imposta il prodotto corrente.
    //    Da questo momento TimerScreen (e il suo pannello dei dettagli) hanno i dati da mostrare.
    setProduct(scanned);

    // 2. Aggiorna la cronologia con una funzione updater.
    //    Perché la forma funzionale `(h) => ...`?
    //    - Evita race condition se più scansioni avvengono in rapida successione
    //    - Non dipende da `history` catturato nel closure (nessun bisogno di
    //      metterlo nelle dipendenze di eventuali useCallback)
    //
    //    Logica interna:
    //    a. `h.filter(p => p.barcode !== scanned.barcode)` rimuove eventuali
    //       duplicati dello stesso barcode già presenti in cronologia
    //    b. `[scanned, ...]` mette il nuovo prodotto in testa (most recent first)
    //    c. `.slice(0, MAX_HISTORY)` tronca a 10 elementi per non far crescere
    //       la lista all'infinito
    setHistory((h) =>
      [scanned, ...h.filter((p) => p.barcode !== scanned.barcode)].slice(
        0,
        MAX_HISTORY
      )
    );

    // 3. Inizializza il timer con il tempo di cottura del prodotto scansionato.
    //    `reset(sec)` (invece di `start(sec)`) suggerisce che il timer
    //    viene riportato a uno stato "pronto a partire", non avviato automaticamente.
    //    Se invece l'hook prevede che `reset` avvii subito il conto, il nome
    //    sarebbe fuorviante e andrebbe rivisto (vedi note finali).
    timer.reset(scanned.cookingSeconds);

    // 4. Cambia schermata: da 'home' a 'timer'.
    //    Questo fa sì che il render successivo mostri TimerScreen.
    setScreen("timer");
  };

  // ───────────────────────────────────────────────────────────
  // HANDLER: cottura terminata (o terminata manualmente)
  // ───────────────────────────────────────────────────────────
  // Chiamato da TimerScreen quando:
  //   - il conto alla rovescia arriva a zero, oppure
  //   - l'utente preme "Fatto"/"Stop" prima della fine
  //
  // Responsabilità:
  //   1. fermare il timer (se ancora in esecuzione)
  //   2. mostrare la modale di feedback
  const handleDone = () => {
    // Ferma il timer: interrompe eventuali interval/loop attivi.
    // È idempotente: chiamarlo su un timer già fermo non deve causare problemi.
    timer.stop();

    // Mostra la modale di feedback.
    // Nota: NON cambiamo schermata qui. La modale è un overlay sopra 'timer',
    // quindi l'utente vede ancora i dettagli dietro il modale.
    setShowFeedback(true);
  };

  // ───────────────────────────────────────────────────────────
  // HANDLER: scelta del feedback
  // ───────────────────────────────────────────────────────────
  // Chiamato da FeedbackModal quando l'utente seleziona un voto
  // (pollice su, pollice giù, skip, ecc. — dipende da FeedbackValue).
  //
  // Responsabilità:
  //   1. (futuro) persistere il feedback nel JSON "actions"
  //   2. chiudere la modale
  //   3. tornare alla schermata 'home'
  const handleFeedback = (value: FeedbackValue) => {
    // Il parametro `value` è tipizzato FeedbackValue.
    // Al momento non viene usato perché la persistenza è demandata
    // a un'altra parte del sistema ("a cura del collega", come da commento).
    //
    // `void value;` è un'istruzione "no-op" il cui unico scopo è
    // soddisfare il compilatore TypeScript quando `noUnusedParameters: true`:
    // dice esplicitamente "sì, so che questo parametro non viene usato".
    // In alternativa si potrebbe rinominare in `_value`, ma `void value` è
    // più esplicito nel segnalare l'intenzione "non usato di proposito".
    void value;

    // Chiude la modale.
    setShowFeedback(false);

    // Torna alla home. Da qui l'utente può scansionare un nuovo prodotto.
    // Nota: `product` NON viene azzerato. Questo significa che se l'utente
    // in futuro tornasse a 'timer' senza un nuovo scan, vedrebbe
    // ancora l'ultimo prodotto. Se questo non è desiderato, andrebbe fatto
    // `setProduct(null)` qui.
    setScreen("home");
  };

  // ───────────────────────────────────────────────────────────
  // RENDER
  // ───────────────────────────────────────────────────────────
  // L'App è un "router manuale": renderizza UNO dei blocchi condizionali
  // in base a `screen`, più eventualmente il modale di feedback sopra.
  //
  // Perché un Fragment `<>...</>`?
  //   - Perché vogliamo restituire più elementi fratelli (le schermate + modale)
  //     senza aggiungere un <div> wrapper che spaccherebbe il layout.
  return (
    <>
      {/* ── SCHERMATA HOME ──────────────────────────────────
          Mostrata solo se `screen === 'home'`.
          Riceve:
            - history: la lista degli ultimi prodotti scansionati
            - onScanned: callback chiamata quando lo scanner trova un prodotto
          Il componente HomeScreen contiene la logica della fotocamera/scanner
          e la UI della home. */}
      {screen === "home" && (
        <HomeScreen history={history} onScanned={handleScanned} />
      )}

      {/* ── SCHERMATA TIMER ─────────────────────────────────
          Doppia condizione:
            1. `screen === 'timer'` — l'utente è nella schermata timer
            2. `product` non è null — c'è un prodotto da mostrare
          Il secondo controllo è necessario perché TS non sa che se
          `screen === 'timer'` allora `product` è sicuramente valorizzato.
          È un "type guard" implicito: `product && ...` restringe il tipo
          da `Product | null` a `Product` dentro il blocco JSX.

          Riceve:
            - product: i dati del prodotto corrente
            - timer: l'oggetto hook del timer
            - onDone: callback per fine cottura / stop manuale
            I dettagli non passano da qui: li gestisce TimerScreen
            con un pannello (DetailsPanel) che si apre e si chiude da solo. */}
      {screen === "timer" && product && (
        <TimerScreen
          product={product}
          timer={timer}
          onDone={handleDone}
        />
      )}

      {/* ── MODALE FEEDBACK (overlay) ───────────────────────
          Condizione indipendente dallo `screen`: la modale è un overlay
          che può apparire sopra qualsiasi schermata.
          Riceve:
            - onSelect: callback chiamata con il valore scelto
              (FeedbackValue), gestita da handleFeedback.
          Quando `showFeedback` è false, il componente non viene
          nemmeno montato: nessun costo di rendering, nessun DOM. */}
      {showFeedback && <FeedbackModal onSelect={handleFeedback} />}
    </>
  );
}