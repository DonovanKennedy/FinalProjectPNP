export type Graph = {
  id: string;
  name: string;
  vertices: { id: string; x: number; y: number }[];
  edges: [string, string][];
};
export type Problem = 'independent' | 'clique' | 'cover';

function circularGraph(id: string, name: string, n: number, edges: [string, string][]): Graph {
  return {
    id, name, edges,
    vertices: Array.from({ length: n }, (_, i) => ({
      id: String.fromCharCode(65 + i),
      x: 300 + 180 * Math.cos(-Math.PI / 2 + i * 2 * Math.PI / n),
      y: 200 + 150 * Math.sin(-Math.PI / 2 + i * 2 * Math.PI / n),
    })),
  };
}

export const GRAPHS: Graph[] = [
  circularGraph('beginner', 'Beginner', 5, [['A', 'B'], ['B', 'C'], ['C', 'D'], ['D', 'E']]),
  circularGraph('intermediate', 'Intermediate', 7, [
    ['A', 'B'], ['B', 'C'], ['A', 'C'], ['C', 'D'], ['D', 'E'],
    ['E', 'F'], ['F', 'G'], ['G', 'D'], ['B', 'F'],
  ]),
  circularGraph('advanced', 'Advanced', 8, [
    ['A', 'B'], ['A', 'C'], ['B', 'C'], ['B', 'D'], ['C', 'E'],
    ['D', 'E'], ['D', 'F'], ['E', 'F'], ['E', 'G'], ['F', 'H'],
    ['G', 'H'], ['A', 'H'], ['C', 'G'],
  ]),
  circularGraph('complete', 'Complete Graph', 5,
    Array.from({ length: 5 }, (_, i) =>
      Array.from({ length: 4 - i }, (_, j): [string, string] =>
        [String.fromCharCode(65 + i), String.fromCharCode(66 + i + j)]),
    ).flat()),
];

const edgeKey = (a: string, b: string) => [a, b].sort().join(':');
const edgeIndex = (graph: Graph) => new Set(graph.edges.map(([a, b]) => edgeKey(a, b)));

function knownVertices(graph: Graph, selected: readonly string[]): boolean {
  const ids = new Set(graph.vertices.map(v => v.id));
  return selected.every(id => ids.has(id));
}

export function isIndependentSet(graph: Graph, selected: readonly string[]): boolean {
  const set = new Set(selected);
  return knownVertices(graph, selected) && graph.edges.every(([a, b]) => !(set.has(a) && set.has(b)));
}

export function isClique(graph: Graph, selected: readonly string[]): boolean {
  if (!knownVertices(graph, selected)) return false;
  const ids = [...new Set(selected)];
  const edges = edgeIndex(graph);
  return ids.every((a, i) => ids.slice(i + 1).every(b => edges.has(edgeKey(a, b))));
}

export function isVertexCover(graph: Graph, selected: readonly string[]): boolean {
  const set = new Set(selected);
  return knownVertices(graph, selected) && graph.edges.every(([a, b]) => set.has(a) || set.has(b));
}

const predicates = { independent: isIndependentSet, clique: isClique, cover: isVertexCover };

/** Exhaustive enumeration is intentionally restricted to small educational graphs. */
export function findSolutions(graph: Graph, problem: Problem): string[][] {
  const n = graph.vertices.length;
  if (n > 20) throw new RangeError('Exhaustive search supports at most 20 vertices.');
  const solutions: string[][] = [];
  for (let mask = 0; mask < 2 ** n; mask++) {
    const subset = graph.vertices.filter((_, i) => Math.floor(mask / 2 ** i) % 2 === 1).map(v => v.id);
    if (predicates[problem](graph, subset)) solutions.push(subset);
  }
  // Stable sorting preserves deterministic subset order within each size.
  return solutions.sort((a, b) => problem === 'cover' ? a.length - b.length : b.length - a.length);
}

export const findIndependentSets = (graph: Graph) => findSolutions(graph, 'independent');
export const findCliques = (graph: Graph) => findSolutions(graph, 'clique');
export const findVertexCovers = (graph: Graph) => findSolutions(graph, 'cover');
export const getMaximumIndependentSet = (graph: Graph) => findIndependentSets(graph)[0]!;
export const getMaximumClique = (graph: Graph) => findCliques(graph)[0]!;
export const getMinimumVertexCover = (graph: Graph) => findVertexCovers(graph)[0]!;
export const optimalSize = (graph: Graph, problem: Problem) => findSolutions(graph, problem)[0]!.length;
export function optimalSolutions(graph: Graph, problem: Problem): string[][] {
  const all = findSolutions(graph, problem);
  return all.filter(s => s.length === all[0]!.length);
}
export const meetsTarget = (problem: Problem, size: number, k: number) =>
  problem === 'cover' ? size <= k : size >= k;
function hasSolution(graph: Graph, problem: Problem, k: number): boolean {
  if (!Number.isInteger(k) || k < 0) return false;
  return findSolutions(graph, problem).some(s => meetsTarget(problem, s.length, k));
}
export const hasIndependentSetOfSize = (graph: Graph, k: number) => hasSolution(graph, 'independent', k);
export const hasCliqueOfSize = (graph: Graph, k: number) => hasSolution(graph, 'clique', k);
export const hasVertexCoverOfSize = (graph: Graph, k: number) => hasSolution(graph, 'cover', k);

export function complementGraph(graph: Graph): Graph {
  const edges = edgeIndex(graph);
  const complement: [string, string][] = [];
  graph.vertices.forEach((a, i) => {
    graph.vertices.slice(i + 1).forEach(b => {
      if (!edges.has(edgeKey(a.id, b.id))) complement.push([a.id, b.id]);
    });
  });
  return { ...graph, id: `${graph.id}-complement`, name: `${graph.name} (complement)`, edges: complement };
}

export function validateSelection(graph: Graph, problem: Problem, selected: readonly string[], k: number) {
  const ids = [...new Set(selected)];
  const set = new Set(ids);
  const edges = edgeIndex(graph);
  const conflictEdges: [string, string][] = [];
  if (problem === 'clique') {
    ids.forEach((a, i) => ids.slice(i + 1).forEach(b => {
      if (!edges.has(edgeKey(a, b))) conflictEdges.push([a, b]);
    }));
  } else {
    graph.edges.forEach(([a, b]) => {
      if (problem === 'independent' ? set.has(a) && set.has(b) : !set.has(a) && !set.has(b)) {
        conflictEdges.push([a, b]);
      }
    });
  }
  const structural = predicates[problem](graph, ids);
  const target = Number.isInteger(k) && k >= 0 && meetsTarget(problem, ids.length, k);
  const pair = conflictEdges[0];
  const name = { independent: 'independent set', clique: 'clique', cover: 'vertex cover' }[problem];
  let message: string;
  if (!knownVertices(graph, ids)) {
    message = 'Your selection contains a vertex that is not in this graph.';
  } else if (!structural && pair) {
    const [a, b] = pair;
    message = problem === 'independent'
      ? `Vertices ${a} and ${b} share an edge, so they cannot both belong to an independent set.`
      : problem === 'clique'
        ? `Vertices ${a} and ${b} are not connected, so your selection is not a clique.`
        : `The edge between ${a} and ${b} is uncovered. Select at least one of its endpoints.`;
  } else if (!target) {
    message = `Your selection is a valid ${name}, but it contains ${ids.length} ${ids.length === 1 ? 'vertex' : 'vertices'}. The target requires ${problem === 'cover' ? 'at most' : 'at least'} ${k}.`;
  } else {
    message = problem === 'independent'
      ? 'Correct! None of your selected vertices are adjacent, and your set meets the required size.'
      : problem === 'clique'
        ? 'Correct! Every pair of selected vertices is connected, and your set meets the required size.'
        : 'Correct! Every edge has a selected endpoint, and your set uses no more than the allowed number of vertices.';
  }
  return { structural, meetsTarget: target, valid: structural && target, message, conflictEdges };
}
