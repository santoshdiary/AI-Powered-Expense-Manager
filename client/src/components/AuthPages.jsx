import React from "react";
export function LandingPage({ logo, onStart, darkMode, toggleTheme }) {
  return (
    <main className="landing">
      <nav className="landing-nav">
        <img src={logo} alt="AayGraph" />
        <div>
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={
              darkMode ? "Switch to light mode" : "Switch to dark mode"
            }
          >
            {darkMode ? "☀" : "☾"}
          </button>
          <button className="landing-login" onClick={() => onStart("login")}>
            Log in
          </button>
          <button onClick={() => onStart("register")}>Create account</button>
        </div>
      </nav>
      <section className="landing-hero">
        <div className="hero-copy">
          <h1>
            Your money,
            <br /> <em>made clearer.</em>
          </h1>
          <p>Track spending, plan budgets and see where your money goes.</p>
          <div className="hero-actions">
            <button onClick={() => onStart("register")}>
              Create your free account <span>→</span>
            </button>
            <button className="text-action" onClick={() => onStart("login")}>
              I already have an account
            </button>
          </div>
        </div>
        <div className="hero-preview">
          <div className="preview-top">
            <div>
              <small>MONTHLY OVERVIEW</small>
              <h3>Your finances</h3>
            </div>
            <span className="preview-dot">•••</span>
          </div>
          <div className="preview-balance">
            <small>Net cash flow</small>
            <strong>₹24,850</strong>
            <span>Income minus expenses</span>
          </div>
          <div className="preview-bars">
            <div style={{ height: "46%" }} />
            <div style={{ height: "70%" }} />
            <div style={{ height: "55%" }} />
            <div style={{ height: "88%" }} />
            <div style={{ height: "63%" }} />
            <div style={{ height: "100%" }} />
            <div style={{ height: "73%" }} />
          </div>
          <div className="preview-bottom">
            <div>
              <span className="preview-icon">✦</span>
              <div>
                <b>Smarter insights</b>
                <small>Find ways to save</small>
              </div>
            </div>
            <div>
              <span className="preview-icon green">↗</span>
              <div>
                <b>Stay on track</b>
                <small>Budgets that make sense</small>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="landing-features">
        <div>
          <h2>Everything in one place.</h2>
        </div>
        <div className="landing-feature-grid">
          <article>
            <span>▧</span>
            <h3>Scan receipts</h3>
            <p>
              Capture receipt details with OCR, then review before adding them.
            </p>
          </article>
          <article>
            <span>✦</span>
            <h3>AI money coach</h3>
            <p>
              Get spending summaries and practical saving suggestions based on
              your activity.
            </p>
          </article>
          <article>
            <span>◎</span>
            <h3>Budget together</h3>
            <p>Organise shared goals and household budgets in one place.</p>
          </article>
        </div>
      </section>
     
    </main>
  );
}
export function AuthPage({
  logo,
  auth,
  setAuth,
  authMode,
  setAuthMode,
  busy,
  error,
  onSubmit,
  onBack,
  darkMode,
  toggleTheme,
}) {
  return (
    <main className="auth-wrap">
      <section className="auth-card">
        <div className="auth-card-top">
          <button className="back-link" onClick={onBack}>
            ← Home
          </button>
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={
              darkMode ? "Switch to light mode" : "Switch to dark mode"
            }
          >
            {darkMode ? "☀" : "☾"}
          </button>
        </div>
        <img className="auth-logo" src={logo} alt="AayGraph" />
        <h1>{authMode === "login" ? "Welcome back" : "Create your account"}</h1>
        <p className="muted">
          {authMode === "login"
            ? "Sign in to pick up where you left off."
            : "Create an account to make your money easier to understand."}
        </p>
        <form onSubmit={onSubmit} className="stack">
          {authMode === "register" && (
            <label>
              Full name
              <input
                required
                autoComplete="name"
                value={auth.name}
                onChange={(e) => setAuth({ ...auth, name: e.target.value })}
                placeholder="Your name"
              />
            </label>
          )}
          <label>
            Email address
            <input
              type="email"
              autoComplete="email"
              required
              value={auth.email}
              onChange={(e) => setAuth({ ...auth, email: e.target.value })}
              placeholder="you@example.com"
            />
          </label>
          <label>
            Password
            <input
              type="password"
              autoComplete={
                authMode === "login" ? "current-password" : "new-password"
              }
              minLength="8"
              required
              value={auth.password}
              onChange={(e) => setAuth({ ...auth, password: e.target.value })}
              placeholder="At least 8 characters"
            />
          </label>
          <button disabled={busy}>
            {busy
              ? "Please wait…"
              : authMode === "login"
                ? "Sign in securely"
                : "Create account"}
          </button>
        </form>
        <button
          className="link-btn"
          onClick={() =>
            setAuthMode(authMode === "login" ? "register" : "login")
          }
        >
          {authMode === "login"
            ? "New here? Create an account"
            : "Already registered? Sign in"}
        </button>
        {error && <p className="error">{error}</p>}
      </section>
    </main>
  );
}
