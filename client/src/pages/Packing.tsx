
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Shirt,
  Smartphone,
  FileText,
  HeartPulse,
  Download,
  CheckCircle2,
  Circle,
  Plus,
  RotateCcw,
  Luggage,
  Sparkles,
  Trash2,
  Check,
} from "lucide-react";

type PackingItem = {
  id: string;
  name: string;
  packed: boolean;
};

type PackingCategory = {
  id: string;
  title: string;
  icon: typeof Shirt;
  items: string[];
};

const STORAGE_KEY = "travel-genie-packing-checklist";

const categories: PackingCategory[] = [
  {
    id: "clothing",
    title: "Clothing",
    icon: Shirt,
    items: [
      "T-Shirts",
      "Jeans / Trousers",
      "Jacket",
      "Shoes",
      "Socks",
      "Sleepwear",
      "Underwear",
      "Comfortable outfit",
    ],
  },
  {
    id: "electronics",
    title: "Electronics",
    icon: Smartphone,
    items: [
      "Phone",
      "Laptop",
      "Power Bank",
      "Charger",
      "Headphones",
      "Camera",
      "Travel adapter",
    ],
  },
  {
    id: "documents",
    title: "Documents",
    icon: FileText,
    items: [
      "Passport",
      "Visa (if required)",
      "Tickets",
      "Hotel Booking",
      "ID Proof",
      "Travel Insurance",
      "Emergency Contacts",
    ],
  },
  {
    id: "health",
    title: "Health & Care",
    icon: HeartPulse,
    items: [
      "Personal Medicines",
      "First Aid Kit",
      "Sanitizer",
      "Face Masks",
      "Sunscreen",
      "Toiletries",
      "Toothbrush & Toothpaste",
    ],
  },
];

function createInitialItems(): Record<string, PackingItem[]> {
  return Object.fromEntries(
    categories.map((category) => [
      category.id,
      category.items.map((name, index) => ({
        id: `${category.id}-${index}`,
        name,
        packed: false,
      })),
    ])
  );
}

function loadItems(): Record<string, PackingItem[]> {
  const initial = createInitialItems();

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return initial;

    const parsed = JSON.parse(saved) as Record<string, PackingItem[]>;

    return Object.fromEntries(
      categories.map((category) => {
        const savedItems = Array.isArray(parsed[category.id])
          ? parsed[category.id]
          : [];

        const merged = category.items.map((name, index) => {
          const id = `${category.id}-${index}`;
          const existing = savedItems.find((item) => item.id === id);

          return {
            id,
            name,
            packed: existing?.packed === true,
          };
        });

        const customItems = savedItems.filter(
          (item) =>
            item.id.startsWith(`${category.id}-custom-`) &&
            typeof item.name === "string"
        );

        return [category.id, [...merged, ...customItems]];
      })
    );
  } catch {
    return initial;
  }
}

export default function Packing() {
  const [items, setItems] =
    useState<Record<string, PackingItem[]>>(createInitialItems);

  const [customItem, setCustomItem] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("clothing");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setItems(loadItems());
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, isLoaded]);

  const allItems = useMemo(() => Object.values(items).flat(), [items]);

  const totalItems = allItems.length;
  const packedItems = allItems.filter((item) => item.packed).length;
  const progress =
    totalItems === 0 ? 0 : Math.round((packedItems / totalItems) * 100);

  const toggleItem = (categoryId: string, itemId: string) => {
    setItems((previous) => ({
      ...previous,
      [categoryId]: previous[categoryId].map((item) =>
        item.id === itemId ? { ...item, packed: !item.packed } : item
      ),
    }));
  };

  const addCustomItem = () => {
    const name = customItem.trim();
    if (!name) return;

    setItems((previous) => {
      const categoryItems = previous[selectedCategory] || [];

      if (
        categoryItems.some(
          (item) => item.name.toLowerCase() === name.toLowerCase()
        )
      ) {
        return previous;
      }

      return {
        ...previous,
        [selectedCategory]: [
          ...categoryItems,
          {
            id: `${selectedCategory}-custom-${Date.now()}-${Math.random()
              .toString(36)
              .slice(2, 7)}`,
            name,
            packed: false,
          },
        ],
      };
    });

    setCustomItem("");
  };

  const removeCustomItem = (categoryId: string, itemId: string) => {
    setItems((previous) => ({
      ...previous,
      [categoryId]: previous[categoryId].filter(
        (item) => item.id !== itemId
      ),
    }));
  };

  const resetChecklist = () => {
    const confirmed = window.confirm(
      "Reset your checklist? All packed items will be unchecked and custom items removed."
    );

    if (confirmed) {
      setItems(createInitialItems());
    }
  };

  const downloadChecklist = () => {
    const lines = [
      "TRAVEL GENIE AI — PACKING CHECKLIST",
      "===================================",
      "",
      `Packing progress: ${packedItems}/${totalItems} items (${progress}%)`,
      "",
      ...categories.flatMap((category) => [
        category.title.toUpperCase(),
        ...((items[category.id] || []).map(
          (item) => `${item.packed ? "[x]" : "[ ]"} ${item.name}`
        )),
        "",
      ]),
    ];

    const blob = new Blob([lines.join("\n")], {
      type: "text/plain;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "travel-genie-packing-checklist.txt";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-pink-50">
      {/* Hero */}
      <section className="mx-auto max-w-7xl px-5 pb-8 pt-12 sm:px-8 sm:pt-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-pink-200 bg-white px-4 py-2 text-sm font-semibold text-pink-600 shadow-sm">
            <Sparkles size={16} />
            Your trip, perfectly packed
          </div>

          <h1 className="text-4xl font-black tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
            Smart{" "}
            <span className="text-[#E78FB3]">Packing Checklist</span>
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-gray-600 sm:text-lg">
            Pack smarter, travel lighter, and leave the last-minute panic
            behind. Check off essentials as you pack.
          </p>
        </motion.div>
      </section>

      {/* Progress card */}
      <section className="mx-auto max-w-7xl px-5 py-5 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-[28px] border border-pink-100 bg-white p-6 shadow-lg shadow-pink-100/50 sm:p-8"
        >
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-pink-100 text-[#E78FB3]">
                {progress === 100 ? (
                  <Check size={28} />
                ) : (
                  <Luggage size={28} />
                )}
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {progress === 100 ? "You're all packed!" : "Your packing progress"}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  {packedItems} of {totalItems} items packed
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-4xl font-black text-[#E78FB3]">
                {progress}%
              </div>

              <button
                onClick={resetChecklist}
                className="flex items-center gap-2 rounded-xl border border-pink-200 px-4 py-3 text-sm font-semibold text-gray-600 transition hover:bg-pink-50 hover:text-pink-600"
              >
                <RotateCcw size={16} />
                Reset
              </button>
            </div>
          </div>

          <div
            className="mt-6 h-3 overflow-hidden rounded-full bg-pink-100"
            role="progressbar"
            aria-label="Packing progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
          >
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-[#E78FB3] to-pink-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            {categories.map((category) => {
              const categoryItems = items[category.id] || [];
              const packed = categoryItems.filter(
                (item) => item.packed
              ).length;

              return (
                <div
                  key={category.id}
                  className="rounded-xl bg-pink-50 px-4 py-2 text-sm text-gray-600"
                >
                  <span className="font-bold text-pink-600">{packed}</span>
                  {" / "}
                  {categoryItems.length} {category.title}
                </div>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* Add item and download */}
      <section className="mx-auto max-w-7xl px-5 py-6 sm:px-8">
        <div className="flex flex-col gap-4 rounded-[26px] border border-pink-100 bg-white p-5 shadow-sm sm:p-6 lg:flex-row lg:items-center">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row">
            <select
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
              className="rounded-xl border border-pink-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
              aria-label="Choose category for custom item"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.title}
                </option>
              ))}
            </select>

            <input
              value={customItem}
              onChange={(event) => setCustomItem(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") addCustomItem();
              }}
              placeholder="Add your own packing item..."
              className="min-w-0 flex-1 rounded-xl border border-pink-200 px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
            />

            <button
              onClick={addCustomItem}
              disabled={!customItem.trim()}
              className="flex items-center justify-center gap-2 rounded-xl bg-[#E78FB3] px-5 py-3 font-bold text-white transition hover:bg-pink-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus size={18} />
              Add item
            </button>
          </div>

          <button
            onClick={downloadChecklist}
            className="flex items-center justify-center gap-2 rounded-xl border border-pink-200 px-5 py-3 font-bold text-pink-600 transition hover:bg-pink-50"
          >
            <Download size={19} />
            Download checklist
          </button>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-5 pb-20 pt-4 sm:px-8">
        <div className="mb-7">
          <h2 className="text-2xl font-black text-gray-900 sm:text-3xl">
            Your travel essentials
          </h2>
          <p className="mt-2 text-gray-500">
            Tick items as you pack. Your progress is saved automatically on
            this device.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {categories.map((category, index) => {
            const Icon = category.icon;
            const categoryItems = items[category.id] || [];
            const packed = categoryItems.filter(
              (item) => item.packed
            ).length;
            const complete =
              categoryItems.length > 0 && packed === categoryItems.length;

            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08, duration: 0.4 }}
                className="rounded-[28px] border border-pink-100 bg-white p-5 shadow-lg shadow-pink-100/40 sm:p-7"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-pink-50">
                      <Icon className="text-[#E78FB3]" size={28} />
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-gray-900 sm:text-2xl">
                        {category.title}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {packed} of {categoryItems.length} packed
                      </p>
                    </div>
                  </div>

                  {complete && (
                    <span className="flex shrink-0 items-center gap-1 rounded-full bg-green-50 px-3 py-2 text-xs font-bold text-green-700">
                      <CheckCircle2 size={15} />
                      Complete
                    </span>
                  )}
                </div>

                <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-pink-50">
                  <div
                    className="h-full rounded-full bg-[#E78FB3] transition-all duration-300"
                    style={{
                      width: `${
                        categoryItems.length
                          ? (packed / categoryItems.length) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>

                <div className="mt-5 space-y-2">
                  {categoryItems.map((item) => (
                    <div
                      key={item.id}
                      className={`group flex items-center gap-3 rounded-2xl border p-3 transition sm:p-4 ${
                        item.packed
                          ? "border-pink-100 bg-pink-50/70"
                          : "border-gray-100 bg-white hover:border-pink-200 hover:bg-pink-50/30"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => toggleItem(category.id, item.id)}
                        aria-pressed={item.packed}
                        aria-label={`${item.packed ? "Unpack" : "Mark packed"} ${item.name}`}
                        className="shrink-0 rounded-full text-[#E78FB3] transition hover:scale-110"
                      >
                        {item.packed ? (
                          <CheckCircle2 size={22} />
                        ) : (
                          <Circle size={22} className="text-pink-300" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleItem(category.id, item.id)}
                        className={`flex-1 text-left text-sm font-medium transition sm:text-base ${
                          item.packed
                            ? "text-gray-400 line-through"
                            : "text-gray-700"
                        }`}
                      >
                        {item.name}
                      </button>

                      {item.id.includes("-custom-") && (
                        <button
                          type="button"
                          onClick={() =>
                            removeCustomItem(category.id, item.id)
                          }
                          aria-label={`Remove ${item.name}`}
                          className="rounded-lg p-2 text-gray-400 opacity-100 transition hover:bg-red-50 hover:text-red-500 sm:opacity-0 sm:group-hover:opacity-100"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        <p className="mt-8 text-center text-sm text-gray-400">
          Made for smoother journeys with Travel Genie AI ♡
        </p>
      </section>
    </main>
  );
}