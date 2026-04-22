
// ============================================================
// Landing.jsx — Public marketing page for NexusCMS
// 4 sections: Hero, Features, How It Works, CTA
// Fully responsive + Capacitor safe-area ready
// ============================================================

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import ThemeToggle from "../components/ThemeToggle";

// ── Animated counter hook ──
function useCounter(target, duration = 1500, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

// ── Intersection observer hook ──
function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

// ── Navbar ──
function Navbar({ isDark }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how" },
    { label: "Roles", href: "#roles" },
    { label: "Get Started", href: "#cta" },
  ];
  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? (isDark ? "bg-brand-surface/95 border-b border-brand-border shadow-lg" : "bg-white/95 border-b border-slate-200 shadow-sm") : "bg-transparent"}`}
      style={{ paddingTop: "var(--sat)" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #7C3AED, #06B6D4)" }}>
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <span className={`font-black text-lg tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
            Nexus<span className="gradient-text">CMS</span>
          </span>
        </div>
        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((l) => (
            <a key={l.label} href={l.href}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${isDark ? "text-slate-400 hover:text-white hover:bg-brand-card" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"}`}>
              {l.label}
            </a>
          ))}
        </nav>
        {/* Right actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link to="/login"
            className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all hover:-translate-y-0.5"
            style={{ background: "linear-gradient(135deg, #7C3AED, #06B6D4)" }}>
            Sign In
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          {/* Mobile hamburger */}
          <button onClick={() => setMenuOpen(!menuOpen)}
            className={`md:hidden p-2 rounded-xl transition-colors ${isDark ? "text-slate-400 hover:text-white hover:bg-brand-card" : "text-slate-500 hover:bg-slate-100"}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
      </div>
      {/* Mobile menu */}
      {menuOpen && (
        <div className={`md:hidden border-t px-4 py-3 space-y-1 ${isDark ? "bg-brand-surface border-brand-border" : "bg-white border-slate-200"}`}>
          {navLinks.map((l) => (
            <a key={l.label} href={l.href} onClick={() => setMenuOpen(false)}
              className={`block px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${isDark ? "text-slate-300 hover:text-white hover:bg-brand-card" : "text-slate-700 hover:bg-slate-100"}`}>
              {l.label}
            </a>
          ))}
          <Link to="/login" onClick={() => setMenuOpen(false)}
            className="block mt-2 px-4 py-3 rounded-xl text-sm font-bold text-white text-center"
            style={{ background: "linear-gradient(135deg, #7C3AED, #06B6D4)" }}>
            Sign In to Dashboard
          </Link>
        </div>
      )}
    </header>
  );
}

// ── Section 1: Hero ──
function HeroSection({ isDark }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setTimeout(() => setMounted(true), 80); }, []);

  const stats = [
    { value: "3", suffix: " Roles", label: "Admin · Manager · Employee" },
    { value: "6", suffix: "+ Modules", label: "All-in-one platform" },
    { value: "100", suffix: "%", label: "Mobile responsive" },
  ];

  return (
    <section className={`relative min-h-screen flex flex-col justify-center overflow-hidden pt-20 pb-16 px-4 sm:px-6 ${isDark ? "bg-brand-dark" : "bg-slate-50"}`}>
      {/* Background orbs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none animate-float"
        style={{ background: "radial-gradient(circle, #7C3AED, transparent 70%)" }} />
      <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full blur-3xl opacity-15 pointer-events-none animate-float2"
        style={{ background: "radial-gradient(circle, #06B6D4, transparent 70%)" }} />
      <div className="absolute top-1/3 right-1/4 w-64 h-64 rounded-full blur-3xl opacity-10 pointer-events-none"
        style={{ background: "radial-gradient(circle, #F43F5E, transparent 70%)" }} />

      <div className="relative z-10 max-w-5xl mx-auto w-full text-center">
        {/* Badge */}
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold mb-6 border opacity-0 ${mounted ? "animate-slide-up" : ""}`}
          style={{ background: "#7C3AED15", borderColor: "#7C3AED30", color: "#7C3AED", animationDelay: "0ms" }}>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Company Management System · v2.0
        </div>

        {/* Headline */}
        <h1 className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight mb-6 opacity-0 ${mounted ? "animate-slide-up" : ""} ${isDark ? "text-white" : "text-slate-900"}`}
          style={{ animationDelay: "80ms" }}>
          Manage your team<br />
          <span className="gradient-text">at full speed.</span>
        </h1>

        {/* Subtitle */}
        <p className={`text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-10 opacity-0 ${mounted ? "animate-slide-up" : ""} ${isDark ? "text-slate-400" : "text-slate-500"}`}
          style={{ animationDelay: "160ms" }}>
          NexusCMS unifies attendance, tasks, payroll, and leave management into one beautiful platform — built for admins, managers, and employees.
        </p>

        {/* CTA buttons */}
        <div className={`flex flex-col sm:flex-row items-center justify-center gap-3 mb-16 opacity-0 ${mounted ? "animate-slide-up" : ""}`}
          style={{ animationDelay: "240ms" }}>
          <Link to="/login"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-white font-bold text-base btn-shimmer shadow-glow-violet transition-all hover:-translate-y-1">
            Get Started Free
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          <a href="#features"
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold text-base border transition-all hover:-translate-y-1 ${isDark ? "border-brand-border text-slate-300 hover:bg-brand-card" : "border-slate-200 text-slate-700 hover:bg-white"}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            See Features
          </a>
        </div>

        {/* Stats row */}
        <div className={`grid grid-cols-3 gap-4 max-w-lg mx-auto opacity-0 ${mounted ? "animate-slide-up" : ""}`}
          style={{ animationDelay: "320ms" }}>
          {stats.map((s) => (
            <div key={s.label} className={`rounded-2xl p-4 border text-center ${isDark ? "bg-brand-card border-brand-border" : "bg-white border-slate-200 shadow-sm"}`}>
              <p className="text-2xl sm:text-3xl font-black gradient-text">{s.value}<span className="text-base sm:text-lg">{s.suffix}</span></p>
              <p className={`text-xs mt-1 leading-tight ${isDark ? "text-slate-500" : "text-slate-400"}`}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 animate-bounce">
        <span className={`text-xs font-medium ${isDark ? "text-slate-600" : "text-slate-400"}`}>Scroll</span>
        <svg className={`w-4 h-4 ${isDark ? "text-slate-600" : "text-slate-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </section>
  );
}

// ── Section 2: Features ──
function FeaturesSection({ isDark }) {
  const [ref, inView] = useInView();

  const features = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      title: "Attendance Tracking",
      desc: "Real-time check-in/check-out with worked hours calculation. Managers see their team, admins see everyone.",
      color: "#06B6D4",
      bg: isDark ? "bg-cyan-500/10 border-cyan-500/20" : "bg-cyan-50 border-cyan-200",
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      title: "Task Management",
      desc: "Managers assign tasks with deadlines. Employees mark them done. Full visibility for admins across all teams.",
      color: "#F59E0B",
      bg: isDark ? "bg-amber-500/10 border-amber-500/20" : "bg-amber-50 border-amber-200",
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "Payroll Generation",
      desc: "Auto-calculate net salary with absent-day deductions. Generate monthly payroll per employee in one click.",
      color: "#10B981",
      bg: isDark ? "bg-emerald-500/10 border-emerald-500/20" : "bg-emerald-50 border-emerald-200",
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
      title: "Leave Management",
      desc: "Apply, approve, or reject leave requests. Managers handle their team; admins handle everyone including managers.",
      color: "#F43F5E",
      bg: isDark ? "bg-rose-500/10 border-rose-500/20" : "bg-rose-50 border-rose-200",
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      title: "Employee Directory",
      desc: "Full CRUD employee management. Search, filter by department or status, sort by name or salary.",
      color: "#7C3AED",
      bg: isDark ? "bg-violet-500/10 border-violet-500/20" : "bg-violet-50 border-violet-200",
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      title: "Department Control",
      desc: "Create departments, assign managers, and track team structure. Full org-chart visibility for admins.",
      color: "#0EA5E9",
      bg: isDark ? "bg-sky-500/10 border-sky-500/20" : "bg-sky-50 border-sky-200",
    },
  ];

  return (
    <section id="features" ref={ref} className={`py-20 sm:py-28 px-4 sm:px-6 ${isDark ? "bg-brand-surface" : "bg-white"}`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className={`text-center mb-14 transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold mb-4 border"
            style={{ background: "#7C3AED15", borderColor: "#7C3AED30", color: "#7C3AED" }}>
            Everything you need
          </span>
          <h2 className={`text-3xl sm:text-4xl md:text-5xl font-black mb-4 ${isDark ? "text-white" : "text-slate-900"}`}>
            Six powerful modules,<br className="hidden sm:block" />
            <span className="gradient-text"> one platform.</span>
          </h2>
          <p className={`text-base sm:text-lg max-w-xl mx-auto ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            Everything your company needs to run smoothly — from day-one onboarding to monthly payroll.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <div key={f.title}
              className={`rounded-2xl border p-6 transition-all duration-700 hover:-translate-y-1 hover:shadow-lg ${f.bg} ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{ transitionDelay: `${i * 80}ms` }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 text-white"
                style={{ background: `linear-gradient(135deg, ${f.color}, ${f.color}99)` }}>
                {f.icon}
              </div>
              <h3 className={`text-base font-bold mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>{f.title}</h3>
              <p className={`text-sm leading-relaxed ${isDark ? "text-slate-400" : "text-slate-500"}`}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Section 3: How It Works ──
function HowItWorksSection({ isDark }) {
  const [ref, inView] = useInView();

  const steps = [
    {
      step: "01",
      title: "Admin sets up the company",
      desc: "Create departments, add employees, assign managers, and configure roles. Full control from the admin dashboard.",
      color: "#F43F5E",
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      step: "02",
      title: "Managers run their teams",
      desc: "Assign tasks with deadlines, track attendance, generate payroll, and approve or reject leave requests.",
      color: "#F59E0B",
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      step: "03",
      title: "Employees stay on top",
      desc: "Check in/out daily, view assigned tasks, apply for leave, and track their own payroll — all from one place.",
      color: "#06B6D4",
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      step: "04",
      title: "Everyone sees what matters",
      desc: "Role-based dashboards show only relevant data. No clutter, no confusion — just the right info at the right time.",
      color: "#7C3AED",
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
  ];

  return (
    <section id="how" ref={ref} className={`py-20 sm:py-28 px-4 sm:px-6 ${isDark ? "bg-brand-dark" : "bg-slate-50"}`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className={`text-center mb-14 transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold mb-4 border"
            style={{ background: "#06B6D415", borderColor: "#06B6D430", color: "#06B6D4" }}>
            Simple workflow
          </span>
          <h2 className={`text-3xl sm:text-4xl md:text-5xl font-black mb-4 ${isDark ? "text-white" : "text-slate-900"}`}>
            How it works
          </h2>
          <p className={`text-base sm:text-lg max-w-xl mx-auto ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            Four simple steps from setup to a fully running company management system.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {steps.map((s, i) => (
            <div key={s.step}
              className={`relative rounded-3xl border p-6 sm:p-8 overflow-hidden transition-all duration-700 hover:-translate-y-1 ${isDark ? "bg-brand-card border-brand-border" : "bg-white border-slate-200 shadow-sm"} ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{ transitionDelay: `${i * 100}ms` }}>
              {/* Big step number background */}
              <span className="absolute top-4 right-5 text-7xl font-black opacity-5 select-none leading-none"
                style={{ color: s.color }}>{s.step}</span>
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 text-white"
                  style={{ background: `linear-gradient(135deg, ${s.color}, ${s.color}99)` }}>
                  {s.icon}
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-black tracking-widest" style={{ color: s.color }}>STEP {s.step}</span>
                </div>
                <h3 className={`text-lg sm:text-xl font-bold mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>{s.title}</h3>
                <p className={`text-sm sm:text-base leading-relaxed ${isDark ? "text-slate-400" : "text-slate-500"}`}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Section 4: Roles ──
function RolesSection({ isDark }) {
  const [ref, inView] = useInView();
  const [active, setActive] = useState(0);

  const roles = [
    {
      role: "Admin",
      color: "#F43F5E",
      gradient: "from-rose-500 to-orange-500",
      icon: "👑",
      tagline: "Full control over everything",
      perks: [
        "Manage all employees & users",
        "Create & assign departments",
        "View all attendance records",
        "Generate payroll for anyone",
        "Approve/reject all leave requests",
        "Monitor all tasks company-wide",
      ],
    },
    {
      role: "Manager",
      color: "#F59E0B",
      gradient: "from-amber-500 to-yellow-400",
      icon: "🧑‍💼",
      tagline: "Lead your team effectively",
      perks: [
        "Add employees to your department",
        "Assign & track team tasks",
        "View team attendance daily",
        "Generate team payroll",
        "Approve employee leave requests",
        "Apply for your own leave",
      ],
    },
    {
      role: "Employee",
      color: "#06B6D4",
      gradient: "from-cyan-500 to-teal-400",
      icon: "🧑‍💻",
      tagline: "Stay productive every day",
      perks: [
        "Check in & out with one tap",
        "View & complete assigned tasks",
        "Apply for leave anytime",
        "Track your payroll history",
        "View your full profile",
        "See your attendance history",
      ],
    },
  ];

  return (
    <section id="roles" ref={ref} className={`py-20 sm:py-28 px-4 sm:px-6 ${isDark ? "bg-brand-surface" : "bg-white"}`}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className={`text-center mb-12 transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold mb-4 border"
            style={{ background: "#F59E0B15", borderColor: "#F59E0B30", color: "#F59E0B" }}>
            Role-based access
          </span>
          <h2 className={`text-3xl sm:text-4xl md:text-5xl font-black mb-4 ${isDark ? "text-white" : "text-slate-900"}`}>
            Built for every<br />
            <span className="gradient-text">team member.</span>
          </h2>
          <p className={`text-base sm:text-lg max-w-xl mx-auto ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            Three distinct roles, each with a tailored dashboard and permissions — no overlap, no confusion.
          </p>
        </div>

        {/* Role tabs */}
        <div className={`flex rounded-2xl p-1 mb-8 gap-1 transition-all duration-700 ${isDark ? "bg-brand-card" : "bg-slate-100"} ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          style={{ transitionDelay: "100ms" }}>
          {roles.map((r, i) => (
            <button key={r.role} onClick={() => setActive(i)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-2 rounded-xl text-sm font-bold transition-all duration-200 ${active === i ? "text-white shadow-md" : isDark ? "text-slate-500 hover:text-slate-300" : "text-slate-500 hover:text-slate-700"}`}
              style={active === i ? { background: `linear-gradient(135deg, ${r.color}, ${r.color}cc)` } : {}}>
              <span className="text-base">{r.icon}</span>
              <span className="hidden xs:inline">{r.role}</span>
            </button>
          ))}
        </div>

        {/* Active role card */}
        {roles.map((r, i) => (
          <div key={r.role}
            className={`rounded-3xl border overflow-hidden transition-all duration-500 ${active === i ? "opacity-100 scale-100" : "opacity-0 scale-95 hidden"} ${isDark ? "bg-brand-card border-brand-border" : "bg-white border-slate-200 shadow-sm"} ${inView ? "opacity-100" : "opacity-0"}`}
            style={{ transitionDelay: "200ms" }}>
            {/* Card header */}
            <div className="p-6 sm:p-8 border-b flex flex-col sm:flex-row sm:items-center gap-4"
              style={{ borderColor: r.color + "30", background: r.color + "08" }}>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                style={{ background: `linear-gradient(135deg, ${r.color}22, ${r.color}44)`, border: `2px solid ${r.color}33` }}>
                {r.icon}
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className={`text-2xl font-black ${isDark ? "text-white" : "text-slate-900"}`}>{r.role}</h3>
                  <span className="px-3 py-1 rounded-full text-xs font-bold text-white"
                    style={{ background: `linear-gradient(135deg, ${r.color}, ${r.color}cc)` }}>
                    Role
                  </span>
                </div>
                <p style={{ color: r.color }} className="text-sm font-semibold">{r.tagline}</p>
              </div>
            </div>
            {/* Perks grid */}
            <div className="p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {r.perks.map((perk) => (
                <div key={perk} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: r.color + "20" }}>
                    <svg className="w-3 h-3" fill="none" stroke={r.color} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className={`text-sm ${isDark ? "text-slate-300" : "text-slate-600"}`}>{perk}</span>
                </div>
              ))}
            </div>
            {/* CTA */}
            <div className={`px-6 sm:px-8 pb-6 sm:pb-8`}>
              <Link to="/login"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white transition-all hover:-translate-y-0.5"
                style={{ background: `linear-gradient(135deg, ${r.color}, ${r.color}cc)` }}>
                Sign in as {r.role}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Section 5: CTA + Footer ──
function CTASection({ isDark }) {
  const [ref, inView] = useInView();
  const empCount  = useCounter(500, 1800, inView);
  const taskCount = useCounter(12000, 2000, inView);
  const deptCount = useCounter(50, 1400, inView);

  return (
    <section id="cta" ref={ref} className={`py-20 sm:py-28 px-4 sm:px-6 ${isDark ? "bg-brand-dark" : "bg-slate-50"}`}>
      <div className="max-w-4xl mx-auto">
        {/* Live stats */}
        <div className={`grid grid-cols-3 gap-4 sm:gap-6 mb-16 transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          {[
            { value: empCount, suffix: "+", label: "Employees Managed", color: "#7C3AED" },
            { value: taskCount, suffix: "+", label: "Tasks Completed", color: "#06B6D4" },
            { value: deptCount, suffix: "+", label: "Departments", color: "#F59E0B" },
          ].map((s) => (
            <div key={s.label} className={`rounded-2xl border p-4 sm:p-6 text-center ${isDark ? "bg-brand-card border-brand-border" : "bg-white border-slate-200 shadow-sm"}`}>
              <p className="text-2xl sm:text-4xl font-black" style={{ color: s.color }}>
                {s.value}{s.suffix}
              </p>
              <p className={`text-xs sm:text-sm mt-1 ${isDark ? "text-slate-500" : "text-slate-400"}`}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* CTA card */}
        <div className={`relative rounded-3xl overflow-hidden p-8 sm:p-12 text-center transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          style={{ transitionDelay: "150ms", background: "linear-gradient(135deg, #7C3AED, #06B6D4)" }}>
          {/* Decorative blobs */}
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-20"
            style={{ background: "radial-gradient(circle, #fff, transparent 70%)" }} />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full blur-3xl opacity-15"
            style={{ background: "radial-gradient(circle, #F43F5E, transparent 70%)" }} />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 text-white text-xs font-bold mb-6 border border-white/30">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
              Free to use · No credit card required
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
              Ready to run your<br className="hidden sm:block" /> company smarter?
            </h2>
            <p className="text-white/80 text-base sm:text-lg mb-8 max-w-lg mx-auto">
              Join teams already using NexusCMS to manage attendance, tasks, payroll, and leaves — all in one place.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/login"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white font-bold text-slate-900 text-base transition-all hover:-translate-y-1 hover:shadow-xl">
                Start Now — It's Free
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <a href="#features"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border border-white/40 text-white font-bold text-base transition-all hover:-translate-y-1 hover:bg-white/10">
                Explore Features
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`mt-16 pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4 ${isDark ? "border-brand-border" : "border-slate-200"}`}>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #7C3AED, #06B6D4)" }}>
              <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <span className={`font-black text-base ${isDark ? "text-white" : "text-slate-900"}`}>
              Nexus<span className="gradient-text">CMS</span>
            </span>
          </div>
          <p className={`text-xs ${isDark ? "text-slate-600" : "text-slate-400"}`}>
            © 2026 NexusCMS · Built with React + Capacitor
          </p>
          <Link to="/login"
            className="text-xs font-semibold px-4 py-2 rounded-xl transition-colors"
            style={{ color: "#7C3AED", background: "#7C3AED15" }}>
            Sign In →
          </Link>
        </div>
      </div>
    </section>
  );
}

// ── Root export ──
export default function Landing() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className={isDark ? "bg-brand-dark" : "bg-slate-50"} style={{ paddingBottom: "var(--sab)" }}>
      <Navbar isDark={isDark} />
      <HeroSection isDark={isDark} />
      <FeaturesSection isDark={isDark} />
      <HowItWorksSection isDark={isDark} />
      <RolesSection isDark={isDark} />
      <CTASection isDark={isDark} />
    </div>
  );
}
