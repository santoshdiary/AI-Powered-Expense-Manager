import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api, getToken } from "./api.js";
import logo from "./asset/logo.png";
import { AppShell } from "./components/AppShell.jsx";
import { LandingPage, AuthPage } from "./components/AuthPages.jsx";
import { OverviewPage } from "./pages/OverviewPage.jsx";
import { TransactionsPage } from "./pages/TransactionsPage.jsx";
import { ReceiptScannerPage } from "./pages/ReceiptScannerPage.jsx";
import { AIStudioPage } from "./pages/AIStudioPage.jsx";
import { BudgetsPage } from "./pages/BudgetsPage.jsx";

const categories = [
  "Food",
  "Groceries",
  "Transportation",
  "Housing",
  "Utilities",
  "Shopping",
  "Health",
  "Education",
  "Entertainment",
  "Subscriptions",
  "Salary",
  "Other",
];
const today = () => new Date().toISOString().slice(0, 10);
const blank = () => ({
  type: "expense",
  amount: "",
  description: "",
  category: "Food",
  date: today(),
  merchant: "",
  paymentMethod: "",
});
const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
const validRoutes = [
  "overview",
  "transactions",
  "receipts",
  "ai-studio",
  "budgets",
];

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [token, setToken] = useState(getToken());
  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("expense_user") || "null"),
  );
  const route = (() => {
    const path = location.pathname.replace(/^\/+/, "") || "";
    return path || (getToken() ? "overview" : "landing");
  })();
  const [authMode, setAuthMode] = useState("login");
  const [auth, setAuth] = useState({ name: "", email: "", password: "" });
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("expense_theme") === "dark",
  );
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [natural, setNatural] = useState("");
  const [draft, setDraft] = useState(null);
  const [insights, setInsights] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [receiptText, setReceiptText] = useState("");
  const [budget, setBudget] = useState(
    localStorage.getItem("expense_budget") || "20000",
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("expense_theme", darkMode ? "dark" : "light");
  }, [darkMode]);
  const goToRoute = useCallback(
    (next) => {
      const path = next ? `/${next}` : "/";
      navigate(path);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [navigate],
  );

  useEffect(() => {
    if (token && !validRoutes.includes(route) && route !== "landing" && route !== "login" && route !== "register") {
      goToRoute("overview");
    }
    if (!token && validRoutes.includes(route)) {
      goToRoute("landing");
    }
  }, [token, route, goToRoute]);

  const refresh = useCallback(async () => {
    const results = await Promise.allSettled([
      api("/expenses"),
      api("/ai/insights"),
      api("/ai/analytics"),
    ]);
    if (results[0].status === "fulfilled")
      setItems(
        Array.isArray(results[0].value)
          ? results[0].value
          : results[0].value.expenses || [],
      );
    if (results[1].status === "fulfilled") setInsights(results[1].value);
    if (results[2].status === "fulfilled") setAnalytics(results[2].value);
    const failed = results.find((r) => r.status === "rejected");
    if (failed) throw failed.reason;
  }, []);
  useEffect(() => {
    if (token) refresh().catch((e) => setError(e.message));
  }, [token, refresh]);

  async function submitAuth(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const endpoint = authMode === "login" ? "/auth/login" : "/auth/register";
      const result = await api(endpoint, {
        method: "POST",
        body: JSON.stringify(auth),
      });
      localStorage.setItem("expense_token", result.token);
      localStorage.setItem("expense_user", JSON.stringify(result.user));
      setToken(result.token);
      setUser(result.user);
      setAuth({ name: "", email: "", password: "" });
      setNotice(
        authMode === "register"
          ? "Welcome! Let’s set up your money workspace."
          : "Welcome back!",
      );
      goToRoute("overview");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  function logout() {
    localStorage.removeItem("expense_token");
    localStorage.removeItem("expense_user");
    setToken(null);
    setUser(null);
    setItems([]);
    goToRoute("landing");
  }
  async function saveExpense(e) {
    e?.preventDefault();
    setError("");
    setNotice("");
    try {
      const payload = {
        ...form,
        amount: Number(form.amount),
        date: new Date(`${form.date}T12:00:00`).toISOString(),
      };
      await api(editing ? `/expenses/${editing}` : "/expenses", {
        method: editing ? "PUT" : "POST",
        body: JSON.stringify(payload),
      });
      setForm(blank());
      setEditing(null);
      setDraft(null);
      setNotice("Transaction saved successfully.");
      await refresh();
    } catch (e) {
      setError(e.message);
    }
  }
  function editItem(x) {
    setEditing(x._id);
    setForm({
      type: x.type,
      amount: String(x.amount),
      description: x.description || "",
      category: x.category || "Other",
      date: new Date(x.date).toISOString().slice(0, 10),
      merchant: x.merchant || "",
      paymentMethod: x.paymentMethod || "",
    });
    goToRoute("transactions");
  }
  async function deleteItem(id) {
    if (!window.confirm("Delete this transaction?")) return;
    try {
      await api(`/expenses/${id}`, { method: "DELETE" });
      setNotice("Transaction deleted.");
      await refresh();
    } catch (e) {
      setError(e.message);
    }
  }
  async function parseNatural(e) {
    e.preventDefault();
    setError("");
    setDraft(null);
    try {
      const r = await api("/ai/parse-expense", {
        method: "POST",
        body: JSON.stringify({ text: natural }),
      });
      setDraft(r.draft);
      setNotice("Draft created. Review it before saving.");
    } catch (e) {
      setError(e.message);
    }
  }
  function useDraft() {
    setForm({
      ...blank(),
      ...draft,
      amount: String(draft.amount),
      date: draft.date ? String(draft.date).slice(0, 10) : today(),
    });
    setDraft(null);
    goToRoute("transactions");
  }
  async function scanReceipt(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("Please choose an image smaller than 5 MB.");
      e.target.value = "";
      return;
    }
    const fd = new FormData();
    fd.append("receipt", file);
    setBusy(true);
    setError("");
    try {
      const r = await api("/expenses/receipt/ocr", {
        method: "POST",
        body: fd,
      });
      setReceiptText(r.text || "");
      if (r.suggestedAmount)
        setForm((f) => ({
          ...f,
          amount: String(r.suggestedAmount),
          receiptText: r.text,
        }));
      setNotice("Receipt scan finished. Please review the extracted details.");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  }
  async function askAssistant(e) {
    e.preventDefault();
    setError("");
    try {
      const r = await api("/ai/assistant", {
        method: "POST",
        body: JSON.stringify({ question }),
      });
      setAnswer(r.answer || "No answer was returned.");
    } catch (e) {
      setError(e.message);
    }
  }
  const totals = useMemo(() => {
    const now = new Date();
    const month = items.filter((x) => {
      const d = new Date(x.date);
      return (
        d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      );
    });
    const income = month
      .filter((x) => x.type === "income")
      .reduce((s, x) => s + (Number(x.amount) || 0), 0);
    const expense = month
      .filter((x) => x.type === "expense")
      .reduce((s, x) => s + (Number(x.amount) || 0), 0);
    return { income, expense, balance: income - expense };
  }, [items]);
  const titles = {
    overview: ["Overview", "Here’s your financial snapshot for this month."],
    transactions: [
      "Transactions",
      "Record, review and manage your money activity.",
    ],
    receipts: [
      "Receipt scanner",
      "Turn paper receipts into transaction drafts.",
    ],
    "ai-studio": [
      "AI Studio",
      "Understand your habits and discover your next money move.",
    ],
    budgets: [
      "Shared budgets",
      "Plan spending limits and organise shared goals.",
    ],
  };
  if (!token) {
    if (route === "login" || route === "register")
      return (
        <AuthPage
          logo={logo}
          auth={auth}
          setAuth={setAuth}
          authMode={route === "register" ? "register" : "login"}
          setAuthMode={(mode) => {
            setAuthMode(mode);
            goToRoute(mode);
          }}
          busy={busy}
          error={error}
          onSubmit={submitAuth}
          onBack={() => goToRoute("landing")}
          darkMode={darkMode}
          toggleTheme={() => setDarkMode((v) => !v)}
        />
      );
    return (
      <LandingPage
        logo={logo}
        onStart={(mode) => {
          setAuthMode(mode);
          goToRoute(mode);
        }}
        darkMode={darkMode}
        toggleTheme={() => setDarkMode((v) => !v)}
      />
    );
  }
  let page;
  if (route === "transactions")
    page = (
      <TransactionsPage
        items={items}
        form={form}
        setForm={setForm}
        editing={editing}
        setEditing={setEditing}
        saveExpense={saveExpense}
        editItem={editItem}
        deleteItem={deleteItem}
        categories={categories}
        money={money}
      />
    );
  else if (route === "receipts")
    page = (
      <ReceiptScannerPage
        busy={busy}
        scanReceipt={scanReceipt}
        receiptText={receiptText}
        setReceiptText={setReceiptText}
        onGoTransactions={() => {
          setForm((f) => ({
            ...f,
            description: f.description || "Receipt purchase",
          }));
          goToRoute("transactions");
        }}
      />
    );
  else if (route === "ai-studio")
    page = (
      <AIStudioPage
        natural={natural}
        setNatural={setNatural}
        parseNatural={parseNatural}
        draft={draft}
        useDraft={useDraft}
        question={question}
        setQuestion={setQuestion}
        askAssistant={askAssistant}
        answer={answer}
        analytics={analytics}
        money={money}
        insights={insights}
      />
    );
  else if (route === "budgets")
    page = (
      <BudgetsPage
        budget={budget}
        setBudget={(v) => {
          setBudget(v);
          localStorage.setItem("expense_budget", v);
        }}
        expense={totals.expense}
        money={money}
      />
    );
  else
    page = (
      <OverviewPage
        items={items}
        totals={totals}
        analytics={analytics}
        insights={insights}
        budget={budget}
        money={money}
        onNavigate={goToRoute}
      />
    );
  return (
    <AppShell
      logo={logo}
      user={user}
      route={route}
      onLogout={logout}
      title={titles[route] || titles.overview}
      error={error}
      notice={notice}
      clearError={() => setError("")}
      clearNotice={() => setNotice("")}
      onRefresh={() => refresh().catch((e) => setError(e.message))}
      darkMode={darkMode}
      toggleTheme={() => setDarkMode((v) => !v)}
      onNavigate={goToRoute}
    >
      {page}
    </AppShell>
  );
}
