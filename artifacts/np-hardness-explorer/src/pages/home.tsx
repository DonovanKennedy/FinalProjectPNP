import { Explorer } from '@/components/explorer';
import { Connections } from '@/components/connections';
import { Concepts } from '@/components/concepts';

const NAV = [
  ['#explorer', 'Graph Explorer'],
  ['#concepts', 'Complexity Concepts'],
  ['#about', 'About'],
] as const;

export default function Home() {
  return (
    <div className="min-h-[100dvh] bg-[radial-gradient(ellipse_at_top,_#14213d_0%,_#0B1120_55%)]">
      <a href="#explorer" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded focus:bg-sky-400 focus:px-3 focus:py-2 focus:text-[#0B1120]">Skip to Graph Explorer</a>
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-[#0B1120]/85 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3 min-w-0">
            <svg viewBox="0 0 32 32" className="h-8 w-8 shrink-0" aria-hidden="true">
              <line x1="8" y1="8" x2="24" y2="10" stroke="#475569" strokeWidth="2" />
              <line x1="8" y1="8" x2="14" y2="24" stroke="#475569" strokeWidth="2" />
              <line x1="24" y1="10" x2="14" y2="24" stroke="#475569" strokeWidth="2" />
              <circle cx="8" cy="8" r="4.5" fill="#22C55E" />
              <circle cx="24" cy="10" r="4.5" fill="#A855F7" />
              <circle cx="14" cy="24" r="4.5" fill="#F59E0B" />
            </svg>
            <div className="min-w-0">
              <h1 className="font-display text-lg sm:text-xl font-bold leading-none text-slate-50">NP-Hardness Explorer</h1>
              <p className="hidden sm:block mt-1 text-xs text-slate-400 truncate">Explore computational complexity through interactive graph theory.</p>
            </div>
          </div>
          <nav aria-label="Sections" className="flex gap-1 text-sm">
            {NAV.map(([href, label]) => (
              <a key={href} href={href} data-testid={`link-${href.slice(1)}`} className="rounded-md px-2 sm:px-3 py-1.5 text-slate-300 hover:bg-slate-800 hover:text-sky-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 whitespace-nowrap">
                <span className="hidden md:inline">{label}</span>
                <span className="md:hidden">{label.split(' ')[label.split(' ').length - 1]}</span>
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-4 pb-16 pt-5 sm:px-6">
        <Explorer />
        <p className="mt-4 max-w-3xl font-mono text-xs leading-relaxed text-slate-500">
          Note: answers are computed by checking every subset of vertices. A graph with n vertices has 2^n subsets — 256 for n = 8, but over 10^30 for n = 100. Exhaustive search is fine for these tiny teaching graphs and hopeless in general; no polynomial-time algorithm is known for these NP-complete problems.
        </p>
        <Connections />
        <Concepts />

        <section id="about" aria-labelledby="about-title" className="pt-20">
          <div className="grid gap-6 rounded-2xl border border-slate-700/60 bg-[#111A2E] p-6 sm:p-10 md:grid-cols-[220px_1fr]">
            <div>
              <div className="font-mono text-xs uppercase tracking-[0.2em] text-sky-400">Part III</div>
              <h2 id="about-title" className="font-display mt-2 text-3xl font-extrabold text-slate-50">About</h2>
            </div>
            <div className="space-y-3 text-slate-300 leading-relaxed">
              <p>NP-Hardness Explorer is an interactive educational tool created for a university Data Structures and Algorithms final project. Its goal is to make abstract concepts in computational complexity easier to understand through graph visualization, experimentation, and concise explanations.</p>
              <p className="text-sm text-slate-400">Runs entirely in your browser — no accounts, no server, no tracking. Every YES/NO answer and every highlighted set is computed live by exhaustive search on the displayed graph.</p>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t border-slate-800 py-6 text-center font-mono text-xs text-slate-500">
        NP-Hardness Explorer · A Data Structures and Algorithms educational project
      </footer>
    </div>
  );
}
