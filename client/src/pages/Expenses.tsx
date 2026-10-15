
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Wallet,
  Utensils,
  Hotel,
  Plane,
  Car,
  Plus,
  Trash2,
  Download,
  ShoppingBag,
  Ticket,
  MoreHorizontal,
  X,
  Search,
  TrendingUp,
  IndianRupee,
  CalendarDays,
} from "lucide-react";

type Category =
  | "Flights"
  | "Hotels"
  | "Food"
  | "Transport"
  | "Shopping"
  | "Activities"
  | "Other";

type Expense = {
  id: string;
  title: string;
  category: Category;
  amount: number;
  date: string;
  notes: string;
};

const STORAGE_KEY = "travel-genie-expenses";
const BUDGET_KEY = "travel-genie-expense-budget";

const categories: {
  name: Category;
  icon: typeof Plane;
}[] = [
  { name: "Flights", icon: Plane },
  { name: "Hotels", icon: Hotel },
  { name: "Food", icon: Utensils },
  { name: "Transport", icon: Car },
  { name: "Shopping", icon: ShoppingBag },
  { name: "Activities", icon: Ticket },
  { name: "Other", icon: MoreHorizontal },
];

const today = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

const formatMoney = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);

function loadExpenses(): Expense[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];

    const parsed: unknown = JSON.parse(saved);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (item): item is Expense =>
        item !== null &&
        typeof item === "object" &&
        typeof item.id === "string" &&
        typeof item.title === "string" &&
        typeof item.amount === "number" &&
        Number.isFinite(item.amount) &&
        item.amount >= 0 &&
        categories.some((category) => category.name === item.category) &&
        typeof item.date === "string"
    );
  } catch {
    return [];
  }
}

function loadBudget(): number {
  try {
    const saved = localStorage.getItem(BUDGET_KEY);
    if (saved === null) return 50000;

    const amount = Number(saved);
    return Number.isFinite(amount) && amount >= 0 ? amount : 50000;
  } catch {
    return 50000;
  }
}

export default function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budget, setBudget] = useState(50000);
  const [budgetInput, setBudgetInput] = useState("50000");
  const [loaded, setLoaded] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<Category>("Food");
  const [date, setDate] = useState(today());
  const [notes, setNotes] = useState("");

  useEffect(() => {
    setExpenses(loadExpenses());
    const savedBudget = loadBudget();
    setBudget(savedBudget);
    setBudgetInput(String(savedBudget));
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
      localStorage.setItem(BUDGET_KEY, String(budget));
    } catch {
      // Keep the current session usable if storage is unavailable.
    }
  }, [expenses, budget, loaded]);

  const totalSpent = useMemo(
    () => expenses.reduce((sum, expense) => sum + expense.amount, 0),
    [expenses]
  );

  const remaining = budget - totalSpent;
  const budgetProgress =
    budget > 0 ? Math.min((totalSpent / budget) * 100, 100) : totalSpent > 0 ? 100 : 0;

  const filteredExpenses = useMemo(() => {
    const query = search.trim().toLowerCase();

    return [...expenses]
      .filter((expense) => {
        const matchesSearch =
          !query ||
          expense.title.toLowerCase().includes(query) ||
          expense.category.toLowerCase().includes(query) ||
          expense.notes.toLowerCase().includes(query);

        const matchesCategory =
          filterCategory === "All" || expense.category === filterCategory;

        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [expenses, search, filterCategory]);

  const categoryTotals = useMemo(
    () =>
      categories.map((item) => ({
        ...item,
        total: expenses
          .filter((expense) => expense.category === item.name)
          .reduce((sum, expense) => sum + expense.amount, 0),
      })),
    [expenses]
  );

  const addExpense = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const numericAmount = Number(amount);
    if (
      !title.trim() ||
      !Number.isFinite(numericAmount) ||
      numericAmount <= 0 ||
      !date
    ) {
      return;
    }

    const expense: Expense = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title: title.trim(),
      category,
      amount: numericAmount,
      date,
      notes: notes.trim(),
    };

    setExpenses((previous) => [expense, ...previous]);
    setTitle("");
    setAmount("");
    setCategory("Food");
    setDate(today());
    setNotes("");
    setShowForm(false);
  };

  const deleteExpense = (id: string) => {
    setExpenses((previous) => previous.filter((expense) => expense.id !== id));
  };

  const saveBudget = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const numericBudget = Number(budgetInput);

    if (
      budgetInput.trim() === "" ||
      !Number.isFinite(numericBudget) ||
      numericBudget < 0
    ) {
      return;
    }

    setBudget(numericBudget);
  };

  const exportCSV = () => {
    const escapeCSV = (value: string | number) =>
      `"${String(value).replace(/"/g, '""')}"`;

    const rows = [
      ["Title", "Category", "Amount (INR)", "Date", "Notes"],
      ...filteredExpenses.map((expense) => [
        expense.title,
        expense.category,
        expense.amount,
        expense.date,
        expense.notes,
      ]),
    ];

    const csv = rows.map((row) => row.map(escapeCSV).join(",")).join("\r\n");
    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "travel-genie-expenses.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-pink-50">
      {/* Header */}
      <section className="mx-auto max-w-7xl px-5 pt-12 sm:px-8 sm:pt-16">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-pink-100 bg-pink-100 px-4 py-2 text-sm font-semibold text-pink-600">
            <Wallet size={17} />
            Your travel finances
          </div>

          <h1 className="mt-6 text-4xl font-black tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
            Travel <span className="text-[#E78FB3]">Expenses</span>
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-7 text-gray-600 sm:text-lg">
            Track your spending, stay within budget, and enjoy your journey
            without financial surprises.
          </p>
        </motion.div>
      </section>

      {/* Summary */}
      <section className="mx-auto max-w-7xl px-5 py-9 sm:px-8">
        <div className="grid gap-5 md:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[28px] bg-white p-6 shadow-lg shadow-pink-100/50 sm:p-7"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-pink-100 text-[#E78FB3]">
                <Wallet size={25} />
              </div>
              <TrendingUp size={21} className="text-pink-300" />
            </div>
            <p className="mt-6 text-sm font-medium text-gray-500">Total Spent</p>
            <h2 className="mt-2 break-words text-3xl font-black text-[#E78FB3] sm:text-4xl">
              {formatMoney(totalSpent)}
            </h2>
            <p className="mt-2 text-sm text-gray-400">
              {expenses.length} recorded{" "}
              {expenses.length === 1 ? "expense" : "expenses"}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="rounded-[28px] bg-white p-6 shadow-lg shadow-pink-100/50 sm:p-7"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-pink-100 text-[#E78FB3]">
              <IndianRupee size={25} />
            </div>
            <p className="mt-6 text-sm font-medium text-gray-500">Remaining Budget</p>
            <h2
              className={`mt-2 break-words text-3xl font-black sm:text-4xl ${
                remaining < 0 ? "text-red-500" : "text-gray-900"
              }`}
            >
              {formatMoney(remaining)}
            </h2>
            <p className="mt-2 text-sm text-gray-400">
              {remaining < 0 ? "You've exceeded your budget" : "Available to spend"}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16 }}
            className="rounded-[28px] bg-white p-6 shadow-lg shadow-pink-100/50 sm:p-7"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-pink-100 text-[#E78FB3]">
              <CalendarDays size={25} />
            </div>
            <p className="mt-6 text-sm font-medium text-gray-500">Trip Budget</p>
            <h2 className="mt-2 break-words text-3xl font-black text-gray-900 sm:text-4xl">
              {formatMoney(budget)}
            </h2>

            <form onSubmit={saveBudget} className="mt-4 flex gap-2">
              <input
                type="number"
                min="0"
                step="0.01"
                value={budgetInput}
                onChange={(event) => setBudgetInput(event.target.value)}
                aria-label="Trip budget in rupees"
                className="min-w-0 flex-1 rounded-xl border border-pink-100 px-3 py-2 text-sm outline-none focus:border-pink-300"
              />
              <button
                type="submit"
                className="rounded-xl bg-[#E78FB3] px-4 py-2 text-sm font-bold text-white transition hover:bg-pink-500"
              >
                Set
              </button>
            </form>
          </motion.div>
        </div>

        {/* Budget progress */}
        <div className="mt-6 rounded-[25px] border border-pink-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-gray-900">Budget overview</h3>
              <p className="mt-1 text-sm text-gray-500">
                {budget > 0
                  ? `${Math.round((totalSpent / budget) * 100)}% of your budget used`
                  : totalSpent > 0
                    ? "All spending exceeds your zero budget"
                    : "Set a budget to track your spending"}
              </p>
            </div>
            {totalSpent > budget && (
              <span className="rounded-full bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600">
                Over budget
              </span>
            )}
          </div>

          <div className="mt-4 h-3 overflow-hidden rounded-full bg-pink-100">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${budgetProgress}%` }}
              transition={{ duration: 0.5 }}
              className={`h-full rounded-full ${
                totalSpent > budget ? "bg-red-400" : "bg-[#E78FB3]"
              }`}
            />
          </div>
        </div>
      </section>

      {/* Category breakdown */}
      <section className="mx-auto max-w-7xl px-5 pb-8 sm:px-8">
        <div className="mb-6">
          <h2 className="text-2xl font-black text-gray-900 sm:text-3xl">
            Spending breakdown
          </h2>
          <p className="mt-2 text-gray-500">
            See where your travel money goes.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categoryTotals.map((item, index) => {
            const Icon = item.icon;
            const percentage =
              totalSpent > 0 ? (item.total / totalSpent) * 100 : 0;

            return (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className="rounded-[24px] border border-pink-100 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-pink-50 text-[#E78FB3]">
                    <Icon size={22} />
                  </div>
                  <span className="text-xs font-bold text-pink-500">
                    {Math.round(percentage)}%
                  </span>
                </div>
                <p className="mt-4 text-sm font-medium text-gray-500">
                  {item.name}
                </p>
                <p className="mt-1 break-words text-xl font-black text-gray-900">
                  {formatMoney(item.total)}
                </p>
                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-pink-100">
                  <div
                    className="h-full rounded-full bg-[#E78FB3] transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Expense actions */}
      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-black text-gray-900 sm:text-3xl">
              Expense history
            </h2>
            <p className="mt-2 text-gray-500">
              Add and manage your individual travel expenses.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={exportCSV}
              className="flex items-center justify-center gap-2 rounded-xl border border-pink-200 bg-white px-4 py-3 font-semibold text-pink-600 transition hover:bg-pink-50"
            >
              <Download size={18} />
              Export CSV
            </button>

            <button
              onClick={() => setShowForm((previous) => !previous)}
              className="flex items-center justify-center gap-2 rounded-xl bg-[#E78FB3] px-5 py-3 font-bold text-white transition hover:bg-pink-500"
            >
              {showForm ? <X size={18} /> : <Plus size={18} />}
              {showForm ? "Cancel" : "Add Expense"}
            </button>
          </div>
        </div>

        {showForm && (
          <motion.form
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={addExpense}
            className="mt-6 rounded-[28px] border border-pink-100 bg-white p-5 shadow-lg sm:p-7"
          >
            <h3 className="text-xl font-bold text-gray-900">
              Record a new expense
            </h3>

            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <input
                required
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Expense name (e.g. Dinner)"
                className="rounded-xl border border-pink-200 px-4 py-3 outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
              />

              <input
                required
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="Amount in ₹"
                className="rounded-xl border border-pink-200 px-4 py-3 outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
              />

              <select
                value={category}
                onChange={(event) =>
                  setCategory(event.target.value as Category)
                }
                className="rounded-xl border border-pink-200 bg-white px-4 py-3 outline-none focus:border-pink-400"
              >
                {categories.map((item) => (
                  <option key={item.name} value={item.name}>
                    {item.name}
                  </option>
                ))}
              </select>

              <input
                required
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="rounded-xl border border-pink-200 px-4 py-3 outline-none focus:border-pink-400"
              />

              <input
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Notes (optional)"
                className="rounded-xl border border-pink-200 px-4 py-3 outline-none focus:border-pink-400 sm:col-span-2"
              />
            </div>

            <button
              type="submit"
              className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-[#E78FB3] px-6 py-3 font-bold text-white transition hover:bg-pink-500"
            >
              <Plus size={18} />
              Save expense
            </button>
          </motion.form>
        )}

        {/* Search and filter */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-400"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search expenses..."
              className="w-full rounded-xl border border-pink-100 bg-white py-3 pl-11 pr-4 outline-none focus:border-pink-300"
            />
          </div>

          <select
            value={filterCategory}
            onChange={(event) => setFilterCategory(event.target.value)}
            className="rounded-xl border border-pink-100 bg-white px-4 py-3 outline-none focus:border-pink-300"
            aria-label="Filter by category"
          >
            <option value="All">All categories</option>
            {categories.map((item) => (
              <option key={item.name} value={item.name}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        {/* History list */}
        <div className="mt-5 space-y-3">
          {filteredExpenses.length > 0 ? (
            filteredExpenses.map((expense, index) => {
              const categoryInfo = categories.find(
                (item) => item.name === expense.category
              );
              const Icon = categoryInfo?.icon ?? MoreHorizontal;

              return (
                <motion.div
                  key={expense.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.025, 0.2) }}
                  className="flex items-center gap-3 rounded-[22px] border border-pink-100 bg-white p-4 shadow-sm sm:gap-4 sm:p-5"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-pink-50 text-[#E78FB3]">
                    <Icon size={23} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-bold text-gray-900">
                      {expense.title}
                    </h3>
                    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500 sm:text-sm">
                      <span>{expense.category}</span>
                      <span>•</span>
                      <span>{expense.date}</span>
                    </div>
                    {expense.notes && (
                      <p className="mt-1 break-words text-xs text-gray-400">
                        {expense.notes}
                      </p>
                    )}
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-base font-black text-gray-900 sm:text-lg">
                      {formatMoney(expense.amount)}
                    </p>
                    <button
                      onClick={() => deleteExpense(expense.id)}
                      aria-label={`Delete ${expense.title}`}
                      title="Delete expense"
                      className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-gray-400 transition hover:text-red-500"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="rounded-[28px] border border-dashed border-pink-200 bg-white px-5 py-14 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-pink-50 text-[#E78FB3]">
                <Wallet size={30} />
              </div>
              <h3 className="mt-5 text-xl font-bold text-gray-900">
                {expenses.length === 0
                  ? "No expenses recorded yet"
                  : "No matching expenses"}
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                {expenses.length === 0
                  ? "Add your first expense to start tracking your travel budget. Your totals will update automatically."
                  : "Try a different search or category filter."}
              </p>

              {expenses.length === 0 && (
                <button
                  onClick={() => setShowForm(true)}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#E78FB3] px-5 py-3 font-bold text-white hover:bg-pink-500"
                >
                  <Plus size={18} />
                  Add your first expense
                </button>
              )}
            </div>
          )}
        </div>

        <p className="mt-8 text-center text-sm text-gray-400">
          Your travel budget, all in one place ♡
        </p>
      </section>
    </main>
  );
}
