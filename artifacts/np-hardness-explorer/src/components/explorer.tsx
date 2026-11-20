import { useMemo, useState, type CSSProperties } from 'react';
import {
  Check, Eraser, Eye, EyeOff, Lightbulb, Minus, MousePointerClick, Plus, Shuffle, Sparkles, Telescope, X, Info, CircleSlash,
} from 'lucide-react';
import {
  GRAPHS, findSolutions, optimalSize, optimalSolutions, meetsTarget, validateSelection, complementGraph,
  type Problem,
} from '@/lib/graph';
import { GraphCanvas } from '@/components/graph-canvas';
import { PROBLEMS, META } from '@/components/problem-meta';
import { Term } from '@/components/term';

type Mode = 'explore' | 'try';
type Validation = ReturnType<typeof validateSelection>;
type Notice = { tone: 'info' | 'warn' | 'no'; text: string } | null;

const sameSet = (a: string[], b: string[]) => a.length === b.length && [...a].sort().join() === [...b].sort().join();
const fmt = (s: string[]) => (s.length ? `{ ${[...s].sort().join(', ')} }` : '∅ (empty set)');

export function Explorer() {
  const [graphId, setGraphId] = useState(GRAPHS[0].id);
  const [problem, setProblem] = useState<Problem>('independent');
  const [mode, setMode] = useState<Mode>('explore');
  const graph = GRAPHS.find((g) => g.id === graphId) ?? GRAPHS[0];
  const [k, setK] = useState(() => optimalSize(GRAPHS[0], 'independent'));
  const [selected, setSelected] = useState<string[]>(() => optimalSolutions(GRAPHS[0], 'independent')[0] ?? []);
  const [result, setResult] = useState<Validation | null>(null);
  const [notice, setNotice] = useState<Notice>(null);
  const [hideAnswer, setHideAnswer] = useState(false);
  const [complement, setComplement] = useState(false);

  const meta = META[problem];
  const allSols = useMemo(() => findSolutions(graph, problem), [graph, problem]);
  const optSols = useMemo(() => optimalSolutions(graph, problem), [graph, problem]);
  const opt = useMemo(() => optimalSize(graph, problem), [graph, problem]);
  const targetSols = useMemo(() => allSols.filter((s) => meetsTarget(problem, s.length, k)), [allSols, problem, k]);
  const comp = useMemo(() => complementGraph(graph), [graph]);
  const exists = targetSols.length > 0;
  const n = graph.vertices.length;
  const live = useMemo(() => validateSelection(graph, problem, selected, k), [graph, problem, selected, k]);

  const resetTo = (gId: string, p: Problem, m: Mode) => {
    const g = GRAPHS.find((x) => x.id === gId) ?? GRAPHS[0];
    setK(optimalSize(g, p));
    setSelected(m === 'explore' ? optimalSolutions(g, p)[0] ?? [] : []);
    setResult(null);
    setNotice(null);
    if (p === 'cover') setComplement(false);
  };

  const chooseProblem = (p: Problem) => { setProblem(p); resetTo(graphId, p, mode); };
  const chooseGraph = (id: string) => { setGraphId(id); resetTo(id, problem, mode); };
  const chooseMode = (m: Mode) => {
    setMode(m);
    resetTo(graphId, problem, m);
  };

  const changeK = (next: number) => {
    const v = Math.max(0, Math.min(n, next));
    setK(v);
    setResult(null);
    setNotice(null);
    if (mode === 'explore') {
      const t = allSols.filter((s) => meetsTarget(problem, s.length, v));
      setSelected(t[0] ?? optSols[0] ?? []);
    }
  };

  const toggle = (id: string) => {
    if (mode === 'explore') {
      setMode('try');
      setSelected([id]);
      setResult(null);
      setNotice({ tone: 'info', text: `Switched to Try It Yourself. Selection cleared, then vertex ${id} selected. Keep clicking vertices to build your answer.` });
      return;
    }
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
    setResult(null);
    setNotice(null);
  };

  const showAnother = () => {
    if (!exists) {
      setNotice({ tone: 'no', text: `No ${meta.name.toLowerCase()} of size ${meta.bound} ${k} exists in this graph, so there is no target-meeting solution to cycle through.` });
      return;
    }
    if (targetSols.length <= 1) {
      setNotice({ tone: 'info', text: 'This is the only solution meeting the target — there is no additional distinct solution to show.' });
      return;
    }
    const idx = targetSols.findIndex((s) => sameSet(s, selected));
    const next = targetSols[(idx + 1) % targetSols.length];
    setSelected(next);
    setNotice(null);
  };

  const check = () => { setResult(validateSelection(graph, problem, selected, k)); setNotice(null); };
  const clear = () => { setSelected([]); setResult(null); setNotice(null); };
  const showSolution = () => {
    if (!exists) {
      setResult(null);
      setNotice({
        tone: 'no',
        text: `NO instance: exhaustive search over all 2^${n} = ${2 ** n} subsets found no ${meta.name.toLowerCase()} of size ${meta.bound} ${k}. The ${meta.optimalWord} size here is ${opt}. Adjust k to get a YES instance.`,
      });
      return;
    }
    const sol = targetSols[0];
    setSelected(sol);
    setResult(validateSelection(graph, problem, sol, k));
    setNotice({ tone: 'info', text: `Showing a ${sol.length === opt ? meta.optimalWord : 'valid'} solution that meets the target.` });
  };

  const showComplement = complement && problem !== 'cover';
  const conflicts = mode === 'try' && result && !showComplement ? result.conflictEdges : [];
  const solIndex = targetSols.findIndex((s) => sameSet(s, selected));
  const isOptimal = live.structural && selected.length === opt;
  const accentStyle = { '--acc': meta.color } as CSSProperties;

  const why = () => {
    const s = fmt(selected);
    if (problem === 'independent') return `No two vertices in ${s} are adjacent: every edge has at most one endpoint selected.`;
    if (problem === 'clique') {
      const p = (selected.length * (selected.length - 1)) / 2;
      return `All ${p} pair${p === 1 ? '' : 's'} of distinct vertices in ${s} ${p === 1 ? 'is' : 'are'} joined by an edge.`;
    }
    return `Each of the ${graph.edges.length} edges has at least one endpoint in ${s}.`;
  };

  return (
    <section id="explorer" className="relative" style={accentStyle} aria-labelledby="explorer-title">
      <h2 id="explorer-title" className="sr-only">Graph Explorer</h2>

      {/* Control rail */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between mb-4">
        <div role="radiogroup" aria-label="Problem" className="grid grid-cols-3 gap-1 rounded-xl border border-slate-700/60 bg-[#0E1729] p-1 w-full lg:w-auto">
          {PROBLEMS.map((p) => {
            const on = p.id === problem;
            return (
              <button
                key={p.id}
                role="radio"
                aria-checked={on}
                data-testid={`button-problem-${p.id}`}
                onClick={() => chooseProblem(p.id)}
                className="relative rounded-lg px-3 sm:px-5 py-2.5 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 hover:bg-slate-800/70"
                style={on ? { background: p.soft, color: p.color, boxShadow: `inset 0 0 0 1px ${p.color}66` } : { color: '#94A3B8' }}
              >
                <span className="inline-flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ background: p.color, opacity: on ? 1 : 0.45 }} />
                  {p.name}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
          <label className="flex flex-col gap-1">
            <span className="text-[11px] uppercase tracking-[0.16em] text-slate-400 font-mono">Choose a Graph</span>
            <select
              value={graphId}
              onChange={(e) => chooseGraph(e.target.value)}
              data-testid="select-graph"
              className="h-11 rounded-lg border border-slate-700 bg-[#0E1729] px-3 text-sm text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
            >
              {GRAPHS.map((g) => (
                <option key={g.id} value={g.id}>{g.name} — {g.vertices.length}V / {g.edges.length}E</option>
              ))}
            </select>
          </label>
          <div role="radiogroup" aria-label="Interaction mode" className="flex rounded-lg border border-slate-700 bg-[#0E1729] p-1 h-11">
            {([['explore', 'Explore', Telescope], ['try', 'Try It Yourself', MousePointerClick]] as const).map(([m, label, Icon]) => (
              <button
                key={m}
                role="radio"
                aria-checked={mode === m}
                data-testid={`button-mode-${m}`}
                onClick={() => chooseMode(m)}
                className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-md px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${mode === m ? 'bg-sky-400/15 text-sky-300 shadow-[inset_0_0_0_1px_rgba(56,189,248,.45)]' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <Icon className="h-4 w-4" />{label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.65fr)_minmax(320px,1fr)]">
        {/* Graph stage */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-700/60 bg-[#0D1628] lab-grid shadow-[0_30px_60px_-30px_rgba(0,0,0,.7)]">
          <div className="absolute inset-x-0 top-0 h-[3px] transition-colors duration-300" style={{ background: meta.color }} />
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 pt-4 sm:px-5">
            <div className="flex items-center gap-2 font-mono text-xs text-slate-400">
              <span className="rounded bg-slate-800/80 px-2 py-1 text-slate-200" data-testid="text-graph-name">{graph.name}</span>
              <span data-testid="text-graph-size">|V| = {n} · |E| = {graph.edges.length}</span>
            </div>
            {problem !== 'cover' && (
              <button
                onClick={() => setComplement((c) => !c)}
                aria-pressed={showComplement}
                data-testid="button-toggle-complement"
                className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-mono transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${showComplement ? 'border-sky-400/60 bg-sky-400/10 text-sky-300' : 'border-slate-700 text-slate-400 hover:text-slate-200'}`}
              >
                {showComplement ? 'Viewing complement Ḡ' : 'View complement Ḡ'}
              </button>
            )}
          </div>
          <div className="aspect-[3/2] w-full px-1 sm:px-3 lg:min-h-[52vh] lg:aspect-auto lg:h-[58vh]">
            <GraphCanvas
              graph={graph}
              displayEdges={showComplement ? comp.edges : graph.edges}
              problem={problem}
              color={meta.color}
              selected={selected}
              conflictEdges={conflicts}
              complement={showComplement}
              onToggle={toggle}
              interactiveHint={mode === 'explore' ? 'Activating a vertex switches to Try It Yourself mode.' : 'Press Enter or Space on a vertex to select or deselect it.'}
            />
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-slate-800 px-4 py-2.5 text-[11px] font-mono text-slate-400 sm:px-5">
            <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded-full border-2 border-slate-100" style={{ background: meta.color }} />selected</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded-full border-2 border-slate-500 bg-[#131D33]" />unselected</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-[3px] w-4 bg-rose-500" />conflict</span>
            {problem === 'clique' && <span className="inline-flex items-center gap-1.5"><span className="w-4 border-t-2 border-dashed border-rose-500" />missing edge</span>}
            {showComplement && <span className="text-sky-300">Ḡ edges shown dashed · checks still use G</span>}
            <span className="ml-auto hidden sm:inline">{mode === 'explore' ? 'click a vertex to start experimenting' : 'Tab to a vertex · Enter / Space toggles'}</span>
          </div>
        </div>

        {/* Side panel */}
        <aside className="flex flex-col gap-3" aria-live="polite">
          <div key={problem} className="rise rounded-2xl border border-slate-700/60 bg-[#131D33] p-5">
            <div className="flex items-baseline justify-between">
              <h3 className="font-display text-2xl font-bold" style={{ color: meta.color }} data-testid="text-problem-title">{meta.name}</h3>
              <span className="font-mono text-xs text-slate-400">NP-complete</span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">{meta.definition}</p>
            <p className="mt-3 rounded-lg border border-slate-700/70 bg-[#0E1729] p-3 text-[13px] leading-relaxed text-slate-300">
              <span className="block font-mono text-[10px] uppercase tracking-[0.16em] text-slate-500 mb-1">Decision problem · answer YES / NO</span>
              Given a graph G and an integer k, does G contain {problem === 'independent' ? 'an independent set' : problem === 'clique' ? 'a clique' : 'a vertex cover'} of size{' '}
              <strong className="rounded px-1.5 py-0.5 font-mono" style={{ background: meta.soft, color: meta.color }}>
                {meta.bound === 'at least' ? '≥ at least k' : '≤ at most k'}
              </strong>?
            </p>
          </div>

          {/* k control */}
          <div className="rounded-2xl border border-slate-700/60 bg-[#131D33] p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-slate-400">Target k</div>
                <p className="mt-1 text-xs text-slate-400">{meta.kQuestion}</p>
              </div>
              <div className="flex items-center gap-1">
                <button aria-label="Decrease k" data-testid="button-k-decrease" disabled={k <= 0} onClick={() => changeK(k - 1)} className="grid h-9 w-9 place-items-center rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 disabled:opacity-35 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"><Minus className="h-4 w-4" /></button>
                <output className="w-14 text-center font-mono text-2xl font-bold" style={{ color: meta.color }} data-testid="text-k">{meta.bound === 'at least' ? '≥' : '≤'}{k}</output>
                <button aria-label="Increase k" data-testid="button-k-increase" disabled={k >= n} onClick={() => changeK(k + 1)} className="grid h-9 w-9 place-items-center rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 disabled:opacity-35 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"><Plus className="h-4 w-4" /></button>
              </div>
            </div>
            <input type="range" min={0} max={n} step={1} value={k} onChange={(e) => changeK(Number(e.target.value))} aria-label="Target k" data-testid="input-k" className="krange mt-4 w-full" />
            <div className="mt-1 flex justify-between font-mono text-[10px] text-slate-500"><span>0</span><span>{n}</span></div>

            <div className="mt-4 flex items-center gap-3">
              {hideAnswer && mode === 'try' ? (
                <div className="flex-1 rounded-lg border border-dashed border-slate-600 px-3 py-2 text-xs text-slate-400">Decision answer hidden — challenge mode.</div>
              ) : (
                <div
                  data-testid="status-decision"
                  className={`flex-1 flex items-center gap-3 rounded-lg px-3 py-2 border ${exists ? 'border-emerald-500/40 bg-emerald-500/10' : 'border-rose-500/40 bg-rose-500/10'}`}
                >
                  <span className={`font-mono text-lg font-bold ${exists ? 'text-emerald-300' : 'text-rose-300'}`}>{exists ? 'YES' : 'NO'}</span>
                  <span className="text-xs leading-snug text-slate-300">
                    {exists
                      ? `${targetSols.length} distinct solution${targetSols.length === 1 ? '' : 's'} of size ${meta.bound} ${k} exist${targetSols.length === 1 ? 's' : ''}.`
                      : `No ${meta.name.toLowerCase()} of size ${meta.bound} ${k} exists here.`}
                  </span>
                </div>
              )}
              {mode === 'try' && (
                <button onClick={() => setHideAnswer((h) => !h)} aria-pressed={hideAnswer} aria-label={hideAnswer ? 'Reveal decision answer' : 'Hide decision answer'} data-testid="button-toggle-answer" className="grid h-10 w-10 place-items-center rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400">
                  {hideAnswer ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
              )}
            </div>
            <p className="mt-2 font-mono text-[10px] leading-relaxed text-slate-500">
              Computed by exhaustive search over 2^{n} = {2 ** n} subsets — independent of your selection. {meta.optimalWord === 'maximum' ? 'Maximum' : 'Minimum'} {meta.symbol} = {opt}.
            </p>
          </div>

          {/* Mode panel */}
          <div className="rounded-2xl border border-slate-700/60 bg-[#131D33] p-5">
            <div className="flex items-center justify-between">
              <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-slate-400">{mode === 'explore' ? 'Highlighted solution' : 'Your selection'}</div>
              <div className="font-mono text-xs text-slate-300" data-testid="text-counter">
                <span className="text-lg font-bold" style={{ color: meta.color }}>{selected.length}</span> / {n} selected
              </div>
            </div>
            <div className="mt-2 font-mono text-sm text-slate-100 break-words" data-testid="text-selection">{fmt(selected)}</div>

            {mode === 'explore' ? (
              <div className="mt-3 space-y-3">
                <div className="flex flex-wrap gap-2">
                  {live.structural ? (
                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/12 px-2 py-1 text-xs text-emerald-300 border border-emerald-500/30"><Check className="h-3.5 w-3.5" />Valid {meta.name.toLowerCase()}</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-md bg-rose-500/12 px-2 py-1 text-xs text-rose-300 border border-rose-500/30"><X className="h-3.5 w-3.5" />Not valid</span>
                  )}
                  <span data-testid="status-optimal" className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs border" style={isOptimal ? { background: meta.soft, color: meta.color, borderColor: meta.color + '55' } : { color: '#CBD5E1', borderColor: '#334155' }}>
                    {isOptimal ? <><Sparkles className="h-3.5 w-3.5" />Optimal — <Term k={meta.optimalWord}>{meta.optimalWord}</Term></> : 'Valid, not optimal'}
                  </span>
                  {live.meetsTarget ? (
                    <span className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs border border-sky-400/30 text-sky-300">Meets k</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs border border-rose-500/40 text-rose-300"><CircleSlash className="h-3.5 w-3.5" />Fails target k</span>
                  )}
                </div>
                <p className="text-sm leading-relaxed text-slate-300">{why()}</p>
                {!live.meetsTarget && (
                  <p className="text-xs leading-relaxed text-rose-200/90 rounded-lg border border-rose-500/30 bg-rose-500/8 p-2.5">
                    This is the structural {meta.optimalWord} (size {opt}), but the target asks for size {meta.bound} {k}. So the answer to the decision problem is NO — no successful certificate exists.
                  </p>
                )}
                <div className="flex items-center gap-2">
                  <button onClick={showAnother} data-testid="button-show-another" className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-[#0B1120] transition-transform hover:-translate-y-px active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#131D33]" style={{ background: meta.color }}>
                    <Shuffle className="h-4 w-4" />Show Another Solution
                  </button>
                  {exists && solIndex >= 0 && (
                    <span className="font-mono text-xs text-slate-400" data-testid="text-solution-index">{solIndex + 1} of {targetSols.length}</span>
                  )}
                </div>
              </div>
            ) : (
              <div className="mt-3 space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-2">
                  <button onClick={check} data-testid="button-check" className="col-span-2 sm:col-span-1 lg:col-span-2 xl:col-span-1 inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-sm font-semibold text-[#0B1120] transition-transform hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300" style={{ background: meta.color }}>
                    <Check className="h-4 w-4" />Check My Answer
                  </button>
                  <button onClick={clear} disabled={!selected.length} data-testid="button-clear" className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-600 px-3 py-2.5 text-sm text-slate-200 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400">
                    <Eraser className="h-4 w-4" />Clear Selection
                  </button>
                  <button onClick={showSolution} data-testid="button-show-solution" className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-sky-400/40 px-3 py-2.5 text-sm text-sky-300 hover:bg-sky-400/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400">
                    <Lightbulb className="h-4 w-4" />Show Solution
                  </button>
                </div>
                {result ? (
                  <div
                    data-testid="status-feedback"
                    className={`rise rounded-lg border p-3 text-sm leading-relaxed ${result.valid ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-100' : result.structural ? 'border-amber-500/40 bg-amber-500/10 text-amber-100' : 'border-rose-500/40 bg-rose-500/10 text-rose-100'}`}
                  >
                    <div className="mb-1 flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.14em]">
                      {result.valid ? <><Check className="h-3.5 w-3.5" />Correct</> : result.structural ? <><Info className="h-3.5 w-3.5" />Valid set · target not met</> : <><X className="h-3.5 w-3.5" />Not a valid {meta.name.toLowerCase()}</>}
                    </div>
                    {result.message}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Select <Term k="vertex">vertices</Term> on the graph, then check. A structurally valid set is not automatically a YES certificate — it must also satisfy size {meta.bound} k.
                  </p>
                )}
              </div>
            )}

            {notice && (
              <div data-testid="status-notice" className={`rise mt-3 rounded-lg border p-2.5 text-xs leading-relaxed ${notice.tone === 'no' ? 'border-rose-500/40 bg-rose-500/10 text-rose-100' : 'border-sky-400/30 bg-sky-400/8 text-sky-100'}`}>
                {notice.text}
              </div>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}
