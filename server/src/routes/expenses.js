import { Router } from 'express';
import multer from 'multer';
import Tesseract from 'tesseract.js';
import { Expense } from '../models.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) return cb(new Error('Only JPG, PNG, or WEBP images are accepted.'));
    cb(null, true);
  }
});
router.use(requireAuth);

function validateExpense(body) {
  const amount = Number(body.amount);
  const description = String(body.description || '').trim();
  const category = String(body.category || '').trim();
  const date = new Date(body.date);
  if (!Number.isFinite(amount) || amount <= 0) return 'Amount must be a positive number.';
  if (!description || description.length > 240) return 'Description is required (max 240 characters).';
  if (!category || category.length > 60) return 'Category is required (max 60 characters).';
  if (Number.isNaN(date.getTime())) return 'A valid date is required.';
  if (!['expense', 'income'].includes(body.type || 'expense')) return 'Type must be expense or income.';
  return null;
}

router.get('/', async (req, res) => {
  const { from, to, category, type } = req.query;
  const filter = { userId: req.userId };
  if (from || to) {
    filter.date = {};
    if (from) filter.date.$gte = new Date(from);
    if (to) filter.date.$lte = new Date(to);
  }
  if (category) filter.category = String(category);
  if (type && ['expense', 'income'].includes(type)) filter.type = type;
  const items = await Expense.find(filter).sort({ date: -1 }).limit(500).lean();
  res.json(items);
});

router.post('/', async (req, res) => {
  const error = validateExpense(req.body);
  if (error) return res.status(400).json({ message: error });
  const item = await Expense.create({
    userId: req.userId, type: req.body.type || 'expense',
    amount: Number(req.body.amount), description: String(req.body.description).trim(),
    category: String(req.body.category).trim(), date: new Date(req.body.date),
    merchant: String(req.body.merchant || '').slice(0, 120),
    paymentMethod: String(req.body.paymentMethod || '').slice(0, 60),
    receiptText: String(req.body.receiptText || '').slice(0, 12000)
  });
  res.status(201).json(item);
});

router.put('/:id', async (req, res) => {
  const error = validateExpense(req.body);
  if (error) return res.status(400).json({ message: error });
  const item = await Expense.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    { $set: {
      type: req.body.type || 'expense', amount: Number(req.body.amount),
      description: String(req.body.description).trim(), category: String(req.body.category).trim(),
      date: new Date(req.body.date), merchant: String(req.body.merchant || '').slice(0, 120),
      paymentMethod: String(req.body.paymentMethod || '').slice(0, 60)
    } }, { new: true, runValidators: true }
  );
  if (!item) return res.status(404).json({ message: 'Expense not found.' });
  res.json(item);
});

router.delete('/:id', async (req, res) => {
  const item = await Expense.findOneAndDelete({ _id: req.params.id, userId: req.userId });
  if (!item) return res.status(404).json({ message: 'Expense not found.' });
  res.json({ ok: true });
});

// OCR scaffold: returns extracted text only. User must review and submit a transaction separately.
router.post('/receipt/ocr', upload.single('receipt'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Upload a receipt image.' });
  try {
    const result = await Tesseract.recognize(req.file.buffer, 'eng');
    const text = result.data.text.slice(0, 12000);
    const amountMatches = [...text.matchAll(/(?:total|grand total|amount due)\s*[:₹Rs.]*\s*([0-9,]+(?:\.[0-9]{1,2})?)/ig)];
    const last = amountMatches.at(-1)?.[1]?.replace(/,/g, '');
    res.json({ text, suggestedAmount: last ? Number(last) : null, note: 'Review OCR output and amount before saving.' });
  } catch {
    res.status(500).json({ message: 'Could not read this receipt. Try a clearer image.' });
  }
});

export default router;
