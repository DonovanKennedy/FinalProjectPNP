import type { Problem } from '@/lib/graph';

export type ProblemMeta = {
  id: Problem;
  name: string;
  short: string;
  color: string;
  soft: string;
  symbol: string;
  bound: 'at least' | 'at most';
  optimalWord: 'maximum' | 'minimum';
  definition: string;
  decision: string;
  kQuestion: string;
};

export const PROBLEMS: ProblemMeta[] = [
  {
    id: 'independent',
    name: 'Independent Set',
    short: 'IS',
    color: '#22C55E',
    soft: 'rgba(34,197,94,0.14)',
    symbol: 'α(G)',
    bound: 'at least',
    optimalWord: 'maximum',
    definition:
      'An independent set is a collection of vertices where no two selected vertices are connected by an edge.',
    decision: 'Given a graph G and an integer k, does G contain an independent set of size at least k?',
    kQuestion: 'Can you find at least k vertices satisfying the required condition?',
  },
  {
    id: 'clique',
    name: 'Clique',
    short: 'CL',
    color: '#A855F7',
    soft: 'rgba(168,85,247,0.15)',
    symbol: 'ω(G)',
    bound: 'at least',
    optimalWord: 'maximum',
    definition:
      'A clique is a collection of vertices where every pair of distinct selected vertices is connected by an edge.',
    decision: 'Given a graph G and an integer k, does G contain a clique of size at least k?',
    kQuestion: 'Can you find at least k vertices satisfying the required condition?',
  },
  {
    id: 'cover',
    name: 'Vertex Cover',
    short: 'VC',
    color: '#F59E0B',
    soft: 'rgba(245,158,11,0.14)',
    symbol: 'τ(G)',
    bound: 'at most',
    optimalWord: 'minimum',
    definition:
      'A vertex cover is a collection of vertices such that every edge in the graph has at least one endpoint in the selected collection.',
    decision: 'Given a graph G and an integer k, does G contain a vertex cover of size at most k?',
    kQuestion: 'Can you cover every edge using at most k vertices?',
  },
];

export const META: Record<Problem, ProblemMeta> = Object.fromEntries(
  PROBLEMS.map((p) => [p.id, p]),
) as Record<Problem, ProblemMeta>;
