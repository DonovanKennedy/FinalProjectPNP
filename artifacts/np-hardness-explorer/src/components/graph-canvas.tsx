import { type KeyboardEvent } from 'react';
import type { Graph, Problem } from '@/lib/graph';

type Props = {
  graph: Graph;
  displayEdges: [string, string][];
  problem: Problem;
  color: string;
  selected: string[];
  conflictEdges: [string, string][];
  complement: boolean;
  onToggle: (id: string) => void;
  interactiveHint: string;
};

const key = (a: string, b: string) => (a < b ? `${a}|${b}` : `${b}|${a}`);
const R = 24;

export function GraphCanvas({
  graph,
  displayEdges,
  problem,
  color,
  selected,
  conflictEdges,
  complement,
  onToggle,
  interactiveHint,
}: Props) {
  const sel = new Set(selected);
  const pos = new Map(graph.vertices.map((v) => [v.id, v]));
  const displayed = new Set(displayEdges.map(([a, b]) => key(a, b)));
  const conflicts = new Set(conflictEdges.map(([a, b]) => key(a, b)));
  const missing = conflictEdges.filter(([a, b]) => !displayed.has(key(a, b)));

  const edgeStyle = (a: string, b: string) => {
    if (conflicts.has(key(a, b))) return { stroke: '#F43F5E', width: 4, opacity: 1, dash: undefined as string | undefined };
    const sa = sel.has(a), sb = sel.has(b);
    if (complement) return { stroke: '#38BDF8', width: 2, opacity: 0.75, dash: '6 5' };
    if (problem === 'clique' && sa && sb) return { stroke: color, width: 4, opacity: 1, dash: undefined };
    if (problem === 'cover' && (sa || sb)) return { stroke: color, width: 3, opacity: 0.85, dash: undefined };
    if (problem === 'independent' && (sa || sb)) return { stroke: '#64748B', width: 2, opacity: 0.55, dash: undefined };
    return { stroke: '#475569', width: 2, opacity: 0.8, dash: undefined };
  };

  const onKey = (e: KeyboardEvent, id: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggle(id);
    }
  };

  return (
    <svg
      viewBox="0 0 600 400"
      className="w-full h-full select-none"
      role="group"
      aria-label={`${graph.name} graph with ${graph.vertices.length} vertices. ${interactiveHint}`}
      data-testid="svg-graph"
    >
      <defs>
        <filter id="soft" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
      </defs>
      {displayEdges.map(([a, b]) => {
        const va = pos.get(a), vb = pos.get(b);
        if (!va || !vb) return null;
        const s = edgeStyle(a, b);
        return (
          <line
            key={key(a, b)}
            className="edge"
            x1={va.x} y1={va.y} x2={vb.x} y2={vb.y}
            stroke={s.stroke} strokeWidth={s.width} strokeOpacity={s.opacity}
            strokeDasharray={s.dash} strokeLinecap="round"
          />
        );
      })}
      {missing.map(([a, b]) => {
        const va = pos.get(a), vb = pos.get(b);
        if (!va || !vb) return null;
        return (
          <line
            key={`m-${key(a, b)}`}
            className="dash-flow"
            x1={va.x} y1={va.y} x2={vb.x} y2={vb.y}
            stroke="#F43F5E" strokeWidth={2.5} strokeDasharray="7 6" strokeLinecap="round"
          >
            <title>{`Missing edge ${a}–${b}`}</title>
          </line>
        );
      })}
      {graph.vertices.map((v) => {
        const on = sel.has(v.id);
        return (
          <g
            key={v.id}
            className="vnode"
            role="button"
            tabIndex={0}
            aria-pressed={on}
            aria-label={`Vertex ${v.id}, ${on ? 'selected' : 'not selected'}`}
            data-testid={`node-${v.id}`}
            onClick={() => onToggle(v.id)}
            onKeyDown={(e) => onKey(e, v.id)}
          >
            <title>{`Vertex ${v.id}${on ? ' (selected)' : ''}`}</title>
            <circle className="halo" cx={v.x} cy={v.y} r={R + 10} fill={color} filter="url(#soft)" />
            {on && <circle cx={v.x} cy={v.y} r={R + 12} fill={color} opacity={0.22} filter="url(#soft)" />}
            <circle className="focus-ring" cx={v.x} cy={v.y} r={R + 8} fill="none" stroke="#38BDF8" strokeWidth={3} />
            <g className="pop" style={{ transform: on ? 'scale(1.08)' : 'scale(1)' }}>
              <circle cx={v.x} cy={v.y} r={R + 14} fill="transparent" />
              <circle
                className="body"
                cx={v.x} cy={v.y} r={R}
                fill={on ? color : '#131D33'}
                stroke={on ? '#F8FAFC' : '#5B6B86'}
                strokeWidth={on ? 3 : 2}
              />
              {on && (
                <circle cx={v.x} cy={v.y} r={R - 5} fill="none" stroke="#0B1120" strokeOpacity={0.45} strokeWidth={1.5} strokeDasharray="3 3" />
              )}
              <text
                x={v.x} y={v.y + 6}
                textAnchor="middle"
                fontFamily="JetBrains Mono, monospace"
                fontWeight={700}
                fontSize={17}
                fill={on ? '#0B1120' : '#E2E8F0'}
                pointerEvents="none"
              >
                {v.id}
              </text>
            </g>
          </g>
        );
      })}
    </svg>
  );
}
