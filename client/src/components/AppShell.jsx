import React from "react";

const nav = [
  ["overview", "▦", "Overview"],
  ["transactions", "↔", "Transactions"],
  ["receipts", "▧", "Receipt scanner"],
  ["ai-studio", "✦", "AI Studio"],
  ["budgets", "◎", "Shared budgets"],
];

 const currentYear = new Date().getFullYear();

export function AppShell({
  logo,
  user,
  route,
  onLogout,
  title,
  error,
  notice,
  clearError,
  clearNotice,
  onRefresh,
  darkMode,
  toggleTheme,
  onNavigate,
  children,
}) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="/overview">
          <img className="brand-image" src={logo} alt="AayGraph" />
        </a>
        <div className="nav-label">WORKSPACE</div>
        <nav className="nav-links">
          {nav.map(([id, icon, label]) => (
            <a
              key={id}
              href={`/${id}`}
              onClick={(e) => {
                e.preventDefault();
                onNavigate(id);
              }}
              className={route === id ? "active" : ""}
            >
              <span>{icon}</span>
              {label}
            </a>
          ))}
        </nav>
        <div className="side-bottom">
          <div className="avatar">{(user?.name || "U")[0].toUpperCase()}</div>
          <div className="user-meta">
            <b>{user?.name || "User"}</b>
            <small>{user?.email}</small>
          </div>
          <button className="logout" onClick={onLogout} title="Sign out">
            ↗
          </button>
        </div>
      </aside>
      <main className="main">
        <header className="topbar">
          <div className="page-heading">
            <h1>{title[0]}</h1>
          </div>
          <div className="topbar-actions">
            <button
              type="button"
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label={
                darkMode ? "Switch to light mode" : "Switch to dark mode"
              }
            >
              {darkMode ? "☀ Light mode" : "☾ Dark mode"}
            </button>
            <button className="ghost" onClick={onRefresh}>
              ↻ Refresh
            </button>
          </div>
        </header>
        {error && (
          <div className="alert error">
            {error}
            <button onClick={clearError}>×</button>
          </div>
        )}
        {notice && (
          <div className="alert success">
            {notice}
            <button onClick={clearNotice}>×</button>
          </div>
        )}
        {children}
        <footer className='text-blue-500 text-sm'>Develope by @santosh_diary | All Rights Reserved @AayGraph, {currentYear}</footer>
      </main>
    </div>
  );
}
