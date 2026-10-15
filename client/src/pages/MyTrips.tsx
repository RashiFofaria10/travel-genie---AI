import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MapPin,
  CalendarDays,
  Wallet,
  Plus,
  Pencil,
  Trash2,
  X,
  Plane,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

const API_URL = "http://localhost:5000/api/trips";

type Trip = {
  _id: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  notes?: string;
  imageUrl?: string;
};

type TripForm = {
  destination: string;
  startDate: string;
  endDate: string;
  budget: string;
  notes: string;
  imageUrl: string;
};

const emptyForm: TripForm = {
  destination: "",
  startDate: "",
  endDate: "",
  budget: "",
  notes: "",
  imageUrl: "",
};

const formatDate = (date: string) => {
  if (!date) return "Not set";

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;

  return parsed.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);

export default function MyTrips() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<TripForm>(emptyForm);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const fetchTrips = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(API_URL);
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Unable to load your trips.");
      }

      const fetchedTrips = Array.isArray(data)
        ? data
        : Array.isArray(data.trips)
          ? data.trips
          : [];

      setTrips(fetchedTrips);
    } catch (err) {
      setError(
        err instanceof Error
          ? `${err.message} Make sure your backend is running on port 5000.`
          : "Unable to connect to the server."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchTrips();
  }, [fetchTrips]);

  // Prefill destination when navigating from Wishlist or Explore.
useEffect(() => {
  const destination =
    searchParams.get("destination") ||
    searchParams.get("place") ||
    searchParams.get("city");

  if (!destination?.trim()) return;

  setEditingId(null);
  setForm({
    ...emptyForm,
    destination: destination.trim(),
  });
  setError("");
  setSuccessMessage("");
  setShowForm(true);

  setSearchParams(
    (current) => {
      const updated = new URLSearchParams(current);
      updated.delete("destination");
      updated.delete("place");
      updated.delete("city");
      return updated;
    },
    { replace: true }
  );
}, [searchParams, setSearchParams]);
  const updateField = (
    field: keyof TripForm,
    value: string
  ) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const openCreateForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setSuccessMessage("");
    setShowForm(true);
  };

  const openEditForm = (trip: Trip) => {
    setEditingId(trip._id);
    setForm({
      destination: trip.destination || "",
      startDate: trip.startDate
        ? trip.startDate.slice(0, 10)
        : "",
      endDate: trip.endDate ? trip.endDate.slice(0, 10) : "",
      budget: String(trip.budget ?? ""),
      notes: trip.notes || "",
      imageUrl: trip.imageUrl || "",
    });
    setError("");
    setSuccessMessage("");
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setError("");
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!form.destination.trim()) {
      setError("Please enter a destination.");
      return;
    }

    if (!form.startDate || !form.endDate) {
      setError("Please select both travel dates.");
      return;
    }

    if (new Date(form.endDate) < new Date(form.startDate)) {
      setError("The return date cannot be before the start date.");
      return;
    }

    const budget = Number(form.budget);

    if (form.budget.trim() === "" || !Number.isFinite(budget) || budget < 0) {
      setError("Please enter a valid budget.");
      return;
    }

    const payload = {
      destination: form.destination.trim(),
      startDate: form.startDate,
      endDate: form.endDate,
      budget,
      notes: form.notes.trim(),
      imageUrl: form.imageUrl.trim(),
    };

    setSaving(true);

    try {
      const response = await fetch(
        editingId ? `${API_URL}/${editingId}` : API_URL,
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message ||
            `Unable to ${editingId ? "update" : "create"} the trip.`
        );
      }

      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      setSuccessMessage(
        editingId
          ? "Your trip has been updated successfully!"
          : "Your trip has been created successfully!"
      );

      await fetchTrips();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while saving your trip."
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteTrip = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this trip?"
    );

    if (!confirmed) return;

    setError("");
    setSuccessMessage("");

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Unable to delete this trip.");
      }

      setTrips((current) => current.filter((trip) => trip._id !== id));
      setSuccessMessage("Trip deleted successfully.");

      if (editingId === id) closeForm();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while deleting the trip."
      );
    }
  };

  const totalBudget = trips.reduce(
    (total, trip) => total + (Number(trip.budget) || 0),
    0
  );

  const upcomingTrips = trips.filter(
    (trip) =>
      trip.startDate &&
      new Date(trip.startDate).setHours(23, 59, 59, 999) >= Date.now()
  );

  return (
    <div className="min-h-screen bg-[#fff8fb] px-4 py-8 text-[#3d2634] sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center"
        >
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-[#d66d99]">
              Your travel journal
            </p>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              My Trips <span className="text-[#e78fb3]">✈</span>
            </h1>
            <p className="mt-2 text-sm text-[#8b7180] sm:text-base">
              Plan your next escape and keep all your adventures in one place.
            </p>
          </div>

          <button
            onClick={openCreateForm}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#e78fb3] px-5 py-3 font-semibold text-white shadow-lg shadow-pink-200/60 transition hover:bg-[#d975a0]"
          >
            <Plus size={19} />
            Plan a Trip
          </button>
        </motion.div>

        {/* Messages */}
        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle size={20} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-5 flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            <CheckCircle2 size={20} className="shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Summary cards */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SummaryCard
            icon={<MapPin size={21} />}
            label="Total Trips"
            value={String(trips.length)}
          />
          <SummaryCard
            icon={<CalendarDays size={21} />}
            label="Upcoming Trips"
            value={String(upcomingTrips.length)}
          />
          <SummaryCard
            icon={<Wallet size={21} />}
            label="Total Planned Budget"
            value={formatCurrency(totalBudget)}
          />
        </div>

        {/* Create/Edit form */}
        {showForm && (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 rounded-3xl border border-pink-100 bg-white p-5 shadow-sm sm:p-8"
          >
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold sm:text-2xl">
                  {editingId ? "Edit Your Trip" : "Plan a New Trip"}
                </h2>
                <p className="mt-1 text-sm text-[#9a7d8d]">
                  Add the details to organize your adventure.
                </p>
              </div>

              <button
                onClick={closeForm}
                type="button"
                aria-label="Close form"
                className="rounded-xl p-2 text-[#9a7d8d] transition hover:bg-pink-50 hover:text-[#d66d99]"
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <FormField label="Destination *">
                  <div className="relative">
                    <MapPin
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#d88bad]"
                    />
                    <input
                      required
                      value={form.destination}
                      onChange={(event) =>
                        updateField("destination", event.target.value)
                      }
                      placeholder="e.g. Manali, Himachal Pradesh"
                      className="form-input pl-10"
                    />
                  </div>
                </FormField>

                <FormField label="Budget (₹) *">
                  <div className="relative">
                    <Wallet
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#d88bad]"
                    />
                    <input
                      required
                      type="number"
                      min="0"
                      step="1"
                      value={form.budget}
                      onChange={(event) =>
                        updateField("budget", event.target.value)
                      }
                      placeholder="e.g. 25000"
                      className="form-input pl-10"
                    />
                  </div>
                </FormField>

                <FormField label="Start Date *">
                  <input
                    required
                    type="date"
                    value={form.startDate}
                    onChange={(event) =>
                      updateField("startDate", event.target.value)
                    }
                    className="form-input"
                  />
                </FormField>

                <FormField label="End Date *">
                  <input
                    required
                    type="date"
                    min={form.startDate || undefined}
                    value={form.endDate}
                    onChange={(event) =>
                      updateField("endDate", event.target.value)
                    }
                    className="form-input"
                  />
                </FormField>

                <FormField label="Cover Image URL (optional)">
                  <input
                    type="url"
                    value={form.imageUrl}
                    onChange={(event) =>
                      updateField("imageUrl", event.target.value)
                    }
                    placeholder="https://example.com/image.jpg"
                    className="form-input"
                  />
                </FormField>
              </div>

              <FormField label="Notes (optional)">
                <textarea
                  rows={3}
                  value={form.notes}
                  onChange={(event) =>
                    updateField("notes", event.target.value)
                  }
                  placeholder="Places to visit, things to pack, or anything to remember..."
                  className="form-input resize-y"
                />
              </FormField>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-xl border border-pink-100 px-5 py-3 font-semibold text-[#8b7180] transition hover:bg-pink-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#e78fb3] px-6 py-3 font-semibold text-white transition hover:bg-[#d975a0] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={18} />
                      {editingId ? "Save Changes" : "Create Trip"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.section>
        )}

        {/* Trips list */}
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold sm:text-2xl">Your Adventures</h2>
            <p className="mt-1 text-sm text-[#9a7d8d]">
              {trips.length === 1
                ? "1 trip saved"
                : `${trips.length} trips saved`}
            </p>
          </div>

          <button
            onClick={() => void fetchTrips()}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-pink-100 bg-white px-4 py-2 text-sm font-semibold text-[#8b7180] transition hover:bg-pink-50 disabled:opacity-60"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="flex min-h-56 flex-col items-center justify-center gap-3 rounded-3xl border border-pink-100 bg-white">
            <Loader2 size={30} className="animate-spin text-[#e78fb3]" />
            <p className="text-sm text-[#9a7d8d]">Loading your trips...</p>
          </div>
        ) : trips.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-pink-200 bg-white px-6 py-14 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#fff0f6] text-[#e78fb3]">
              <Plane size={30} />
            </div>
            <h3 className="text-xl font-bold">Your next adventure starts here</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#9a7d8d]">
              You haven't planned any trips yet. Add a destination, choose your
              dates, and set a budget to get started.
            </p>
            <button
              onClick={openCreateForm}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#e78fb3] px-5 py-3 font-semibold text-white transition hover:bg-[#d975a0]"
            >
              <Plus size={18} />
              Create Your First Trip
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {trips.map((trip, index) => (
              <motion.article
                key={trip._id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.06, 0.3) }}
                className="overflow-hidden rounded-3xl border border-pink-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg hover:shadow-pink-100/60"
              >
                <div className="relative h-44 overflow-hidden bg-gradient-to-br from-[#f9d8e7] via-[#fceaf2] to-[#f3c2d8]">
                  {trip.imageUrl ? (
                    <img
                      src={trip.imageUrl}
                      alt={trip.destination}
                      className="h-full w-full object-cover"
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[#d66d99]">
                      <Plane size={44} strokeWidth={1.3} />
                    </div>
                  )}

                  <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-[#bd628b] backdrop-blur">
                    {trip.startDate &&
                    new Date(trip.startDate).setHours(23, 59, 59, 999) >=
                      Date.now()
                      ? "Upcoming / Planned"
                      : "Past Trip"}
                  </div>

                  <div className="absolute right-3 top-3 flex gap-2">
                    <button
                      onClick={() => openEditForm(trip)}
                      aria-label={`Edit ${trip.destination}`}
                      className="rounded-xl bg-white/95 p-2 text-[#bd628b] shadow-sm transition hover:bg-white"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => void deleteTrip(trip._id)}
                      aria-label={`Delete ${trip.destination}`}
                      className="rounded-xl bg-white/95 p-2 text-red-500 shadow-sm transition hover:bg-white"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="p-5">
                  <div className="mb-4 flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#fff0f6] text-[#d66d99]">
                      <MapPin size={21} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="break-words text-lg font-bold">
                        {trip.destination}
                      </h3>
                      <p className="mt-1 text-sm text-[#9a7d8d]">
                        {formatDate(trip.startDate)} –{" "}
                        {formatDate(trip.endDate)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl bg-[#fff7fa] p-3">
                    <div className="flex items-center gap-2 text-sm text-[#9a7d8d]">
                      <Wallet size={17} className="text-[#d66d99]" />
                      Planned budget
                    </div>
                    <span className="font-bold text-[#bd628b]">
                      {formatCurrency(trip.budget)}
                    </span>
                  </div>

                  {trip.notes && (
                    <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-6 text-[#8b7180]">
                      {trip.notes}
                    </p>
                  )}
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .form-input {
          width: 100%;
          border: 1px solid #f2dce7;
          border-radius: 12px;
          background: #fffafd;
          padding: 12px 14px;
          color: #3d2634;
          font-size: 14px;
          outline: none;
          transition: border-color 150ms ease, box-shadow 150ms ease;
        }

        .form-input:focus {
          border-color: #e78fb3;
          box-shadow: 0 0 0 3px rgba(231, 143, 179, 0.15);
        }

        .form-input::placeholder {
          color: #b9a2ae;
        }
      `}</style>
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-3xl border border-pink-100 bg-white p-5 shadow-sm">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#fff0f6] text-[#d66d99]">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm text-[#9a7d8d]">{label}</p>
        <p className="mt-1 break-words text-xl font-bold text-[#3d2634]">
          {value}
        </p>
      </div>
    </div>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-[#654657]">
        {label}
      </span>
      {children}
    </label>
  );
}