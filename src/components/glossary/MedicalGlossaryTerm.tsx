import React from 'react';
import { openGlossaryTerm } from './useGlossaryStore';
import { HelpCircle } from 'lucide-react';

interface MedicalGlossaryTermProps {
  term: string;
  children?: React.ReactNode;
  className?: string;
}

export const MedicalGlossaryTerm: React.FC<MedicalGlossaryTermProps> = ({
  term,
  children,
  className = '',
}) => {
  return (
    <span
      onClick={(e) => {
        e.stopPropagation();
        openGlossaryTerm(term);
      }}
      title={`Touch to explain "${term}"`}
      className={`inline-flex items-center gap-0.5 border-b border-dashed border-rose-400 text-rose-500 hover:text-rose-600 font-semibold cursor-pointer transition-colors px-0.5 rounded-sm hover:bg-rose-50/50 ${className}`}
    >
      <span>{children || term}</span>
      <HelpCircle className="w-2.5 h-2.5 text-rose-400/80 inline shrink-0" />
    </span>
  );
};
