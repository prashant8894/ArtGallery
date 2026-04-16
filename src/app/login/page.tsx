export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--background)] px-6 text-[var(--foreground)]">
      <section className="w-full max-w-xl rounded-3xl border border-[var(--border-color)] bg-[var(--surface)] p-8 shadow-2xl shadow-black/20">
        <p className="text-xs tracking-[0.32em] text-[var(--muted)] uppercase">
          Collector Access
        </p>
        <h1 className="mt-4 text-4xl font-medium tracking-tight">
          Join the Anjali Art Family
        </h1>
        <p className="mt-4 text-base leading-7 text-[var(--muted)]">
          This preview page is live on GitHub Pages. A full sign-in experience can be
          added next if you want to turn this into a real collector portal.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <a
            href="../"
            className="rounded-full border border-[var(--foreground)] bg-[var(--foreground)] px-6 py-3 text-center text-sm tracking-[0.18em] text-[var(--background)] uppercase transition hover:opacity-85"
          >
            Back to Gallery
          </a>
          <a
            href="mailto:prashant.negi2@hp.com"
            className="rounded-full border border-[var(--border-color)] px-6 py-3 text-center text-sm tracking-[0.18em] uppercase transition hover:border-[var(--foreground)]"
          >
            Contact Collector Desk
          </a>
        </div>
      </section>
    </main>
  );
}