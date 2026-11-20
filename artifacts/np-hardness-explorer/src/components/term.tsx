import { type ReactNode } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export const GLOSSARY: Record<string, string> = {
  vertex: 'A vertex (node) is a basic point of a graph. Here vertices are labelled A, B, C, ...',
  edge: 'An edge joins two distinct vertices. These graphs are undirected and simple: no self-loops, no duplicate edges.',
  adjacent: 'Two vertices are adjacent when an edge joins them directly.',
  certificate: 'A certificate is a proposed solution (for example, a set of vertices) that a verifier can check.',
  polynomial: 'Polynomial time: running time bounded by O(n^c) for some constant c, where n is the input size.',
  maximum: 'Maximum means largest possible size over all valid sets. A maximal set merely cannot be extended — it may be smaller than a maximum one.',
  minimum: 'Minimum means smallest possible size over all valid covers. An inclusion-minimal cover cannot lose a vertex — it may be larger than a minimum one.',
};

export function Term({ k, children }: { k: keyof typeof GLOSSARY | string; children: ReactNode }) {
  return (
    <Tooltip delayDuration={150}>
      <TooltipTrigger asChild>
        <button
          type="button"
          data-testid={`term-${k}`}
          className="inline cursor-help border-b border-dotted border-sky-400/60 text-inherit hover:text-sky-300 focus-visible:outline-none focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-sky-400/70"
        >
          {children}
        </button>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs bg-[#16213a] text-slate-100 border border-slate-600/60 text-xs leading-relaxed">
        {GLOSSARY[k]}
      </TooltipContent>
    </Tooltip>
  );
}
