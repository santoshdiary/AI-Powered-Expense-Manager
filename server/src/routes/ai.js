import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { Expense } from '../models.js';
import { askLLM } from '../services/llm.js';

const router = Router();
router.use(requireAuth);

const categories = ['Food', 'Groceries', 'Transportation', 'Housing', 'Utilities', 'Shopping', 'Health', 'Education', 'Entertainment', 'Subscriptions', 'Salary', 'Other'];

function dateBounds(monthOffset = 0) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  const end = new Date(now.getFullYear(), now.getMonth() + monthOffset + 1, 1);
  return { start, end };
}
function validDateOrToday(value) {
  const d = value ? new Date(value) : new Date();
  return Number.isNaN(d.getTime()) ? new Date() : d;
}

router.post('/parse-expense', async (req, res) => {
  const text = String(req.body.text || '').trim().slice(0, 1000);
  if (!text) return res.status(400).json({ message: 'Enter an expense description.' });
  try {
    const prompt = `Extract transaction data from the user's text. Return JSON only with keys: type ("expense" or "income"), amount (number or null), description (string), category (one of ${categories.join(', ')}), date (YYYY-MM-DD or null), merchant (string or empty). Do not invent an amount. If uncertain use null for amount. Today's date is ${new Date().toISOString().slice(0,10)}.`;
    const raw = await askLLM({ system: prompt, user: text, json: true });
    if (raw) {
      const parsed = JSON.parse(raw);
      const amount = Number(parsed.amount);
      if (!Number.isFinite(amount) || amount <= 0) return res.status(422).json({ message: 'Could not identify a valid amount. Please edit the draft manually.' });
      return res.json({
        draft: {
          type: parsed.type === 'income' ? 'income' : 'expense',
          amount, description: String(parsed.description || text).slice(0,240),
          category: categories.includes(parsed.category) ? parsed.category : 'Other',
          date: validDateOrToday(parsed.date).toISOString().slice(0,10),
          merchant: String(parsed.merchant || '').slice(0,120)
        }, mode: 'ai'
      });
    }
    // Safe fallback without AI provider: basic amount and keyword parsing.
    const match = text.match(/(?:₹|rs\.?\s*)?(\d+(?:,\d{3})*(?:\.\d{1,2})?)/i);
    if (!match) return res.status(422).json({ message: 'No AI key configured and no amount could be detected. Add AI_API_KEY or enter the amount manually.' });
    const lower = text.toLowerCase();
    const category = /petrol|fuel|bus|train|taxi|uber|ola/.test(lower) ? 'Transportation'
      : /lunch|dinner|breakfast|food|coffee|restaurant/.test(lower) ? 'Food'
      : /milk|rice|grocery|groceries/.test(lower) ? 'Groceries'
      : /netflix|subscription|spotify/.test(lower) ? 'Subscriptions' : 'Other';
    res.json({ draft: {
      type: /\b(earned|salary|received income)\b/.test(lower) ? 'income' : 'expense',
      amount: Number(match[1].replace(/,/g,'')), description: text.slice(0,240),
      category, date: new Date().toISOString().slice(0,10), merchant: ''
    }, mode: 'fallback' });
  } catch {
    res.status(502).json({ message: 'AI parsing failed. Please try again or enter the expense manually.' });
  }
});

router.get('/insights', async (req, res) => {
  try {
    const { start, end } = dateBounds(0);
    const rows = await Expense.aggregate([
      { $match: { userId: (await import('mongoose')).default.Types.ObjectId.createFromHexString(req.userId), date: { $gte: start, $lt: end } } },
      { $group: { _id: { category: '$category', type: '$type' }, total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } }
    ]);
    const summary = rows.map(r => ({ category: r._id.category, type: r._id.type, total: Math.round(r.total*100)/100, count: r.count }));
    let text = null;
    try {
      text = await askLLM({
        system: 'You are a cautious personal expense analysis assistant. Use only the provided data. Do not claim certainty about causes. Give 3 concise, practical observations. Do not give investment, tax, or credit advice.',
        user: JSON.stringify({ month: start.toISOString().slice(0,7), categoryTotals: summary })
      });
    } catch { /* numeric insights remain available */ }
    if (!text) {
      const top = summary.filter(x => x.type === 'expense').sort((a,b)=>b.total-a.total)[0];
      text = top ? `Your highest recorded expense category this month is ${top.category} at ₹${top.total.toFixed(2)} across ${top.count} transactions. Review your category totals to find possible savings.` : 'No expenses recorded this month yet. Add transactions to see insights.';
    }
    res.json({ month: start.toISOString().slice(0,7), categoryTotals: summary, insights: text });
  } catch {
    res.status(500).json({ message: 'Could not calculate insights.' });
  }
});

router.get('/analytics', async (req, res) => {
  try {
    const now = new Date();
    const { start, end } = dateBounds(0);
    const match = { userId: (await import('mongoose')).default.Types.ObjectId.createFromHexString(req.userId), type: 'expense' };
    const [current, history] = await Promise.all([
      Expense.aggregate([
        { $match: { ...match, date: { $gte: start, $lt: end } } },
        { $group: { _id: '$category', total: { $sum: '$amount' }, avg: { $avg: '$amount' }, count: { $sum: 1 } } }
      ]),
      Expense.find({ ...match, date: { $gte: new Date(now.getFullYear(), now.getMonth()-5, 1), $lt: end } }).select('amount category date').lean()
    ]);
    const anomalies = [];
    for (const item of history) {
      const peers = history.filter(x => x.category === item.category).map(x => x.amount);
      if (peers.length < 5) continue;
      const mean = peers.reduce((a,b)=>a+b,0)/peers.length;
      const variance = peers.reduce((a,b)=>a+(b-mean)**2,0)/peers.length;
      const sd = Math.sqrt(variance);
      if (sd > 0 && item.amount > mean + 2.5*sd) {
        anomalies.push({ amount: item.amount, category: item.category, date: item.date, message: `This ${item.category} transaction is unusually high compared with your recorded history.` });
      }
    }
    const spent = current.reduce((sum,x)=>sum+x.total,0);
    const day = Math.max(1, now.getDate());
    const daysInMonth = new Date(now.getFullYear(), now.getMonth()+1, 0).getDate();
    const projected = spent / day * daysInMonth;
    res.json({
      month: start.toISOString().slice(0,7),
      categoryTotals: current.map(x=>({category:x._id,total:Math.round(x.total*100)/100,count:x.count})),
      anomalyCandidates: anomalies.slice(0,20),
      forecast: { spentSoFar: Math.round(spent*100)/100, projectedMonthlySpend: Math.round(projected*100)/100, daysElapsed: day, daysInMonth, method: 'simple daily-average projection' }
    });
  } catch {
    res.status(500).json({ message: 'Could not calculate analytics.' });
  }
});

router.post('/assistant', async (req, res) => {
  const question = String(req.body.question || '').trim().slice(0,1000);
  if (!question) return res.status(400).json({ message: 'Ask a question about your expenses.' });
  try {
    const { start, end } = dateBounds(0);
    const current = await Expense.aggregate([
      { $match: { userId: (await import('mongoose')).default.Types.ObjectId.createFromHexString(req.userId), date: { $gte: start, $lt: end } } },
      { $group: { _id: { category: '$category', type: '$type' }, total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]);
    const data = { currentMonth: start.toISOString().slice(0,7), categoryTotals: current.map(x=>({category:x._id.category,type:x._id.type,total:Math.round(x.total*100)/100,count:x.count})) };
    const answer = await askLLM({
      system: 'You are an expense-manager assistant. Answer only from supplied aggregates. If the data does not answer the question, say so. Do not pretend to access data not supplied. Currency is INR. Keep answers concise.',
      user: JSON.stringify({ question, data })
    });
    if (answer) return res.json({ answer, mode: 'ai' });
    const expenseRows = data.categoryTotals.filter(x=>x.type==='expense').sort((a,b)=>b.total-a.total);
    return res.json({ answer: `AI API is not configured. For this month, recorded expenses total ₹${expenseRows.reduce((s,x)=>s+x.total,0).toFixed(2)}. ${expenseRows[0] ? `Top category: ${expenseRows[0].category} (₹${expenseRows[0].total.toFixed(2)}).` : 'No expenses found.'}`, mode: 'fallback' });
  } catch {
    res.status(502).json({ message: 'Assistant is temporarily unavailable.' });
  }
});

export default router;
