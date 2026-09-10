import { useState, useCallback } from 'react';
import { MedicalGlossaryEntry, findGlossaryEntry } from '../../data/medicalGlossary';
import { audio } from '../../utils/audio';

// Lightweight singleton subscriber pattern for touch-to-explain glossary
type GlossaryListener = (entry: MedicalGlossaryEntry | null) => void;
let activeEntry: MedicalGlossaryEntry | null = null;
const listeners = new Set<GlossaryListener>();

export function openGlossaryTerm(termOrId: string) {
  const entry = findGlossaryEntry(termOrId);
  if (entry) {
    audio.playTelemetryClick();
    activeEntry = entry;
    listeners.forEach((l) => l(activeEntry));
  }
}

export function closeGlossaryTerm() {
  activeEntry = null;
  listeners.forEach((l) => l(null));
}

export function useGlossary() {
  const [currentEntry, setCurrentEntry] = useState<MedicalGlossaryEntry | null>(activeEntry);

  const openTerm = useCallback((termOrId: string) => {
    openGlossaryTerm(termOrId);
  }, []);

  const closeTerm = useCallback(() => {
    closeGlossaryTerm();
  }, []);

  useState(() => {
    const listener: GlossaryListener = (entry) => {
      setCurrentEntry(entry);
    };
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  });

  return {
    currentEntry,
    openTerm,
    closeTerm,
  };
}
