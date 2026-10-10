import React from "react";
import { TransactionTable } from "./OverviewPage.jsx";
export function TransactionsPage({
  items,
  form,
  setForm,
  editing,
  setEditing,
  saveExpense,
  editItem,
  deleteItem,
  categories,
  money,
}) {
  return (
    <>
      <section className="panel">
        <div className="panel-head">
          <div>
            <h2>{editing ? "Edit transaction" : "Add a transaction"}</h2>
            <p className="muted">
              Review the details before saving to your account.
            </p>
          </div>
          {editing && (
            <button
              className="ghost"
              onClick={() => {
                setEditing(null);
                setForm({
                  type: "expense",
                  amount: "",
                  description: "",
                  category: "Food",
                  date: new Date().toISOString().slice(0, 10),
                  merchant: "",
                  paymentMethod: "",
                });
              }}
            >
              Cancel edit
            </button>
          )}
        </div>
        <form onSubmit={saveExpense} className="expense-form">
          <label>
            Type
            <select
              value={form.type}
              onChange={(e) =>
                setForm({
                  ...form,
                  type: e.target.value,
                  category:
                    e.target.value === "income" ? "Salary" : form.category,
                })
              }
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </label>
          <label>
            Amount (₹)
            <input
              type="number"
              min="0.01"
              step="0.01"
              required
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
            />
          </label>
          <label>
            Description
            <input
              required
              maxLength="240"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="e.g. Weekly groceries"
            />
          </label>
          <label>
            Category
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label>
            Date
            <input
              type="date"
              required
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </label>
          <label>
            Merchant (optional)
            <input
              value={form.merchant}
              onChange={(e) => setForm({ ...form, merchant: e.target.value })}
            />
          </label>
          <label>
            Payment method (optional)
            <input
              value={form.paymentMethod}
              onChange={(e) =>
                setForm({ ...form, paymentMethod: e.target.value })
              }
            />
          </label>
          <div className="form-action">
            <button>
              {editing ? "Update transaction" : "Save transaction"}
            </button>
          </div>
        </form>
      </section>
      <section className="panel">
        <div className="panel-head">
          <div>
            <h2>All transactions</h2>
            <p className="muted">Your latest recorded activity</p>
          </div>
          <span className="pill">{items.length} total</span>
        </div>
        {items.length ? (
          <TransactionTable
            items={items}
            money={money}
            onEdit={editItem}
            onDelete={deleteItem}
          />
        ) : (
          <div className="empty">
            No transactions yet. Add your first one above.
          </div>
        )}
      </section>
    </>
  );
}
