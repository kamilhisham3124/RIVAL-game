'use client';
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="loading">
      <h1>Cartridge interrupted</h1>
      <p>Your saved progress stays in this browser. Try again.</p>
      <button className="button primary" onClick={reset}>
        Retry
      </button>
    </main>
  );
}
