import { useState, type ReactNode, type KeyboardEvent } from 'react';
import { KeyRound } from 'lucide-react';
import { Term } from '@/components/term';

type Topic = { id: string; tab: string; title: string; definition: ReactNode; body: ReactNode; takeaway: string };

const Big = ({ children }: { children: ReactNode }) => (
  <div className="my-4 inline-block rounded-xl border border-sky-400/30 bg-sky-400/5 px-5 py-3 font-mono text-2xl sm:text-3xl text-sky-200">{children}</div>
);

const TOPICS: Topic[] = [
  {
    id: 'p', tab: 'P', title: 'P — Polynomial Time',
    definition: 'P is the class of decision problems that can be solved by a deterministic algorithm in polynomial time.',
    body: (
      <>
        <p><Term k="polynomial">Polynomial time</Term> means the running time is bounded by a polynomial function of the input size n. Examples of polynomial-time bounds:</p>
        <div className="my-3 flex flex-wrap gap-2 font-mono text-sm">{['O(n)', 'O(n²)', 'O(n³)'].map((x) => <span key={x} className="rounded-md bg-slate-800 px-2.5 py-1 text-slate-100">{x}</span>)}</div>
        <p>P is a class of <strong className="text-slate-100">decision problems</strong> — each instance has a YES or NO answer. For example, “is there a path from u to v?” is in P.</p>
      </>
    ),
    takeaway: 'Problems in P can be solved in polynomial time.',
  },
  {
    id: 'np', tab: 'NP', title: 'NP — Nondeterministic Polynomial Time',
    definition: <>NP is the class of decision problems for which a YES answer has a <Term k="certificate">certificate</Term> that can be verified in polynomial time.</>,
    body: (
      <>
        <p>NP stands for <em>nondeterministic polynomial time</em>.</p>
        <p className="my-3 rounded-lg border border-rose-400/40 bg-rose-500/10 px-3 py-2 font-semibold text-rose-100">NP does not mean “not polynomial.”</p>
        <p><strong className="text-slate-100">Finding</strong> a solution and <strong className="text-slate-100">verifying</strong> a proposed solution are different tasks. For Independent Set, given a proposed set of vertices, we can efficiently check that no two selected vertices are <Term k="adjacent">adjacent</Term> and that the set meets the target size k — even if finding such a set may be hard.</p>
      </>
    ),
    takeaway: 'NP problems have YES certificates that can be verified in polynomial time.',
  },
  {
    id: 'pvnp', tab: 'P vs. NP', title: 'P vs. NP',
    definition: 'One of the most important unsolved questions in computer science is whether every problem whose YES solutions can be verified efficiently can also be solved efficiently.',
    body: (
      <>
        <div className="flex flex-wrap items-center gap-4"><Big>P ⊆ NP</Big><Big><span className="text-amber-300">P = NP?</span></Big></div>
        <ul className="list-disc space-y-1 pl-5">
          <li>Every problem in P is also in NP: a polynomial-time solver can serve as its own verifier.</li>
          <li>It is <strong className="text-slate-100">not known</strong> whether P equals NP.</li>
          <li>Most computer scientists believe P ≠ NP, but this has <strong className="text-slate-100">not been proven</strong>.</li>
        </ul>
      </>
    ),
    takeaway: 'We do not currently know whether P = NP.',
  },
  {
    id: 'nphard', tab: 'NP-hard', title: 'NP-hard',
    definition: 'A problem is NP-hard if every problem in NP can be reduced to it in polynomial time.',
    body: (
      <>
        <p>NP-hard problems are at least as hard as every problem in NP, in the sense of polynomial-time reductions.</p>
        <ul className="mt-3 list-disc space-y-1 pl-5">
          <li>NP-hard problems do <strong className="text-slate-100">not necessarily belong to NP</strong>.</li>
          <li>NP-hard problems do not have to be decision problems (e.g. optimization versions).</li>
          <li>NP-hardness does not automatically mean a problem is NP-complete.</li>
        </ul>
      </>
    ),
    takeaway: 'NP-hard problems are at least as hard as all problems in NP under polynomial-time reductions.',
  },
  {
    id: 'npc', tab: 'NP-complete', title: 'NP-complete',
    definition: 'A decision problem is NP-complete if it belongs to NP and is NP-hard.',
    body: (
      <>
        <ol className="my-3 grid gap-2 sm:grid-cols-2">
          <li className="rounded-lg border border-slate-700 bg-[#0D1628] p-3"><span className="font-mono text-sky-300">1.</span> The problem is in NP.</li>
          <li className="rounded-lg border border-slate-700 bg-[#0D1628] p-3"><span className="font-mono text-sky-300">2.</span> The problem is NP-hard.</li>
        </ol>
        <p>NP-complete problems are the hardest problems in NP under polynomial-time reductions. The decision versions of <span className="text-green-400">Independent Set</span>, <span className="text-purple-400">Clique</span>, and <span className="text-amber-400">Vertex Cover</span> are all NP-complete.</p>
        <p className="mt-2">If any NP-complete problem can be solved in polynomial time, then P = NP.</p>
      </>
    ),
    takeaway: 'NP-complete problems are both in NP and NP-hard.',
  },
  {
    id: 'red', tab: 'Reductions', title: 'Polynomial-Time Reductions',
    definition: 'A polynomial-time reduction transforms an instance of one decision problem into an instance of another decision problem in polynomial time while preserving its YES/NO answer.',
    body: (
      <>
        <Big>A ≤ₚ B</Big>
        <p className="mb-3">Read: “A is polynomial-time reducible to B.”</p>
        <ol className="grid gap-2 sm:grid-cols-2 text-sm">
          {['Start with a problem A.', 'Transform its input into an instance of problem B.', 'The transformation must run in polynomial time.', 'The original instance is YES if and only if the transformed instance is YES.'].map((s, i) => (
            <li key={s} className="flex gap-2 rounded-lg border border-slate-700 bg-[#0D1628] p-3"><span className="font-mono text-sky-300">{i + 1}</span>{s}</li>
          ))}
        </ol>
        <p className="mt-4 rounded-lg border border-amber-400/40 bg-amber-500/10 px-3 py-2 text-amber-100"><strong>Direction matters.</strong> If A is already known to be NP-hard and A ≤ₚ B, then B is NP-hard. The implication does not run the other way.</p>
        <p className="mt-2">Reductions are the central tool for proving NP-hardness and NP-completeness.</p>
      </>
    ),
    takeaway: 'Reductions let us relate the difficulty of computational problems.',
  },
];

function Diagram() {
  return (
    <figure className="rounded-2xl border border-slate-700/60 bg-[#0D1628] p-5">
      <svg viewBox="0 0 320 230" className="w-full" role="img" aria-label="Conceptual diagram: P inside NP; NP-complete is the overlap of NP and NP-hard; NP-hard extends beyond NP.">
        <rect x="150" y="20" width="160" height="190" rx="22" fill="rgba(244,63,94,.07)" stroke="#F43F5E" strokeDasharray="5 4" />
        <text x="292" y="42" textAnchor="end" fill="#FDA4AF" fontSize="12" fontFamily="JetBrains Mono">NP-hard</text>
        <ellipse cx="125" cy="120" rx="110" ry="82" fill="rgba(56,189,248,.08)" stroke="#38BDF8" strokeWidth="1.5" />
        <text x="40" y="70" fill="#7DD3FC" fontSize="13" fontFamily="JetBrains Mono">NP</text>
        <ellipse cx="88" cy="130" rx="46" ry="36" fill="rgba(34,197,94,.12)" stroke="#22C55E" />
        <text x="88" y="135" textAnchor="middle" fill="#86EFAC" fontSize="13" fontFamily="JetBrains Mono">P</text>
        <text x="193" y="118" textAnchor="middle" fill="#E2E8F0" fontSize="11" fontFamily="JetBrains Mono">NP-</text>
        <text x="193" y="132" textAnchor="middle" fill="#E2E8F0" fontSize="11" fontFamily="JetBrains Mono">complete</text>
      </svg>
      <figcaption className="mt-2 text-xs leading-relaxed text-slate-400">
        Conceptual sketch, not a proven picture. It shows P ⊆ NP, NP-complete = NP ∩ NP-hard, and NP-hard extending beyond NP. Drawing P apart from NP-complete is a <strong className="text-slate-200">hypothetical illustration assuming P ≠ NP</strong>; if P = NP, these regions would coincide differently.
      </figcaption>
    </figure>
  );
}

export function Concepts() {
  const [active, setActive] = useState(0);
  const t = TOPICS[active];
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const next = (active + (e.key === 'ArrowRight' ? 1 : TOPICS.length - 1)) % TOPICS.length;
      setActive(next);
      document.getElementById(`tab-${TOPICS[next].id}`)?.focus();
    }
  };
  return (
    <section id="concepts" aria-labelledby="concepts-title" className="pt-20">
      <div className="mb-8">
        <div className="font-mono text-xs uppercase tracking-[0.2em] text-sky-400">Part II</div>
        <h2 id="concepts-title" className="font-display mt-2 text-3xl sm:text-5xl font-extrabold text-slate-50">Understanding Computational Complexity</h2>
        <p className="mt-2 text-slate-400">Explore the ideas behind P, NP, and NP-completeness.</p>
      </div>
      <div role="tablist" aria-label="Complexity topics" onKeyDown={onKey} className="flex gap-1 overflow-x-auto rounded-xl border border-slate-700/60 bg-[#0E1729] p-1">
        {TOPICS.map((x, i) => (
          <button
            key={x.id}
            id={`tab-${x.id}`}
            role="tab"
            aria-selected={i === active}
            aria-controls={`panel-${x.id}`}
            tabIndex={i === active ? 0 : -1}
            data-testid={`tab-${x.id}`}
            onClick={() => setActive(i)}
            className={`shrink-0 flex-1 whitespace-nowrap rounded-lg px-4 py-2.5 font-mono text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${i === active ? 'bg-sky-400/15 text-sky-200 shadow-[inset_0_0_0_1px_rgba(56,189,248,.4)]' : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'}`}
          >
            {x.tab}
          </button>
        ))}
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(280px,1fr)]">
        <article key={t.id} id={`panel-${t.id}`} role="tabpanel" aria-labelledby={`tab-${t.id}`} className="rise rounded-2xl border border-slate-700/60 bg-[#131D33] p-6 sm:p-8">
          <h3 className="font-display text-2xl sm:text-3xl font-bold text-slate-50">{t.title}</h3>
          <p className="mt-4 border-l-2 border-sky-400 pl-4 font-serif text-lg italic leading-relaxed text-slate-100">{t.definition}</p>
          <div className="mt-5 text-[15px] leading-relaxed text-slate-300 space-y-2">{t.body}</div>
          <div className="mt-6 flex items-start gap-3 rounded-xl bg-[#0D1628] p-4 border border-slate-700/60" data-testid="text-takeaway">
            <KeyRound className="mt-0.5 h-4 w-4 shrink-0 text-sky-300" />
            <div><div className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">Key Takeaway</div><p className="mt-0.5 font-semibold text-slate-50">{t.takeaway}</p></div>
          </div>
        </article>
        <Diagram />
      </div>
    </section>
  );
}
