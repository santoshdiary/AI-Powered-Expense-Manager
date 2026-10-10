import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
const Stat = ({ title, value, note, icon }) => (
  <article className="stat-card">
    <div className="stat-top">
      <span>{title}</span>
      <span className="stat-icon">{icon}</span>
    </div>
    <strong>{value}</strong>
    <small>{note}</small>
  </article>
);
const Empty = ({ text }) => <div className="empty">{text}</div>;
export function OverviewPage({
  items,
  totals,
  analytics,
  insights,
  budget,
  money,
  onNavigate,
}) {
  const categories = analytics?.categoryTotals || [];
  return (
    <>
      <section className="stats-grid">
        <Stat
          title="Expenses this month"
          value={money(totals.expense)}
          note="Recorded expense transactions"
          icon="↘"
        />
        <Stat
          title="Income this month"
          value={money(totals.income)}
          note="Recorded income transactions"
          icon="↗"
        />
        <Stat
          title="Net cash flow"
          value={money(totals.balance)}
          note="Income minus expenses"
          icon="◈"
        />
        <Stat
          title="Projected spending"
          value={money(analytics?.forecast?.projectedMonthlySpend || 0)}
          note="Daily-average estimate"
          icon="◷"
        />
      </section>
      <section className="content-grid">
        <div className="panel">
          <div className="panel-head">
            <div>
              <h2>Spending by category</h2>
              <p className="muted">Current month · recorded expenses</p>
            </div>
            <span className="pill">Analytics</span>
          </div>
          {categories.length ? (
            <div className="chart">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categories}>
                  <XAxis dataKey="category" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => money(v)} />
                  <Bar dataKey="total" fill="#6255e7" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <Empty text="Add a few expenses to see your category chart." />
          )}
        </div>
        <div className="panel">
          <div className="panel-head">
            <div>
              <h2>Your AI money note</h2>
              <p className="muted">Based on your recorded transactions</p>
            </div>
            <span className="sparkle">✦</span>
          </div>
          <div className="insight-text">
            {insights?.insights ||
              "Add transactions to generate personalised insights."}
          </div>
          <div className="mini-metric">
            <span>Monthly budget</span>
            <strong>{money(Number(budget) || 0)}</strong>
          </div>
          <div className="budget-track">
            <div
              style={{
                width: `${Math.min(100, Number(budget) > 0 ? (totals.expense / Number(budget)) * 100 : 0)}%`,
              }}
            />
          </div>
          <small className="muted">
            {Number(budget) > 0
              ? `${Math.round((totals.expense / Number(budget)) * 100)}% of budget used`
              : "Set a budget in Shared budgets"}
          </small>
          <button className="text-link" onClick={() => onNavigate("budgets")}>
            Manage budget →
          </button>
        </div>
      </section>
      <section className="panel">
        <div className="panel-head">
          <div>
            <h2>Recent transactions</h2>
            <p className="muted">Your latest recorded activity</p>
          </div>
          <button className="ghost" onClick={() => onNavigate("transactions")}>
            View all →
          </button>
        </div>
        <TransactionTable items={items.slice(0, 5)} money={money} />
        {!items.length && (
          <Empty text="Your first transaction will show up here." />
        )}
      </section>
      <section className="quick-actions">
        <div>
          <small>MAKE IT A HABIT</small>
          <h2>What would you like to do?</h2>
        </div>
        <button onClick={() => onNavigate("transactions")}>
          ＋ Add transaction
        </button>
        <button className="ghost" onClick={() => onNavigate("receipts")}>
          ▧ Scan a receipt
        </button>
        <button className="ghost" onClick={() => onNavigate("ai-studio")}>
          ✦ Ask AI Studio
        </button>
      </section>
    </>
  );
}
export function TransactionTable({ items, money, onEdit, onDelete }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Transaction</th>
            <th>Category</th>
            <th>Date</th>
            <th>Type</th>
            <th className="right">Amount</th>
            {(onEdit || onDelete) && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {items.map((x) => (
            <tr key={x._id}>
              <td>
                <b>{x.description}</b>
                <small>{x.merchant || "—"}</small>
              </td>
              <td>
                <span className="category-chip">{x.category}</span>
              </td>
              <td>{new Date(x.date).toLocaleDateString()}</td>
              <td>
                <span className={x.type === "income" ? "income" : "expense"}>
                  {x.type}
                </span>
              </td>
              <td className={`right ${x.type === "income" ? "positive" : ""}`}>
                {x.type === "income" ? "+" : "−"}
                {money(x.amount)}
              </td>
              {(onEdit || onDelete) && (
                <td>
                  <button className="table-action" onClick={() => onEdit?.(x)}>
                    Edit
                  </button>
                  <button
                    className="table-action danger"
                    onClick={() => onDelete?.(x._id)}
                  >
                    Delete
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
