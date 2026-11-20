import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  GRAPHS, complementGraph, findSolutions, getMaximumIndependentSet,
  getMaximumClique, getMinimumVertexCover, hasIndependentSetOfSize,
  hasCliqueOfSize, hasVertexCoverOfSize, isIndependentSet, isClique,
  isVertexCover, validateSelection, type Graph, type Problem,
} from './graph.ts';

function graph(n: number, edges: [string, string][]): Graph {
  return { id: 'test', name: 'Test', vertices: Array.from({ length: n }, (_, i) => ({
    id: String.fromCharCode(65 + i), x: i, y: 0,
  })), edges };
}

const cases: [string, Graph, [number, number, number]][] = [
  ['K5', GRAPHS[3]!, [1, 5, 4]],
  ['edgeless five vertices', graph(5, []), [5, 1, 0]],
  ['P4', graph(4, [['A', 'B'], ['B', 'C'], ['C', 'D']]), [2, 2, 2]],
  ['K3', graph(3, [['A', 'B'], ['A', 'C'], ['B', 'C']]), [1, 3, 2]],
  ['zero vertices', graph(0, []), [0, 0, 0]],
];
for (const [name, g, expected] of cases) {
  test(`${name}: optima and independent-cover identity`, () => {
    const independent = getMaximumIndependentSet(g).length;
    const clique = getMaximumClique(g).length;
    const cover = getMinimumVertexCover(g).length;
    assert.deepEqual([independent, clique, cover], expected);
    assert.equal(independent + cover, g.vertices.length);
    assert.equal(clique, getMaximumIndependentSet(complementGraph(g)).length);
  });
}

for (const g of [...GRAPHS, ...cases.map(c => c[1])]) {
  test(`${g.name}/${g.vertices.length}: exhaustive invariants and decisions`, () => {
    for (const problem of ['independent', 'clique', 'cover'] as Problem[]) {
      const solutions = findSolutions(g, problem);
      assert.deepEqual(solutions, findSolutions(g, problem), 'deterministic');
      assert.equal(new Set(solutions.map(s => s.join(','))).size, solutions.length, 'no duplicate sets');
      const predicate = { independent: isIndependentSet, clique: isClique, cover: isVertexCover }[problem];
      for (const set of solutions) assert.ok(predicate(g, set));
      for (let k = 0; k <= g.vertices.length; k++) {
        const decision = { independent: hasIndependentSetOfSize, clique: hasCliqueOfSize, cover: hasVertexCoverOfSize }[problem](g, k);
        const candidates = solutions.filter(s => problem === 'cover' ? s.length <= k : s.length >= k);
        assert.equal(decision, candidates.length > 0);
        for (const set of candidates) assert.ok(validateSelection(g, problem, set, k).valid);
      }
    }
    const n = g.vertices.length;
    for (let mask = 0; mask < 2 ** n; mask++) {
      const set = g.vertices.filter((_, i) => (mask & 2 ** i) !== 0).map(v => v.id);
      const complement = g.vertices.map(v => v.id).filter(v => !set.includes(v));
      assert.equal(isIndependentSet(g, set), isVertexCover(g, complement));
      assert.equal(isClique(g, set), isIndependentSet(complementGraph(g), set));
    }
  });
}

test('empty selections and k=0', () => {
  const g = GRAPHS[0]!;
  assert.ok(isIndependentSet(g, []));
  assert.ok(isClique(g, []));
  assert.equal(isVertexCover(g, []), false);
  assert.ok(isVertexCover(graph(5, []), []));
  assert.ok(hasIndependentSetOfSize(g, 0));
  assert.ok(hasCliqueOfSize(g, 0));
  assert.equal(hasVertexCoverOfSize(g, 0), false);
  assert.ok(hasVertexCoverOfSize(graph(5, []), 0));
});

test('accurate conflicts and structural/target distinction', () => {
  const g = GRAPHS[0]!;
  assert.match(validateSelection(g, 'independent', ['A', 'B'], 2).message, /A and B share an edge/);
  assert.match(validateSelection(g, 'clique', ['A', 'C'], 2).message, /A and C are not connected/);
  assert.match(validateSelection(g, 'cover', [], 2).message, /A and B is uncovered/);
  const small = validateSelection(g, 'independent', ['A'], 3);
  assert.equal(small.structural, true);
  assert.equal(small.valid, false);
  assert.match(small.message, /at least 3/);
  const large = validateSelection(g, 'cover', g.vertices.map(v => v.id), 2);
  assert.equal(large.structural, true);
  assert.equal(large.valid, false);
  assert.match(large.message, /at most 2/);
});

test('duplicates normalize; unknown vertices rejected; invalid k rejected', () => {
  const g = GRAPHS[0]!;
  assert.equal(validateSelection(g, 'independent', ['A', 'A'], 2).valid, false);
  assert.equal(isIndependentSet(g, ['Z']), false);
  assert.equal(isClique(g, ['Z']), false);
  assert.equal(isVertexCover(g, ['Z']), false);
  assert.equal(hasCliqueOfSize(g, -1), false);
  assert.equal(hasIndependentSetOfSize(g, 1.5), false);
});
