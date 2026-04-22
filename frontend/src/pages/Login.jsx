import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { useTheme } from "../context/ThemeContext";

function ParticleCanvas() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    let W = canvas.width = canvas.offsetWidth;
    let H = canvas.height = canvas.offsetHeight;
    const COLORS = ["#7C3AED","#06B6D4","#F43F5E","#F59E0B","#A855F7"];
    const particles = Array.from({ length: 55 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 2.5 + 0.5,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      alpha: Math.random() * 0.5 + 0.2,
    }));
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      particles.forEach((p) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color + Math.floor(p.alpha * 255).toString(16).padStart(2, "0");
        ctx.fill();
      });
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = "rgba(124,58,237," + (0.12 * (1 - dist / 100)) + ")";
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    };
    draw();
    const onResize = () => { W = canvas.width = canvas.offsetWidth; H = canvas.height = canvas.offsetHeight; };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", onResize); };
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}

function Orb({ className, style }) {
  return <div className={"absolute rounded-full blur-3xl pointer-events-none " + className} style={style} />;
}

export default function Login() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [focused, setFocused] = useState("");
  const [formVisible, setFormVisible] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await API.post("/auth/login", form);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      const role = data.user.role;
      if (role === "admin") navigate("/admin");
      else if (role === "manager") navigate("/manager");
      else navigate("/employee");
    } catch (err) {
      setError(err.response?.data?.msg || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const isDark = theme === "dark";

  return (
    <div className={"min-h-screen flex overflow-hidden relative " + (isDark ? "bg-brand-dark" : "bg-slate-50")}
      style={{ paddingTop: "var(--sat)", paddingBottom: "var(--sab)" }}>

      <Orb className="w-[600px] h-[600px] -top-48 -left-48 animate-float"
        style={{ background: "radial-gradient(circle, #7C3AED33 0%, transparent 70%)" }} />
      <Orb className="w-[500px] h-[500px] -bottom-32 -right-32 animate-float2"
        style={{ background: "radial-gradient(circle, #06B6D433 0%, transparent 70%)" }} />
      <Orb className="w-[300px] h-[300px] top-1/2 left-1/3 animate-float"
        style={{ background: "radial-gradient(circle, #F43F5E22 0%, transparent 70%)", animationDelay: "2s" }} />

      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[55%] relative flex-col justify-between p-14 overflow-hidden">
        <ParticleCanvas />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] animate-morph opacity-20 pointer-events-none"
          style={{ background: "linear-gradient(135deg, #7C3AED, #06B6D4, #F43F5E)" }} />

        <div className={"relative z-10 flex items-center gap-3 opacity-0 " + (mounted ? "animate-slide-up" : "")}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #7C3AED, #06B6D4)" }}>
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <span className={"font-black text-2xl tracking-tight " + (isDark ? "text-white" : "text-slate-900")}>
            Nexus<span className="gradient-text">CMS</span>
          </span>
        </div>

        <div className="relative z-10">
          <div className={"opacity-0 " + (mounted ? "animate-slide-up delay-200" : "")}>
            <p className="text-sm font-semibold tracking-widest uppercase mb-4" style={{ color: "#06B6D4" }}>
              Company Management System
            </p>
            <h2 className={"text-5xl font-black leading-[1.1] mb-6 " + (isDark ? "text-white" : "text-slate-900")}>
              Run your team<br /><span className="gradient-text">at full speed.</span>
            </h2>
            <p className={"text-lg leading-relaxed max-w-md " + (isDark ? "text-slate-400" : "text-slate-500")}>
              One unified platform for employees, managers, and admins. Track attendance, tasks, payroll, and leaves — all in real time.
            </p>
          </div>
          <div className={"grid grid-cols-2 gap-3 mt-10 opacity-0 " + (mounted ? "animate-slide-up delay-400" : "")}>
            {[
              { 
                icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>, 
                label: "Real-time Dashboard", 
                color: "#F59E0B" 
              },
              { 
                icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>, 
                label: "Role-based Access", 
                color: "#7C3AED" 
              },
              { 
                icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, 
                label: "Payroll Tracking", 
                color: "#06B6D4" 
              },
              { 
                icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>, 
                label: "Task Management", 
                color: "#F43F5E" 
              },
            ].map((f) => (
              <div key={f.label}
                className={"flex items-center gap-3 px-4 py-3 rounded-2xl glass transition-transform hover:-translate-y-0.5 cursor-default " + (isDark ? "" : "glass-light")}>
                <div style={{ color: f.color }}>{f.icon}</div>
                <span className={"text-sm font-medium " + (isDark ? "text-slate-300" : "text-slate-700")}>{f.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={"relative z-10 opacity-0 " + (mounted ? "animate-slide-up delay-600" : "")}>
          <p className={"text-sm italic " + (isDark ? "text-slate-600" : "text-slate-400")}>"Built for teams that move fast."</p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className={"w-full lg:w-[45%] flex flex-col relative z-10 backdrop-blur-xl border-l " + (isDark ? "bg-brand-surface/80 border-brand-border" : "bg-white/90 border-slate-200")}>

        <div className="flex items-center justify-between px-6 sm:px-10 py-5">
          <div className="flex items-center gap-2 lg:hidden">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #7C3AED, #06B6D4)" }}>
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <span className={"font-black text-lg " + (isDark ? "text-white" : "text-slate-900")}>
              Nexus<span className="gradient-text">CMS</span>
            </span>
          </div>
          <div className="hidden lg:block" />
          <button onClick={toggleTheme}
            className={"p-2.5 rounded-xl transition-all hover:scale-110 " + (isDark ? "bg-brand-card text-slate-400 hover:text-white border border-brand-border" : "bg-slate-100 text-slate-500 hover:text-slate-900")}>
            {isDark ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
              </svg>
            )}
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 sm:px-10 py-8">
          <div className="w-full max-w-sm">

            <div className={"mb-8 opacity-0 " + (mounted ? "animate-slide-up delay-100" : "")}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-6 rounded-full" style={{ background: "linear-gradient(180deg, #7C3AED, #06B6D4)" }} />
                <span className={"text-xs font-bold tracking-widest uppercase " + (isDark ? "text-slate-500" : "text-slate-400")}>Secure Login</span>
              </div>
              <h1 className={"text-3xl font-black " + (isDark ? "text-white" : "text-slate-900")}>Welcome back</h1>
              <p className={"text-sm mt-1.5 " + (isDark ? "text-slate-500" : "text-slate-400")}>Sign in to access your workspace</p>
            </div>

            {error && (
              <div className="mb-5 flex items-start gap-3 px-4 py-3 rounded-2xl border animate-bounce-in"
                style={{ background: "#F43F5E11", borderColor: "#F43F5E33", color: "#F43F5E" }}>
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className={"opacity-0 " + (mounted ? "animate-slide-up delay-200" : "")}>
                <label className={"block text-xs font-bold tracking-wider uppercase mb-2 " + (isDark ? "text-slate-400" : "text-slate-500")}>Email Address</label>
                <div className="relative">
                  <div className={"absolute left-4 top-1/2 -translate-y-1/2 transition-colors " + (focused === "email" ? "text-violet-500" : isDark ? "text-slate-600" : "text-slate-400")}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input type="email" name="email" value={form.email} onChange={handleChange} required autoComplete="email"
                    placeholder="you@company.com"
                    onFocus={() => setFocused("email")} onBlur={() => setFocused("")}
                    className={"w-full pl-11 pr-4 py-3 rounded-2xl text-sm font-medium transition-all outline-none input-glow " + (isDark ? "bg-brand-card border border-brand-border text-white placeholder-slate-600" : "bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400")} />
                </div>
              </div>

              <div className={"opacity-0 " + (mounted ? "animate-slide-up delay-300" : "")}>
                <label className={"block text-xs font-bold tracking-wider uppercase mb-2 " + (isDark ? "text-slate-400" : "text-slate-500")}>Password</label>
                <div className="relative">
                  <div className={"absolute left-4 top-1/2 -translate-y-1/2 transition-colors " + (focused === "password" ? "text-violet-500" : isDark ? "text-slate-600" : "text-slate-400")}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input type={showPass ? "text" : "password"} name="password" value={form.password} onChange={handleChange} required autoComplete="current-password"
                    placeholder="••••••••"
                    onFocus={() => setFocused("password")} onBlur={() => setFocused("")}
                    className={"w-full pl-11 pr-12 py-3 rounded-2xl text-sm font-medium transition-all outline-none input-glow " + (isDark ? "bg-brand-card border border-brand-border text-white placeholder-slate-600" : "bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400")} />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className={"absolute right-4 top-1/2 -translate-y-1/2 transition-colors hover:text-violet-500 " + (isDark ? "text-slate-600" : "text-slate-400")}>
                    {showPass ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className={"opacity-0 " + (mounted ? "animate-slide-up delay-400" : "")}>
                <button type="submit" disabled={loading}
                  className="w-full py-3.5 px-4 rounded-2xl text-white font-bold text-sm btn-shimmer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 transition-all">
                  {loading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Authenticating...
                    </>
                  ) : (
                    <>
                      Sign In
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className={"mt-8 p-4 rounded-2xl border opacity-0 " + (mounted ? "animate-slide-up delay-500" : "") + " " + (isDark ? "bg-brand-card border-brand-border" : "bg-slate-50 border-slate-200")}>
              <p className={"text-xs font-bold tracking-wider uppercase mb-3 " + (isDark ? "text-slate-600" : "text-slate-400")}>Access by role</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { role: "Admin",    desc: "Full access",   color: "#F43F5E" },
                  { role: "Manager",  desc: "Team access",   color: "#F59E0B" },
                  { role: "Employee", desc: "Personal view", color: "#06B6D4" },
                ].map((r) => (
                  <div key={r.role} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
                    style={{ background: r.color + "15", border: "1px solid " + r.color + "30" }}>
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: r.color }} />
                    <span className="text-xs font-semibold" style={{ color: r.color }}>{r.role}</span>
                    <span className={"text-xs " + (isDark ? "text-slate-600" : "text-slate-400")}>· {r.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 sm:px-10 py-4 text-center">
          <p className={"text-xs " + (isDark ? "text-slate-700" : "text-slate-400")}>© 2026 NexusCMS · All rights reserved</p>
        </div>
      </div>
    </div>
  );
}