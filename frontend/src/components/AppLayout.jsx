// ============================================================
// AppLayout.jsx — Shared layout shell for all roles
// Mobile-first: bottom nav bar on mobile, sidebar on desktop
// Capacitor-ready with safe area insets
// ============================================================

import { useState } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import { useTheme } from "../context/ThemeContext";

// Role accent colors
const ROLE_CONFIG = {
  admin:    { color: "#F43F5E", label: "ADMIN",    gradient: "from-rose-500 to-orange-500" },
  manager:  { color: "#F59E0B", label: "MANAGER",  gradient: "from-amber-500 to-yellow-400" },
  employee: { color: "#06B6D4", label: "EMPLOYEE", gradient: "from-cyan-500 to-teal-400" },
};

export default function AppLayout({ navItems, role }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [desktopOpen, setDesktopOpen] = useState(true);
  const [mobileOpen, setMobileOpen]   = useState(false);

  const cfg = ROLE_CONFIG[role] || ROLE_CONFIG.employee;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Get current page label for topbar
  const currentPage = navItems.find((item) => {
    if (item.end) return location.pathname === item.path;
    return location.pathname.startsWith(item.path);
  });

  const SidebarContent = ({ onClose }) => (
    <div className="flex flex-col h-full">

      {/* Brand */}
      <div className={`flex items-center justify-between px-5 py-5 border-b flex-shrink-0 ${isDark ? "border-brand-border" : "border-slate-200"}`}
        style={{ paddingTop: `calc(1.25rem + var(--sat))` }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #7C3AED, #06B6D4)" }}>
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <span className={`font-black text-lg tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
            Nexus<span className="gradient-text">CMS</span>
          </span>
        </div>
        {onClose && (
          <button onClick={onClose}
            className={`p-2 rounded-xl lg:hidden transition-colors touch-target flex items-center justify-center ${isDark ? "text-slate-500 hover:text-white hover:bg-brand-card" : "text-slate-400 hover:bg-slate-100"}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item, i) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            onClick={() => onClose?.()}
            style={{ animationDelay: `${i * 40}ms` }}
            className={({ isActive }) =>
              `group relative flex items-center gap-3 px-3.5 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 animate-nav-slide opacity-0
              ${isActive
                ? isDark
                  ? "text-white shadow-glow-sm"
                  : "text-slate-900 shadow-glow-sm bg-gradient-to-r from-purple-50 to-cyan-50"
                : isDark
                  ? "text-slate-500 hover:text-white hover:bg-brand-card"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <div className="absolute left-0 w-1 h-8 rounded-r-full"
                    style={{ background: `linear-gradient(180deg, #7C3AED, #06B6D4)` }} />
                )}
                <div className={`flex items-center justify-center w-8 h-8 rounded-xl flex-shrink-0 transition-all duration-200
                  ${isActive ? "shadow-glow-sm" : "group-hover:scale-110"}`}
                  style={isActive ? { background: "linear-gradient(135deg, #7C3AED, #06B6D4)" } : {}}>
                  <span className={isActive ? "text-white" : ""}>{item.icon}</span>
                </div>
                <span className="flex-1">{item.label}</span>
                {isActive && (
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User card */}
      <div className={`px-4 py-4 border-t flex-shrink-0 ${isDark ? "border-brand-border" : "border-slate-200"}`}
        style={{ paddingBottom: `calc(1rem + var(--sab))` }}>
        <div className={`flex items-center gap-3 p-3 rounded-2xl ${isDark ? "bg-brand-card" : "bg-slate-50"}`}>
          <div className="w-9 h-9 rounded-2xl flex items-center justify-center font-black text-sm text-white flex-shrink-0"
            style={{ background: `linear-gradient(135deg, ${cfg.color}, ${cfg.color}99)` }}>
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className={`text-sm font-bold truncate ${isDark ? "text-white" : "text-slate-900"}`}>{user.name}</p>
            <p className="text-xs font-bold" style={{ color: cfg.color }}>{cfg.label}</p>
          </div>
          <button onClick={handleLogout} title="Sign out"
            className={`p-2 rounded-xl transition-colors flex-shrink-0 touch-target flex items-center justify-center ${isDark ? "text-slate-600 hover:text-rose-400 hover:bg-rose-500/10" : "text-slate-400 hover:text-rose-500 hover:bg-rose-50"}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );

  // Collapsed sidebar (icons only) — desktop
  const CollapsedSidebar = () => (
    <div className="flex flex-col h-full items-center">
      <div className={`flex items-center justify-center py-5 w-full border-b flex-shrink-0 ${isDark ? "border-brand-border" : "border-slate-200"}`}
        style={{ paddingTop: `calc(1.25rem + var(--sat))` }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #7C3AED, #06B6D4)" }}>
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
      </div>
      <nav className="flex-1 flex flex-col items-center px-2 py-4 gap-1 w-full overflow-y-auto">
        {navItems.map((item) => (
          <NavLink key={item.path} to={item.path} end={item.end}
            className={({ isActive }) =>
              `flex items-center justify-center w-10 h-10 rounded-2xl transition-all duration-200
              ${isActive
                ? "shadow-glow-sm text-white"
                : isDark
                  ? "text-slate-600 hover:text-white hover:bg-brand-card"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`
            }
            style={({ isActive }) => isActive ? { background: "linear-gradient(135deg, #7C3AED, #06B6D4)" } : {}}
            title={item.label}
          >
            {item.icon}
          </NavLink>
        ))}
      </nav>
      <div className={`py-4 w-full flex justify-center border-t flex-shrink-0 ${isDark ? "border-brand-border" : "border-slate-200"}`}
        style={{ paddingBottom: `calc(1rem + var(--sab))` }}>
        <div className="w-9 h-9 rounded-2xl flex items-center justify-center font-black text-sm text-white"
          style={{ background: `linear-gradient(135deg, ${cfg.color}, ${cfg.color}99)` }}>
          {user.name?.charAt(0).toUpperCase()}
        </div>
      </div>
    </div>
  );

  // Mobile bottom navigation bar (max 5 items shown)
  const visibleNavItems = navItems.slice(0, 5);

  return (
    <div className={`flex h-screen overflow-hidden ${isDark ? "bg-brand-dark" : "bg-slate-100"}`}>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile drawer (slide-in sidebar) */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 flex flex-col transform transition-transform duration-300 lg:hidden
        ${isDark ? "bg-brand-surface border-r border-brand-border" : "bg-white border-r border-slate-200"}
        ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <SidebarContent onClose={() => setMobileOpen(false)} />
      </aside>

      {/* Desktop sidebar */}
      <aside className={`hidden lg:flex flex-shrink-0 flex-col transition-all duration-300 relative
        ${desktopOpen ? "w-60" : "w-[68px]"}
        ${isDark ? "bg-brand-surface border-r border-brand-border" : "bg-white border-r border-slate-200"}`}>
        {desktopOpen ? <SidebarContent onClose={null} /> : <CollapsedSidebar />}
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Topbar */}
        <header className={`flex items-center justify-between px-4 py-3 flex-shrink-0 border-b
          ${isDark ? "bg-brand-surface/80 border-brand-border backdrop-blur-xl" : "bg-white/80 border-slate-200 backdrop-blur-xl"}`}
          style={{ paddingTop: `calc(0.75rem + var(--sat))` }}>

          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => {
                if (window.innerWidth < 1024) setMobileOpen(true);
                else setDesktopOpen(!desktopOpen);
              }}
              className={`p-2 rounded-xl transition-all hover:scale-105 flex-shrink-0 touch-target flex items-center justify-center ${isDark ? "text-slate-500 hover:text-white hover:bg-brand-card" : "text-slate-400 hover:text-slate-900 hover:bg-slate-100"}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Current page title — mobile only */}
            {currentPage && (
              <span className={`text-sm font-bold truncate lg:hidden ${isDark ? "text-white" : "text-slate-900"}`}>
                {currentPage.label}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Role badge — hidden on small mobile */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
              style={{ background: cfg.color + "15", color: cfg.color, border: `1px solid ${cfg.color}30` }}>
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: cfg.color }} />
              {cfg.label}
            </div>
            <ThemeToggle />
            <button onClick={handleLogout}
              className={`hidden sm:flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-xl transition-all
                ${isDark ? "text-slate-500 hover:text-rose-400 hover:bg-rose-500/10" : "text-slate-400 hover:text-rose-500 hover:bg-rose-50"}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign out
            </button>
          </div>
        </header>

        {/* Page content — extra bottom padding on mobile for bottom nav */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 lg:pb-6">
          <Outlet />
        </main>

        {/* ── Mobile Bottom Navigation Bar ── */}
        <nav className={`lg:hidden fixed bottom-0 left-0 right-0 z-30 border-t flex items-stretch
          ${isDark ? "bg-brand-surface border-brand-border" : "bg-white border-slate-200"}`}
          style={{ paddingBottom: `var(--sab)` }}>
          {visibleNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center justify-center gap-1 py-2 px-1 text-[10px] font-semibold transition-colors min-h-[56px]
                ${isActive
                  ? isDark ? "text-violet-400" : "text-violet-600"
                  : isDark ? "text-slate-600" : "text-slate-400"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`flex items-center justify-center w-8 h-8 rounded-xl transition-all duration-200
                    ${isActive
                      ? isDark ? "bg-violet-500/20" : "bg-violet-50"
                      : ""
                    }`}
                    style={isActive ? { color: "#7C3AED" } : {}}>
                    {item.icon}
                  </div>
                  <span className="leading-none truncate max-w-full px-0.5">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}

          {/* More button if navItems > 5 */}
          {navItems.length > 5 && (
            <button
              onClick={() => setMobileOpen(true)}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 px-1 text-[10px] font-semibold transition-colors min-h-[56px]
                ${isDark ? "text-slate-600" : "text-slate-400"}`}>
              <div className="flex items-center justify-center w-8 h-8 rounded-xl">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                </svg>
              </div>
              <span className="leading-none">More</span>
            </button>
          )}
        </nav>
      </div>
    </div>
  );
}
