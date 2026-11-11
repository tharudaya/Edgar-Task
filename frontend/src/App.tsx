import { useState } from 'react';
import { FilingsView } from './components/filingsView';
import { SummaryView } from './components/summaryView';

type View = 'filings' | 'summary';

export default function App() {
  const [view, setView] = useState<View>('filings');

  return (
    <main>
      <header>
        <h1>EDGAR Filings</h1>
        <nav>
          <button aria-pressed={view === 'filings'} onClick={() => setView('filings')}>
            Filings
          </button>
          <button aria-pressed={view === 'summary'} onClick={() => setView('summary')}>
            Summary
          </button>
        </nav>
      </header>

      {view === 'filings' ? <FilingsView /> : <SummaryView />}
    </main>
  );
}