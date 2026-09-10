import React from 'react';
import { MEDICAL_GLOSSARY } from '../../data/medicalGlossary';
import { MedicalGlossaryTerm } from './MedicalGlossaryTerm';

interface GlossaryTextProps {
  text: string;
  className?: string;
}

// Build regex matching any glossary term or alias
const ALL_KEYS: { key: string; termId: string }[] = [];
Object.values(MEDICAL_GLOSSARY).forEach((entry) => {
  ALL_KEYS.push({ key: entry.term, termId: entry.id });
  entry.aliases.forEach((alias) => {
    ALL_KEYS.push({ key: alias, termId: entry.id });
  });
});

// Sort longer terms first to match greedy
ALL_KEYS.sort((a, b) => b.key.length - a.key.length);

export const GlossaryText: React.FC<GlossaryTextProps> = ({ text, className = '' }) => {
  if (!text) return null;

  // Escape regex special chars
  const pattern = ALL_KEYS.map((item) =>
    item.key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  ).join('|');

  const regex = new RegExp(`\\b(${pattern})\\b`, 'gi');

  const parts = text.split(regex);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        const matched = ALL_KEYS.find(
          (k) => k.key.toLowerCase() === part.toLowerCase()
        );

        if (matched) {
          return (
            <MedicalGlossaryTerm key={index} term={matched.termId}>
              {part}
            </MedicalGlossaryTerm>
          );
        }

        return <React.Fragment key={index}>{part}</React.Fragment>;
      })}
    </span>
  );
};
