// ─────────────────────────────────────────────────────────────
// IMPORT
// ─────────────────────────────────────────────────────────────


import { useRef, useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router";
import { useCookingTimer } from "./hooks/useCookingTimer";
import { createAction, stopAction, voteAction } from "./services/actionService";
import type { FeedbackValue, Product } from "./types";

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
  // ── NAVIGAZIONE ─────────────────────────────────────────────
  // Navigazione: la schermata corrente è decisa dall'URL ("/" e "/timer").
  const navigate = useNavigate();

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
  // Separato dalla rotta perché la modale è un overlay che può apparire
  // sopra qualsiasi schermata senza cambiare la schermata sottostante.
  const [showFeedback, setShowFeedback] = useState<boolean>(false);

  // ── HOOK CUSTOM: timer di cottura ───────────────────────────
  // `timer` è un oggetto restituito da useCookingTimer().
  // Contiene tipicamente: secondi rimanenti, running, start(), stop(), reset(sec), ecc.
  // Incapsulare la logica del timer in un hook custom mantiene App "pulito":
  // qui non c'è nessun setInterval, nessun conteggio, nessuna logica temporale.
  // Il vantaggio è che lo stesso hook può essere testato isolatamente.
  const timer = useCookingTimer();

  // ID dell'azione (cottura) in corso nel JSON "actions", oppure null.
  // Ref e non stato: non serve ridisegnare l'interfaccia quando cambia.
  const actionIdRef = useRef<number | null>(null);

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
    // Una nuova scansione chiude il discorso con l'eventuale cottura precedente.
    actionIdRef.current = null;

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

    // 4. Naviga verso la rotta '/timer'.
    //    Questo fa sì che il render successivo mostri TimerScreen.
    navigate("/timer");
  };

  // ───────────────────────────────────────────────────────────
  // HANDLER: avvio del timer
  // ───────────────────────────────────────────────────────────
  // Alla prima pressione di Start registra l'inizio della cottura nel JSON
  // "actions". Riavviare dopo uno Stop (pausa) non crea una nuova azione.
  const handleStart = () => {
    if (product && actionIdRef.current === null) {
      const action = createAction({
        codebar: product.barcode,
        system_code: product.systemCode ?? "",
        description: product.name,
        total_time: Math.round(timer.remainingMs / 1000),
      });
      actionIdRef.current = action.ID;
    }
    timer.start();
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

    // Registra la fine della cottura (se il timer era stato avviato).
    if (actionIdRef.current !== null) stopAction(actionIdRef.current);

    // Mostra la modale di feedback.
    // Nota: NON cambiamo schermata qui. La modale è un overlay sopra 'timer',
    // quindi l'utente vede ancora i dettagli dietro il modale.
    setShowFeedback(true);
  };

  // ───────────────────────────────────────────────────────────
  // HANDLER: uscita dal timer verso la home (dopo conferma)
  // ───────────────────────────────────────────────────────────
  // Riporta il timer al valore di default del prodotto: `reset` ferma
  // anche conteggio e allarme, quindi nulla continua in background.
  // Riaprendo il prodotto dalla cronologia, `handleScanned` riparte da qui.
  const handleExitToHome = () => {
    // La cottura abbandonata resta nel JSON senza stop_time: non conta come conclusa.
    actionIdRef.current = null;
    if (product) timer.reset(product.cookingSeconds);
    navigate("/");
  };

  // ───────────────────────────────────────────────────────────
  // HANDLER: scelta del feedback
  // ───────────────────────────────────────────────────────────
  // Chiamato da FeedbackModal quando l'utente seleziona un voto
  // (pollice su, pollice giù, skip, ecc. — dipende da FeedbackValue).
  //
  // Responsabilità:
  //   1. salvare il voto (+1 / -1) nell'azione in corso nel JSON "actions"
  //   2. chiudere la modale
  //   3. tornare alla home ('/')
  const handleFeedback = (value: FeedbackValue) => {
    // positivo = +1, negativo = -1 (0 significa "nessun voto").
    if (actionIdRef.current !== null) {
      voteAction(actionIdRef.current, value === "positive" ? 1 : -1);
      actionIdRef.current = null;
    }

    // Chiude la modale.
    setShowFeedback(false);

    // Torna alla home. Da qui l'utente può scansionare un nuovo prodotto.
    // Nota: `product` NON viene azzerato. Questo significa che se l'utente
    // in futuro tornasse a 'timer' senza un nuovo scan, vedrebbe
    // ancora l'ultimo prodotto. Se questo non è desiderato, andrebbe fatto
    // `setProduct(null)` qui.
    navigate("/");
  };

  // ───────────────────────────────────────────────────────────
  // RENDER
  // ───────────────────────────────────────────────────────────
  // L'URL decide quale schermata mostrare (`<Routes>`), più eventualmente
  // il modale di feedback sopra.
  //
  // Perché un Fragment `<>...</>`?
  //   - Perché vogliamo restituire più elementi fratelli (le schermate + modale)
  //     senza aggiungere un <div> wrapper che spaccherebbe il layout.
  return (
    <>
      {/* ── ROTTE ────────────────────────────────────────────
          "/"       → HomeScreen (titolo, cronologia, scanner)
          "/timer"  → TimerScreen; richiede un prodotto già scansionato.
                      Se `product` è null (es. ricarica della pagina o URL
                      digitato a mano) si torna alla home.
          qualsiasi altro percorso → home.
          I dettagli del prodotto non hanno una rotta: sono un pannello
          dentro TimerScreen. */}
      <Routes>
        <Route
          path="/"
          element={<HomeScreen history={history} onScanned={handleScanned} />}
        />
        <Route
          path="/timer"
          element={
            product ? (
              <TimerScreen
                product={product}
                timer={timer}
                onDone={handleDone}
                onExit={handleExitToHome}
                onStart={handleStart}
              />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* ── MODALE FEEDBACK (overlay) ───────────────────────
          Condizione indipendente dalla rotta: la modale è un overlay
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