// Déclarations minimales pour la Web Speech API (dictée vocale, voir
// devis-clients/nouveau/FormulaireNouveauDevis.tsx) — absente de lib.dom.d.ts (seuls
// SpeechRecognitionResult/ResultList/Alternative y figurent), et sans @types officiel
// puisque l'API n'est pas standardisée. Couvre uniquement ce qui est utilisé ici.
export {};

declare global {
  interface SpeechRecognitionEvent extends Event {
    readonly resultIndex: number;
    readonly results: SpeechRecognitionResultList;
  }

  interface SpeechRecognitionErrorEvent extends Event {
    readonly error: string;
  }

  interface SpeechRecognition extends EventTarget {
    lang: string;
    continuous: boolean;
    interimResults: boolean;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
    onend: (() => void) | null;
    start(): void;
    stop(): void;
    abort(): void;
  }

  interface Window {
    SpeechRecognition?: { new (): SpeechRecognition };
    webkitSpeechRecognition?: { new (): SpeechRecognition };
  }
}
