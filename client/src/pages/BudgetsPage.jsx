import React, { useState } from "react";
export function BudgetsPage({ budget, setBudget, expense, money }) {
  const [name, setName] = useState("Household budget");
  const [member, setMember] = useState("");
  const [members, setMembers] = useState([]);
  const [inviteMessage, setInviteMessage] = useState("");
  const used =
    Number(budget) > 0 ? Math.min(100, (expense / Number(budget)) * 100) : 0;
  return (
    <>
      <section className="budget-hero">
        <div>
          <span className="hero-tag">PLAN IT TOGETHER</span>
          <h2>Shared goals start with a clear plan.</h2>
          <p>
            Set a spending limit and organise a shared budget workspace for the
            people you plan with.
          </p>
        </div>
        <span className="budget-hero-icon">◎</span>
      </section>
      <div className="content-grid">
        <section className="panel">
          <div className="panel-head">
            <div>
              <h2>Budget overview</h2>
              <p className="muted">This month's expense tracking</p>
            </div>
            <span className="pill">Monthly</span>
          </div>
          <label>
            Budget name
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label className="budget-label">
            Monthly limit (₹)
            <input
              type="number"
              min="0"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
            />
          </label>
          <div className="budget-total">
            <div>
              <small>Spent so far</small>
              <strong>{money(expense)}</strong>
            </div>
            <div>
              <small>Remaining</small>
              <strong>{money(Math.max(0, Number(budget) - expense))}</strong>
            </div>
          </div>
          <div className="budget-track big">
            <div style={{ width: `${used}%` }} />
          </div>
          <small className="muted">
            {Math.round(used)}% of this budget used
          </small>
        </section>
        <section className="panel">
          <div className="panel-head">
            <div>
              <h2>Budget members</h2>
              <p className="muted">A local planning list for this session</p>
            </div>
            <span className="pill">{members.length + 1} member(s)</span>
          </div>
          <div className="member-row">
            <span className="avatar">Y</span>
            <div>
              <b>You · Budget owner</b>
              <small>Can manage the budget</small>
            </div>
            <span className="member-status">Owner</span>
          </div>
          {members.map((m, i) => (
            <div className="member-row" key={`${m}-${i}`}>
              <span className="avatar">{m[0].toUpperCase()}</span>
              <div>
                <b>{m}</b>
                <small>Added to planning list</small>
              </div>
              <button
                className="table-action danger"
                onClick={() => setMembers((ms) => ms.filter((_, j) => j !== i))}
              >
                Remove
              </button>
            </div>
          ))}
          <form
            className="invite-form"
            onSubmit={(e) => {
              e.preventDefault();
              if (!member.trim()) return;
              setMembers((ms) => [...ms, member.trim()]);
              setInviteMessage(
                "Added to this local planning list. Server-side invitations are not configured.",
              );
              setMember("");
            }}
          >
            <label>
              Member name or email
              <input
                value={member}
                onChange={(e) => setMember(e.target.value)}
                placeholder="name@example.com"
                required
              />
            </label>
            <button>Add member</button>
          </form>
          {inviteMessage && <p className="muted">{inviteMessage}</p>}
          <p className="muted">
            Collaborative member management here is a UI prototype. Real
            cross-account sharing needs backend invitations, access controls and
            shared-budget APIs.
          </p>
        </section>
      </div>
    </>
  );
}
