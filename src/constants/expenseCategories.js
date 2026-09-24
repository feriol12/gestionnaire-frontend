// src/constants/expenseCategories.js
// Single source for the expense category enum (MONEVA V2, Phase 5).
// Values, order and French labels must stay identical to the backend rule
// (ExpenseController::CATEGORIES: Nourriture, Transport, Factures, Loisirs,
// Imprévu, Beauté & soins). `icon`/`tone` are presentation only.
import { Utensils, Car, FileText, Gamepad2, Asterisk, Sparkles, Tag } from 'lucide-vue-next';

export const EXPENSE_CATEGORIES = [
  { value: 'Nourriture', label: 'Nourriture', icon: Utensils, tone: 'positive' },
  { value: 'Transport', label: 'Transport', icon: Car, tone: 'primary' },
  { value: 'Factures', label: 'Factures', icon: FileText, tone: 'primary' },
  { value: 'Loisirs', label: 'Loisirs', icon: Gamepad2, tone: 'primary' },
  { value: 'Imprévu', label: 'Imprévu', icon: Asterisk, tone: 'expense' },
  { value: 'Beauté & soins', label: 'Beauté & soins', icon: Sparkles, tone: 'beauty' }
];

export const DEFAULT_EXPENSE_CATEGORY = 'Nourriture';

// Fallback for a value outside the enum (should not happen with valid data).
const UNKNOWN_CATEGORY = { value: '', label: '', icon: Tag, tone: 'neutral' };

export const getExpenseCategory = (value) =>
  EXPENSE_CATEGORIES.find((category) => category.value === value) || UNKNOWN_CATEGORY;
