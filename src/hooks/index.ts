import { useState, useEffect, useCallback, useRef } from "react";

// ─── useTheme ─────────────────────────────────────────────────────────────────
/** Persists dark/light theme in localStorage, applies data-theme attribute */
export function useTheme() {
  const [dark, setDark] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const saved = localStorage.getItem("zyn-theme");
    if (saved) return saved === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    localStorage.setItem("zyn-theme", dark ? "dark" : "light");
  }, [dark]);

  const toggle = useCallback(() => setDark((d) => !d), []);
  return { dark, toggle };
}

// ─── useScrolled ─────────────────────────────────────────────────────────────
/** Returns true when page has scrolled past threshold */
export function useScrolled(threshold = 40): boolean {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > threshold);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, [threshold]);
  return scrolled;
}

// ─── useTypewriter ────────────────────────────────────────────────────────────
/** Cycles through words with a typewriter / delete effect */
export function useTypewriter(words: string[], speed = 80, pause = 2200): string {
  const [display, setDisplay]   = useState("");
  const [wordIdx, setWordIdx]   = useState(0);
  const [charIdx, setCharIdx]   = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = words[wordIdx];
    const t = setTimeout(
      () => {
        if (!deleting) {
          setDisplay(current.slice(0, charIdx + 1));
          if (charIdx + 1 === current.length) setTimeout(() => setDeleting(true), pause);
          else setCharIdx((c) => c + 1);
        } else {
          setDisplay(current.slice(0, charIdx - 1));
          if (charIdx - 1 === 0) {
            setDeleting(false);
            setWordIdx((w) => (w + 1) % words.length);
            setCharIdx(0);
          } else setCharIdx((c) => c - 1);
        }
      },
      deleting ? speed / 2 : speed
    );
    return () => clearTimeout(t);
  }, [charIdx, deleting, wordIdx, words, speed, pause]);

  return display;
}

// ─── useCounter ──────────────────────────────────────────────────────────────
/** Animates a number from 0 → target using rAF, triggered by `start` flag */
export function useCounter(target: number, duration = 2000, start = false): number {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number;
    const step = (ts: number) => {
      if (!startTime) startTime = ts;
      const p = Math.min((ts - startTime) / duration, 1);
      setCount(Math.floor(p * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return count;
}

// ─── useInView ───────────────────────────────────────────────────────────────
/** Fires once when the element enters the viewport */
export function useInView(threshold = 0.1): [React.RefObject<HTMLDivElement>, boolean] {
  const ref     = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

// ─── useReveal ───────────────────────────────────────────────────────────────
/** Attaches IntersectionObserver to all .reveal elements in DOM */
export function useReveal() {
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) { e.target.classList.add("revealed"); obs.unobserve(e.target); }
        }),
      { threshold: 0.1 }
    );
    document.querySelectorAll(".reveal").forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

// ─── useForm ─────────────────────────────────────────────────────────────────
export interface FormState { name: string; email: string; subject: string; message: string; }
export type FormStatus = "idle" | "sending" | "success" | "error";

/** Manages contact form state, validation, and submission */
export function useForm() {
  const [form, setForm]     = useState<FormState>({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errors, setErrors] = useState<Partial<FormState>>({});

  const validate = (): boolean => {
    const errs: Partial<FormState> = {};
    if (!form.name.trim())    errs.name    = "Name is required";
    if (!form.email.trim())   errs.email   = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = "Invalid email address";
    if (!form.message.trim()) errs.message = "Message is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name as keyof FormState]) setErrors((er) => ({ ...er, [name]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setStatus("sending");
    // Simulate API call — replace with real endpoint
    await new Promise((r) => setTimeout(r, 1800));
    setStatus("success");
    setForm({ name: "", email: "", subject: "", message: "" });
  };

  return { form, status, errors, handleChange, handleSubmit };
}
