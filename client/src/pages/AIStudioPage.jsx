import React from "react";
export function AIStudioPage({
  natural,
  setNatural,
  parseNatural,
  draft,
  useDraft,
  question,
  setQuestion,
  askAssistant,
  answer,
  analytics,
  money,
  insights,
}) {
  return (
    <>
      <section className="ai-welcome">
        <div>
          <span className="hero-tag">✦ YOUR PERSONAL MONEY COACH</span>
          <h2>Clarity for your next money move.</h2>
          <p>
            Explore your habits, ask questions and turn everyday spending into
            practical next steps.
          </p>
        </div>
        <span className="ai-orb">✦</span>
      </section>
      <div className="tools-grid">
        <section className="tool-card">
          <div className="tool-icon">✎</div>
          <h3>Quick expense entry</h3>
          <p className="muted">
            Describe a transaction naturally and review the generated draft.
          </p>
          <form onSubmit={parseNatural}>
            <textarea
              rows="3"
              value={natural}
              onChange={(e) => setNatural(e.target.value)}
              placeholder="e.g. I spent ₹450 on petrol today"
              required
            />
            <button>Parse transaction</button>
          </form>
          {draft && (
            <div className="draft">
              <b>Review draft</b>
              <p>
                {draft.type} · {draft.description} · {money(draft.amount)} ·{" "}
                {draft.category}
              </p>
              <button onClick={useDraft}>Review in transaction form →</button>
            </div>
          )}
        </section>
        <section className="tool-card">
          <div className="tool-icon">✦</div>
          <h3>Ask your finance assistant</h3>
          <p className="muted">
            Ask about your recorded spending and savings opportunities.
          </p>
          <form onSubmit={askAssistant}>
            <textarea
              rows="3"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Which category did I spend the most on?"
              required
            />
            <button>Ask assistant</button>
          </form>
          {answer && <div className="answer">{answer}</div>}
        </section>
        <section className="tool-card">
          <div className="tool-icon">◈</div>
          <h3>Your spending insight</h3>
          <p className="muted">
            AI-generated summary based on your transactions.
          </p>
          <div className="insight-text">
            {insights?.insights ||
              "Add a few transactions to unlock personalised insights."}
          </div>
        </section>
        <section className="tool-card">
          <div className="tool-icon">◷</div>
          <h3>Spending forecast</h3>
          <p className="muted">
            A simple estimate using this month’s average daily spending.
          </p>
          <div className="forecast-number">
            {money(analytics?.forecast?.projectedMonthlySpend || 0)}
          </div>
          <small className="muted">
            Projected monthly spending · estimate only
          </small>
        </section>
      </div>
      <section className="anomaly-box">
        <h3>⚑ Unusual transaction candidates</h3>
        {analytics?.anomalyCandidates?.length ? (
          analytics.anomalyCandidates.slice(0, 5).map((a, i) => (
            <p key={i}>
              {a.message} <b>{money(a.amount)}</b> · {a.category} ·{" "}
              {new Date(a.date).toLocaleDateString()}
            </p>
          ))
        ) : (
          <p className="muted">
            No candidates found. More transaction history can improve this
            heuristic.
          </p>
        )}
      </section>
    </>
  );
}
