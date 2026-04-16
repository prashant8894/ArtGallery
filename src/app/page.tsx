"use client";

import Image from "next/image";
import { motion, useAnimationFrame, useMotionValue } from "framer-motion";
import { useEffect, useRef, useState } from "react";

type Theme = "dark" | "light" | "vibrant";

type Artwork = {
  title: string;
  image: string;
  artist: string;
  askingPrice: number;
};

type CubeFace = {
  title: string;
  image: string | null;
  artwork?: Artwork;
};

const themes: { id: Theme; label: string }[] = [
  { id: "dark", label: "Dark" },
  { id: "light", label: "Light" },
  { id: "vibrant", label: "Vibrant" },
];

const featuredArtworks: Artwork[] = [
  {
    title: "Koi Pair",
    image: "art/fish-pair.png",
    artist: "Anjali Sharma",
    askingPrice: 1450,
  },
  {
    title: "Butterfly Flame",
    image: "art/butterfly-candle.png",
    artist: "Anjali Sharma",
    askingPrice: 1325,
  },
  {
    title: "Lotus Muse",
    image: "art/lotus-portrait.png",
    artist: "Anjali Sharma",
    askingPrice: 1890,
  },
  {
    title: "Traditional Grace",
    image: "art/traditional-portrait.png",
    artist: "Anjali Sharma",
    askingPrice: 2100,
  },
];

const cubeFaces: CubeFace[] = [
  { ...featuredArtworks[0], artwork: featuredArtworks[0] },
  { ...featuredArtworks[1], artwork: featuredArtworks[1] },
  { ...featuredArtworks[2], artwork: featuredArtworks[2] },
  { ...featuredArtworks[3], artwork: featuredArtworks[3] },
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

const SPIN_DAMP_HOVERED = 0.94;
const SPIN_DAMP_IDLE = 0.992;
const SPIN_MIN_SPEED_HOVER = 4;
const SPIN_MIN_SPEED_IDLE = 5.5;
const SPIN_SPEED_SCALE = 0.72;
const DRAG_TO_SPIN_FACTOR = 140;
const CUBE_SIZE = "clamp(13rem, 40vw, 22rem)";
const CUBE_FACE_DEPTH = `calc(${CUBE_SIZE} / 2)`;
const CUBE_HITBOX_SIZE = `calc(${CUBE_SIZE} * 1.14)`;

export default function Home() {
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const [hasScrolled, setHasScrolled] = useState(false);
  const [theme, setTheme] = useState<Theme>("dark");
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [offerPrice, setOfferPrice] = useState(0);
  const [isArtworkFlipped, setIsArtworkFlipped] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [authIdentifier, setAuthIdentifier] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [enteredOtp, setEnteredOtp] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [signedInUser, setSignedInUser] = useState("");
  const heroRef = useRef<HTMLElement>(null);
  const lastMouseRef = useRef({ x: 0, y: 0, time: 0 });
  const spinAngleRef = useRef(0);
  const spinVelocityRef = useRef(10);
  const isCubeHoveredRef = useRef(false);
  const activeTouchPointerRef = useRef<number | null>(null);
  const cubeRotateY = useMotionValue(0);

  const updateCubeInteraction = (
    clientX: number,
    clientY: number,
    element: HTMLElement
  ) => {
    const rect = element.getBoundingClientRect();
    const x = (clientX - rect.left) / rect.width - 0.5;
    const y = (clientY - rect.top) / rect.height - 0.5;
    setParallax({ x, y });

    const now = performance.now();
    const dx = clientX - lastMouseRef.current.x;
    const dt = Math.max(now - lastMouseRef.current.time, 16);
    const velocityX = dx / dt;
    const injectedVelocity = velocityX * DRAG_TO_SPIN_FACTOR;
    const blendedVelocity =
      spinVelocityRef.current * 0.68 + injectedVelocity * 0.32;
    spinVelocityRef.current = Math.max(
      -180,
      Math.min(180, blendedVelocity)
    );
    lastMouseRef.current = { x: clientX, y: clientY, time: now };
  };

  const openArtworkModal = (artwork: Artwork) => {
    setSelectedArtwork(artwork);
    setOfferPrice(Math.round(artwork.askingPrice * 0.7));
    setIsArtworkFlipped(false);
  };

  const closeArtworkModal = () => {
    setSelectedArtwork(null);
    setIsArtworkFlipped(false);
  };

  const openAuthModal = (mode: "signin" | "signup") => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
    setAuthMessage("");
    setOtpSent(false);
    setGeneratedOtp("");
    setEnteredOtp("");
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setAuthMessage("");
    setOtpSent(false);
    setGeneratedOtp("");
    setEnteredOtp("");
  };

  const isEmail = (value: string) => /\S+@\S+\.\S+/.test(value);
  const isPhone = (value: string) => /^[0-9]{10,15}$/.test(value.replace(/\D/g, ""));

  const sendOtp = () => {
    const value = authIdentifier.trim();
    if (!isEmail(value) && !isPhone(value)) {
      setAuthMessage("Please enter a valid email or phone number.");
      return;
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otp);
    setOtpSent(true);
    setAuthMessage(`Demo OTP sent: ${otp}`);
  };

  const verifyOtp = () => {
    if (!otpSent) {
      setAuthMessage("Please request OTP first.");
      return;
    }

    if (enteredOtp.trim() !== generatedOtp) {
      setAuthMessage("Invalid OTP. Please try again.");
      return;
    }

    setSignedInUser(authIdentifier.trim());
    closeAuthModal();
  };

  const signInWithGoogle = () => {
    setSignedInUser("google.user@example.com");
    closeAuthModal();
  };

  const cycleTheme = () => {
    const order: Theme[] = ["dark", "light", "vibrant"];
    const currentIndex = order.indexOf(theme);
    const nextIndex = (currentIndex + 1) % order.length;
    setTheme(order[nextIndex]);
  };

  const jumpToFavorites = () => {
    const section = document.getElementById("more-art-section");
    section?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 120) {
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
    const isHovered = isCubeHoveredRef.current;
    const damping = isHovered ? SPIN_DAMP_HOVERED : SPIN_DAMP_IDLE;
    const minSpeed = isHovered ? SPIN_MIN_SPEED_HOVER : SPIN_MIN_SPEED_IDLE;

    spinVelocityRef.current *= damping;
    if (Math.abs(spinVelocityRef.current) < minSpeed) {
      spinVelocityRef.current =
        spinVelocityRef.current < 0 ? -minSpeed : minSpeed;
    }

    spinAngleRef.current =
      (spinAngleRef.current +
        spinVelocityRef.current * SPIN_SPEED_SCALE * (delta / 1000)) %
      360;
    cubeRotateY.set(spinAngleRef.current);
  });

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-500">
      <section
        ref={heroRef}
        className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,var(--hero-glow)_0%,var(--hero-base)_45%,var(--background)_100%)]"
      >
        <div className="absolute top-4 left-0 right-0 z-20 mx-auto flex w-[min(94%,72rem)] flex-wrap items-center justify-between gap-3 md:top-6">
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
          <button
            type="button"
            onClick={() => openAuthModal("signin")}
            className="rounded-full border border-[var(--foreground)] bg-[var(--surface)]/80 px-5 py-2 text-xs tracking-[0.2em] uppercase backdrop-blur-md transition hover:bg-[var(--foreground)] hover:text-[var(--background)]"
          >
            {signedInUser ? "Account" : "Login / Join"}
          </button>
        </div>

        {signedInUser ? (
          <div className="absolute top-24 right-4 z-20 rounded-full border border-[var(--border-color)] bg-[var(--surface)]/85 px-4 py-2 text-[10px] tracking-[0.2em] text-[var(--muted)] uppercase backdrop-blur md:right-8 md:top-20">
            Signed in: {signedInUser}
          </div>
        ) : null}

        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,var(--overlay)_100%)]" />
        <div className="absolute top-24 left-1/2 z-20 -translate-x-1/2 md:top-20">
          <p className="text-sm tracking-[0.35em] text-[var(--muted)] uppercase md:text-base">
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
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 rounded-full bg-black/45 blur-2xl"
            style={{
              width: "clamp(8rem, 44vw, 18rem)",
              height: "clamp(1.3rem, 4vw, 2.4rem)",
              opacity: 0.2 + Math.abs(parallax.x) * 0.22,
              transform: `translate(-50%, calc(-50% + clamp(7.8rem, 24vw, 12rem))) translateX(${parallax.x * 20}px) scaleX(${1 - Math.abs(parallax.x) * 0.18}) scaleY(${1 - Math.abs(parallax.y) * 0.12})`,
            }}
          />

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
            onPointerDown={(event) => {
              if (event.pointerType !== "touch") {
                return;
              }

              activeTouchPointerRef.current = event.pointerId;
              isCubeHoveredRef.current = true;
              event.currentTarget.setPointerCapture(event.pointerId);
              updateCubeInteraction(
                event.clientX,
                event.clientY,
                event.currentTarget
              );
            }}
            onPointerMove={(event) => {
              if (event.pointerType === "touch") {
                if (activeTouchPointerRef.current !== event.pointerId) {
                  return;
                }
                updateCubeInteraction(
                  event.clientX,
                  event.clientY,
                  event.currentTarget
                );
                return;
              }

              updateCubeInteraction(
                event.clientX,
                event.clientY,
                event.currentTarget
              );
            }}
            onPointerUp={(event) => {
              if (event.pointerType !== "touch") {
                return;
              }

              if (activeTouchPointerRef.current === event.pointerId) {
                activeTouchPointerRef.current = null;
                isCubeHoveredRef.current = false;
                setParallax({ x: 0, y: 0 });
              }
            }}
            onPointerCancel={(event) => {
              if (event.pointerType !== "touch") {
                return;
              }

              if (activeTouchPointerRef.current === event.pointerId) {
                activeTouchPointerRef.current = null;
                isCubeHoveredRef.current = false;
                setParallax({ x: 0, y: 0 });
              }
            }}
            style={{
              width: CUBE_HITBOX_SIZE,
              height: CUBE_HITBOX_SIZE,
              touchAction: "none",
            }}
            aria-label="Featured collection cube"
          >
              <motion.div
              initial={{ rotateY: 0, rotateX: 2 }}
              animate={{ rotateX: [2, 2.5, 1.5, 2] }}
                transition={{
                rotateX: { duration: 8, ease: "easeInOut", repeat: Infinity },
                }}
              style={{
                rotateY: cubeRotateY,
                width: CUBE_SIZE,
                height: CUBE_SIZE,
              }}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 [transform-style:preserve-3d]"
              >
                {cubeFaces.map((face, index) => {
                  const transforms = [
                    `rotateY(0deg) translateZ(${CUBE_FACE_DEPTH})`,
                    `rotateY(180deg) translateZ(${CUBE_FACE_DEPTH})`,
                    `rotateY(90deg) translateZ(${CUBE_FACE_DEPTH})`,
                    `rotateY(-90deg) translateZ(${CUBE_FACE_DEPTH})`,
                    `rotateX(90deg) translateZ(${CUBE_FACE_DEPTH})`,
                    `rotateX(-90deg) translateZ(${CUBE_FACE_DEPTH})`,
                  ];

                  return (
                    <div
                      key={face.title}
                      role={face.artwork ? "button" : undefined}
                      tabIndex={face.artwork ? 0 : -1}
                      className={`absolute inset-0 overflow-hidden rounded-2xl border border-white/15 shadow-2xl [backface-visibility:hidden] ${
                        face.image
                          ? "bg-zinc-900"
                          : `bg-gradient-to-br ${cubeFaceStyles[theme][index]}`
                      }`}
                      style={{ transform: transforms[index] }}
                      onClick={(event) => {
                        if (!face.artwork) {
                          return;
                        }
                        event.stopPropagation();
                        openArtworkModal(face.artwork);
                      }}
                      onKeyDown={(event) => {
                        if (!face.artwork) {
                          return;
                        }
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          openArtworkModal(face.artwork);
                        }
                      }}
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
          className="pointer-events-none absolute bottom-16 z-20 flex flex-col items-center gap-2 text-[var(--muted)] sm:bottom-8"
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
          className="mt-5 max-w-4xl text-5xl leading-tight font-medium tracking-tight md:text-7xl"
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
              Collector Benefits
            </p>
            <h2 className="mt-3 text-2xl font-medium tracking-tight md:text-3xl">
              Unlock the Anjali Art Family perks
            </h2>
            <p className="mt-2 max-w-xl text-[var(--muted)]">
              Save favorites, place private offers, and get priority access to
              new drops after sign-in.
            </p>
          </div>
          <button
            type="button"
            onClick={() => openAuthModal("signup")}
            className="rounded-full border border-[var(--foreground)] bg-[var(--foreground)] px-7 py-3 text-sm tracking-[0.18em] text-[var(--background)] uppercase transition hover:opacity-85"
          >
            Unlock Access
          </button>
        </div>
      </section>

      <section
        id="more-art-section"
        className="border-t border-[var(--border-color)] bg-[var(--surface)] py-24 transition-colors duration-500"
      >
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

      <div className="fixed inset-x-0 bottom-3 z-40 mx-auto w-[min(94%,28rem)] md:hidden">
        <div className="grid grid-cols-3 gap-2 rounded-2xl border border-[var(--border-color)] bg-[var(--surface)]/92 p-2 shadow-xl backdrop-blur">
          <button
            type="button"
            onClick={cycleTheme}
            className="rounded-xl border border-[var(--border-color)] px-3 py-2 text-[10px] tracking-[0.18em] uppercase"
          >
            Theme
          </button>
          <button
            type="button"
            onClick={() => openAuthModal("signin")}
            className="rounded-xl border border-[var(--border-color)] px-3 py-2 text-[10px] tracking-[0.18em] uppercase"
          >
            {signedInUser ? "Account" : "Login"}
          </button>
          <button
            type="button"
            onClick={jumpToFavorites}
            className="rounded-xl border border-[var(--border-color)] px-3 py-2 text-[10px] tracking-[0.18em] uppercase"
          >
            Favorites
          </button>
        </div>
      </div>

      {selectedArtwork ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-3xl rounded-3xl border border-[var(--border-color)] bg-[var(--surface)] p-4 md:p-6">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-xs tracking-[0.28em] text-[var(--muted)] uppercase">
                Featured Artwork
              </p>
              <button
                type="button"
                onClick={closeArtworkModal}
                className="rounded-full border border-[var(--border-color)] px-3 py-1 text-xs tracking-[0.2em] uppercase"
              >
                Close
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-[1.2fr_1fr] md:items-stretch">
              <div className="[perspective:1000px]">
                <motion.div
                  animate={{ rotateY: isArtworkFlipped ? 180 : 0 }}
                  transition={{ duration: 0.55, ease: "easeInOut" }}
                  className="relative h-[20rem] w-full rounded-2xl [transform-style:preserve-3d] md:h-[24rem]"
                >
                  <div className="absolute inset-0 overflow-hidden rounded-2xl [backface-visibility:hidden]">
                    <Image
                      src={selectedArtwork.image}
                      alt={selectedArtwork.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/15" />
                    <p className="absolute bottom-3 left-3 text-xs tracking-[0.2em] text-white uppercase">
                      {selectedArtwork.title}
                    </p>
                  </div>

                  <div className="absolute inset-0 rounded-2xl border border-[var(--border-color)] bg-[var(--card)] p-5 [backface-visibility:hidden] [transform:rotateY(180deg)]">
                    <p className="text-xs tracking-[0.24em] text-[var(--muted)] uppercase">
                      Details
                    </p>
                    <div className="mt-4 space-y-3 text-sm">
                      <p>
                        <span className="text-[var(--muted)]">Art name:</span>{" "}
                        {selectedArtwork.title}
                      </p>
                      <p>
                        <span className="text-[var(--muted)]">Artist name:</span>{" "}
                        {selectedArtwork.artist}
                      </p>
                      <p>
                        <span className="text-[var(--muted)]">Asking price:</span>{" "}
                        ${selectedArtwork.askingPrice}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>

              <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--card)] p-5">
                <p className="text-xs tracking-[0.24em] text-[var(--muted)] uppercase">
                  Flip for more details
                </p>
                <button
                  type="button"
                  onClick={() => setIsArtworkFlipped((current) => !current)}
                  className="mt-3 rounded-full border border-[var(--border-color)] px-4 py-2 text-xs tracking-[0.2em] uppercase hover:border-[var(--foreground)]"
                >
                  {isArtworkFlipped ? "Show Image" : "Flip Card"}
                </button>

                <div className="mt-6">
                  <p className="text-sm text-[var(--muted)]">Your price</p>
                  <input
                    type="range"
                    min={Math.round(selectedArtwork.askingPrice * 0.5)}
                    max={selectedArtwork.askingPrice}
                    value={offerPrice}
                    onChange={(event) => setOfferPrice(Number(event.target.value))}
                    className="mt-3 w-full accent-white"
                  />
                  <div className="mt-2 flex justify-between text-xs text-[var(--muted)]">
                    <span>${Math.round(selectedArtwork.askingPrice * 0.5)}</span>
                    <span>${selectedArtwork.askingPrice}</span>
                  </div>
                  <p className="mt-3 text-lg tracking-wide">Offer: ${offerPrice}</p>
                </div>

                <button
                  type="button"
                  className="mt-6 w-full rounded-full border border-[var(--foreground)] bg-[var(--foreground)] px-5 py-3 text-sm tracking-[0.18em] text-[var(--background)] uppercase"
                >
                  Submit Offer
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {isAuthModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-[var(--border-color)] bg-[var(--surface)] p-6">
            <div className="mb-6 flex items-center justify-between">
              <p className="text-xs tracking-[0.28em] text-[var(--muted)] uppercase">
                {authMode === "signin" ? "Sign In" : "Sign Up"}
              </p>
              <button
                type="button"
                onClick={closeAuthModal}
                className="rounded-full border border-[var(--border-color)] px-3 py-1 text-xs tracking-[0.2em] uppercase"
              >
                Close
              </button>
            </div>

            <h3 className="text-2xl font-medium tracking-tight">
              {authMode === "signin" ? "Welcome back" : "Create your account"}
            </h3>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Use email or phone number for OTP verification.
            </p>

            <input
              type="text"
              value={authIdentifier}
              onChange={(event) => setAuthIdentifier(event.target.value)}
              placeholder="Email or phone number"
              className="mt-5 w-full rounded-xl border border-[var(--border-color)] bg-[var(--card)] px-4 py-3 text-sm outline-none"
            />

            {otpSent ? (
              <input
                type="text"
                value={enteredOtp}
                onChange={(event) => setEnteredOtp(event.target.value)}
                placeholder="Enter OTP"
                className="mt-3 w-full rounded-xl border border-[var(--border-color)] bg-[var(--card)] px-4 py-3 text-sm outline-none"
              />
            ) : null}

            {authMessage ? (
              <p className="mt-3 text-xs tracking-wide text-[var(--muted)]">{authMessage}</p>
            ) : null}

            <div className="mt-5 grid gap-3">
              <button
                type="button"
                onClick={sendOtp}
                className="w-full rounded-full border border-[var(--foreground)] bg-[var(--foreground)] px-5 py-3 text-sm tracking-[0.16em] text-[var(--background)] uppercase"
              >
                Send OTP
              </button>

              <button
                type="button"
                onClick={verifyOtp}
                className="w-full rounded-full border border-[var(--border-color)] px-5 py-3 text-sm tracking-[0.16em] uppercase"
              >
                Verify & Continue
              </button>

              <button
                type="button"
                onClick={signInWithGoogle}
                className="w-full rounded-full border border-[var(--border-color)] bg-[var(--card)] px-5 py-3 text-sm tracking-[0.16em] uppercase"
              >
                Sign in with Google
              </button>
            </div>

            <p className="mt-5 text-center text-xs text-[var(--muted)]">
              {authMode === "signin"
                ? "New here?"
                : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={() => {
                  setAuthMode((current) =>
                    current === "signin" ? "signup" : "signin"
                  );
                  setAuthMessage("");
                  setOtpSent(false);
                  setGeneratedOtp("");
                  setEnteredOtp("");
                }}
                className="font-medium text-[var(--foreground)] underline underline-offset-4"
              >
                {authMode === "signin" ? "Create account" : "Sign in"}
              </button>
            </p>
          </div>
        </div>
      ) : null}
    </main>
  );
}
