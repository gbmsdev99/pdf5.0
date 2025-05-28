import React from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

interface MathRendererProps {
  latex: string;
  block?: boolean;
  className?: string;
}

export function MathRenderer({ latex, block = false, className = '' }: MathRendererProps) {
  if (!latex) return null;
  
  try {
    return block ? (
      <div className={`my-2 ${className}`}>
        <BlockMath math={latex} />
      </div>
    ) : (
      <span className={`inline-block align-middle ${className}`}>
        <InlineMath math={latex} />
      </span>
    );
  } catch (error) {
    console.error('Failed to render LaTeX:', error);
    return <span className="text-red-500">Failed to render equation</span>;
  }
}