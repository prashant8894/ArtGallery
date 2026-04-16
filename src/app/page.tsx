"use client";

import Image from "next/image";
import { motion, useAnimationFrame, useMotionValue } from "framer-motion";
import { useEffect, useRef, useState } from "react";

type Theme = "dark" | "light" | "vibrant";

const themes: { id: Theme; label: string }[] = [
  { id: "dark", label: "Dark" },
  { id: "light", label: "Light" },
  { id: "vibrant", label: "Vibrant" },
];

const cubeFaces = [
  { title: "Koi Pair", image: "/art/fish-pair.png" },
  { title: "Butterfly Flame", image: "/art/butterfly-candle.png" },
  { title: "Lotus Muse", image: "/art/lotus-portrait.png" },
  { title: "Traditional Grace", image: "/art/traditional-portrait.png" },
  { title: "Top Plane", image: null },
  { title: "Bottom Plane", image: null },
];

const cubeFaceStyles: Record<Theme, string[]> = {
  dark: [
    "from-zinc-900 via-zinc-700 to-zinc-950",
    "from-neutral-800 via-stone-700 to-neutral-900",
    "from-gray-800 via-zinc-600 to-gray-900",
    "from-stone-800 via-zinc-700 to-stone-900",
    "from-slate-700 via-zinc-500 to-slate-900",
    "from-zinc-900 via-stone-600 to-zinc-800",
  ],
  light: [
    "from-zinc-200 via-stone-100 to-zinc-300",
    "from-slate-200 via-zinc-100 to-slate-300",
    "from-neutral-200 via-stone-100 to-neutral-300",
    "from-stone-200 via-zinc-100 to-stone-300",
    "from-gray-200 via-slate-100 to-gray-300",
    "from-zinc-100 via-neutral-200 to-zinc-300",
  ],
  vibrant: [
    "from-violet-600 via-fuchsia-500 to-indigo-700",
    "from-blue-600 via-cyan-500 to-indigo-700",
    "from-purple-600 via-pink-500 to-purple-800",
    "from-indigo-600 via-blue-500 to-purple-700",
    "from-cyan-500 via-blue-600 to-violet-700",
    "from-fuchsia-600 via-rose-500 to-purple-700",
  ],
};

const morePieces = [
  "Dawn Fragments",
  "Echo Canvas",
  "Midnight Grain",
  "Soft Terrain",
  "Monochrome Drift",
  "Glass Horizon",
  "Dust & Neon",
  "Silent Current",
];

export default function Home() {
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const [hasScrolled, setHasScrolled] = useState(false);
  const [theme, setTheme] = useState<Theme>("dark");
  const heroRef = useRef<HTMLElement>(null);
  const lastMouseRef = useRef({ x: 0, y: 0, time: 0 });
  const spinAngleRef = useRef(0);
  const spinVelocityRef = useRef(18);
  const isCubeHoveredRef = useRef(false);
  const cubeRotateY = useMotionValue(0);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 20) {
        setHasScrolled(true);
      } else {
        setHasScrolled(false);
      }
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          setParallax({ x: 0, y: 0 });
        }
      },
      { threshold: 0.25 }
    );

    if (heroRef.current) {
      observer.observe(heroRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useAnimationFrame((_, delta) => {
    spinVelocityRef.current *= isCubeHoveredRef.current ? 0.96 : 0.985;
    if (Math.abs(spinVelocityRef.current) < 8) {
      spinVelocityRef.current = spinVelocityRef.current < 0 ? -8 : 8;
    }

    spinAngleRef.current =
      (spinAngleRef.current + spinVelocityRef.current * (delta / 1000)) % 360;
    cubeRotateY.set(spinAngleRef.current);
  });

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-500">
      <section
        ref={heroRef}
        className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,var(--hero-glow)_0%,var(--hero-base)_45%,var(--background)_100%)]"
      >
        <div className="absolute top-6 left-0 right-0 z-20 mx-auto flex w-[min(92%,72rem)] items-center justify-between">
          <div className="flex items-center gap-3 rounded-full border border-[var(--border-color)] bg-[var(--surface)]/80 px-4 py-2 backdrop-blur-md">
            <label
              htmlFor="theme-select"
              className="text-[10px] tracking-[0.25em] text-[var(--muted)] uppercase"
            >
              Theme
            </label>
            <select
              id="theme-select"
              value={theme}
              onChange={(event) => setTheme(event.target.value as Theme)}
              className="rounded-md border border-[var(--border-color)] bg-[var(--background)] px-2 py-1 text-xs tracking-[0.12em] text-[var(--foreground)] uppercase outline-none"
            >
              {themes.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <a
            href="/login"
            className="rounded-full border border-[var(--foreground)] bg-[var(--surface)]/80 px-5 py-2 text-xs tracking-[0.2em] uppercase backdrop-blur-md transition hover:bg-[var(--foreground)] hover:text-[var(--background)]"
          >
            Login / Join
          </a>
        </div>

        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,var(--overlay)_100%)]" />
        <div className="absolute top-24 left-1/2 z-20 -translate-x-1/2 md:top-20">
          <p className="text-xs tracking-[0.35em] text-[var(--muted)] uppercase">
            Anjali&apos;s Curated Originals
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2 }}
          className="absolute h-[24rem] w-[24rem] rounded-full bg-[var(--accent-soft)] blur-3xl md:h-[30rem] md:w-[30rem]"
        />

        <div className="absolute inset-0 z-10 flex items-center justify-center [perspective:1300px]">
          <motion.button
            type="button"
            initial={{ opacity: 1, scale: 1 }}
            animate={{
              opacity: 1,
              scale: 1,
              rotateX: 8 - parallax.y * 22,
              rotateY: parallax.x * 34,
            }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="group absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer [transform-style:preserve-3d]"
            whileHover={{ x: [-2, 2, -2, 2, 0], y: [1, -1, 1, -1, 0] }}
            whileTap={{ scale: 0.98 }}
            onHoverStart={() => {
              isCubeHoveredRef.current = true;
            }}
            onHoverEnd={() => {
              isCubeHoveredRef.current = false;
              setParallax({ x: 0, y: 0 });
            }}
            onMouseMove={(event) => {
              const rect = event.currentTarget.getBoundingClientRect();
              const x = (event.clientX - rect.left) / rect.width - 0.5;
              const y = (event.clientY - rect.top) / rect.height - 0.5;
              setParallax({ x, y });

              const now = performance.now();
              const dx = event.clientX - lastMouseRef.current.x;
              const dt = Math.max(now - lastMouseRef.current.time, 16);
              const velocityX = dx / dt;
              spinVelocityRef.current = Math.max(
                -180,
                Math.min(180, spinVelocityRef.current + velocityX * 48)
              );
              lastMouseRef.current = { x: event.clientX, y: event.clientY, time: now };
            }}
            style={{
              width: "clamp(13rem, 40vw, 22rem)",
              height: "clamp(13rem, 40vw, 22rem)",
            }}
            aria-label="Featured collection cube"
          >
              <motion.div
              initial={{ rotateY: 0, rotateX: 2 }}
              animate={{ rotateX: [2, 2.5, 1.5, 2] }}
                transition={{
                rotateX: { duration: 8, ease: "easeInOut", repeat: Infinity },
                }}
              style={{ rotateY: cubeRotateY }}
                className="relative h-full w-full [transform-style:preserve-3d]"
              >
                {cubeFaces.map((face, index) => {
                  const transforms = [
                    "rotateY(0deg) translateZ(clamp(6.5rem,20vw,11rem))",
                    "rotateY(180deg) translateZ(clamp(6.5rem,20vw,11rem))",
                    "rotateY(90deg) translateZ(clamp(6.5rem,20vw,11rem))",
                    "rotateY(-90deg) translateZ(clamp(6.5rem,20vw,11rem))",
                    "rotateX(90deg) translateZ(clamp(6.5rem,20vw,11rem))",
                    "rotateX(-90deg) translateZ(clamp(6.5rem,20vw,11rem))",
                  ];

                  return (
                    <div
                      key={face.title}
                      className={`absolute inset-0 overflow-hidden rounded-2xl border border-white/15 shadow-2xl [backface-visibility:hidden] ${
                        face.image
                          ? "bg-zinc-900"
                          : `bg-gradient-to-br ${cubeFaceStyles[theme][index]}`
                      }`}
                      style={{ transform: transforms[index] }}
                    >
                      {face.image ? (
                        <>
                          <Image
                            src={face.image}
                            alt={face.title}
                            fill
                            sizes="(max-width: 768px) 220px, 320px"
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/10" />
                          <span className="absolute bottom-3 left-3 text-[10px] tracking-[0.2em] text-white/95 uppercase">
                            {face.title}
                          </span>
                        </>
                      ) : (
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.18),transparent_60%)]" />
                      )}
                    </div>
                  );
                })}
              </motion.div>
          </motion.button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: hasScrolled ? 0 : 1, y: [0, 8, 0] }}
          transition={{
            opacity: { duration: 0.35, delay: hasScrolled ? 0 : 0.9 },
            y: { duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: 1.2 },
          }}
          className="pointer-events-none absolute bottom-8 z-20 flex flex-col items-center gap-2 text-[var(--muted)]"
        >
          <p className="text-[10px] tracking-[0.35em] uppercase">Scroll to explore</p>
          <div className="h-8 w-px bg-[var(--border-color)]" />
          <div className="h-3 w-3 rounded-full border border-[var(--border-color)] bg-[var(--surface)]" />
        </motion.div>
      </section>

      <section id="intro-section" className="mx-auto w-full max-w-6xl px-6 py-24 md:px-12">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.8 }}
          className="text-xs tracking-[0.35em] text-[var(--muted)] uppercase"
        >
          Anjali&apos;s Curated Originals
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ delay: 0.1, duration: 0.9 }}
          className="mt-5 max-w-3xl text-4xl leading-tight font-medium tracking-tight md:text-6xl"
        >
          Art that feels intimate, modern, and collected with intention.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ delay: 0.2, duration: 0.9 }}
          className="mt-6 max-w-2xl text-base leading-7 text-[var(--muted)] md:text-lg"
        >
          Explore each piece like a quiet conversation. Every work is selected to
          bring stillness, depth, and personality into your space.
        </motion.p>
      </section>

      <section className="border-y border-[var(--border-color)] bg-[var(--surface)] py-16 transition-colors duration-500">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-8 px-6 md:flex-row md:items-center md:px-12">
          <div>
            <p className="text-xs tracking-[0.32em] text-[var(--muted)] uppercase">
              Private Collector Circle
            </p>
            <h2 className="mt-3 text-2xl font-medium tracking-tight md:text-3xl">
              Join the Anjali Art Family
            </h2>
            <p className="mt-2 max-w-xl text-[var(--muted)]">
              Sign in to save favorites, get first access to new drops, and
              receive collector-only previews.
            </p>
          </div>
          <a
            href="/login"
            className="rounded-full border border-[var(--foreground)] bg-[var(--foreground)] px-7 py-3 text-sm tracking-[0.18em] text-[var(--background)] uppercase transition hover:opacity-85"
          >
            Login / Join
          </a>
        </div>
      </section>

      <section className="border-t border-[var(--border-color)] bg-[var(--surface)] py-24 transition-colors duration-500">
        <div className="mx-auto w-full max-w-6xl px-6 md:px-12">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7 }}
            className="mb-10"
          >
            <h3 className="text-3xl font-medium tracking-tight md:text-4xl">
              More art pieces
            </h3>
            <p className="mt-3 max-w-2xl text-[var(--muted)]">
              Keep scrolling to discover additional studies and finished works.
            </p>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {morePieces.map((piece, index) => (
              <motion.div
                key={piece}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ duration: 0.55, delay: index * 0.06 }}
                whileHover={{ scale: 1.02 }}
                className="rounded-2xl border border-[var(--border-color)] bg-[var(--card)] p-5 transition-colors duration-300 hover:border-[var(--foreground)]/45"
              >
                <div className="mb-5 h-36 rounded-xl bg-gradient-to-br from-[var(--art-a)] via-[var(--art-b)] to-[var(--art-c)]" />
                <p className="text-sm tracking-wide text-[var(--foreground)] uppercase">
                  {piece}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
