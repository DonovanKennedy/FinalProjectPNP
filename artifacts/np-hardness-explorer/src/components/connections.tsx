import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Term } from '@/components/term';

export function Connections() {
  const [open, setOpen] = useState(false);
  return (
    <section aria-labelledby="connections-title" className="mt-10 rounded-2xl border border-slate-700/60 bg-[#111A2E] p-6 sm:p-8">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <h2 id="connections-title" className="font-display text-2xl sm:text-3xl font-bold text-slate-50">How Are These Problems Connected?</h2>
        <span className="font-mono text-xs text-slate-500">try it: compare the three modes on one graph</span>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-[1.15fr_1fr]">
        <div className="rounded-xl border border-slate-700/60 bg-[#0D1628] p-5">
          <div className="flex items-center gap-2 font-mono text-xs"><span className="text-green-400">Independent Set</span><span className="text-slate-500">⟷</span><span className="text-amber-400">Vertex Cover</span></div>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            For any graph G = (V, E): a set S is an independent set <em>if and only if</em> V \ S is a vertex cover. If no edge has both endpoints in S, every edge has an endpoint outside S.
          </p>
          <div className="mt-4 rounded-lg bg-[#131D33] px-4 py-3 text-center font-mono text-xl sm:text-2xl text-slate-50">
            <span className="text-green-400">α(G)</span> + <span className="text-amber-400">τ(G)</span> = |V|
          </div>
          <dl className="mt-3 grid gap-1 text-xs text-slate-400">
            <div><dt className="inline font-mono text-green-400">α(G)</dt> <dd className="inline">size of a <Term k="maximum">maximum</Term> independent set</dd></div>
            <div><dt className="inline font-mono text-amber-400">τ(G)</dt> <dd className="inline">size of a <Term k="minimum">minimum</Term> vertex cover</dd></div>
            <div><dt className="inline font-mono text-slate-200">|V|</dt> <dd className="inline">number of vertices</dd></div>
          </dl>
        </div>
        <div className="rounded-xl border border-slate-700/60 bg-[#0D1628] p-5">
          <div className="flex items-center gap-2 font-mono text-xs"><span className="text-purple-400">Clique</span><span className="text-slate-500">⟷</span><span className="text-green-400">Independent Set in Ḡ</span></div>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            A clique in G is an independent set in the complement graph Ḡ, which contains exactly those <Term k="edge">edges</Term> between distinct vertices that are <em>not</em> in G.
          </p>
          <div className="mt-4 rounded-lg bg-[#131D33] px-4 py-3 text-center font-mono text-xl sm:text-2xl text-slate-50">
            <span className="text-purple-400">ω(G)</span> = <span className="text-green-400">α(Ḡ)</span>
          </div>
          <p className="mt-3 text-xs text-slate-400">Use “View complement Ḡ” above in Clique mode: the selected clique has no dashed Ḡ-edges between its vertices.</p>
        </div>
      </div>

      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="learn-more"
        data-testid="button-learn-more"
        className="mt-5 inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-sky-300 hover:bg-sky-400/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
      >
        Learn More <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div id="learn-more" className="rise mt-4 grid gap-4 text-sm leading-relaxed text-slate-300 md:grid-cols-2">
          <div className="space-y-2">
            <h3 className="font-semibold text-slate-100">Why the identity holds</h3>
            <p>Complementation S ↦ V \ S is a bijection between independent sets and vertex covers. Large independent sets correspond exactly to small covers, so the maximum of one and the minimum of the other always sum to |V|.</p>
            <p>The same pairing works for the decision versions: G has an independent set of size at least k exactly when it has a vertex cover of size at most |V| − k.</p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-slate-100">Maximum vs. maximal, minimum vs. minimal</h3>
            <p>A <em>maximal</em> independent set or clique cannot be extended by any single vertex, but it may be smaller than a <em>maximum</em> one. An inclusion-minimal vertex cover cannot drop any vertex, yet may be larger than a <em>minimum</em> cover. The Explorer labels a highlighted set “optimal” only when its size equals the true optimum.</p>
            <p>Edge cases: the empty set is always an independent set and a clique; it is a vertex cover exactly when the graph has no edges.</p>
          </div>
        </div>
      )}
    </section>
  );
}
