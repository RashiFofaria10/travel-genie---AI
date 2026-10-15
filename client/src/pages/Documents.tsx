import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Upload,
  Download,
  Trash2,
  Search,
  LoaderCircle,
  ShieldCheck,
} from "lucide-react";

type TravelDocument = {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
  file: Blob;
};

const DB_NAME = "TravelGenieDocuments";
const STORE_NAME = "documents";

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getDocuments(): Promise<TravelDocument[]> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const request = db
      .transaction(STORE_NAME, "readonly")
      .objectStore(STORE_NAME)
      .getAll();

    request.onsuccess = () => {
      resolve(
        (request.result as TravelDocument[]).sort(
          (a, b) =>
            new Date(b.uploadedAt).getTime() -
            new Date(a.uploadedAt).getTime()
        )
      );
      db.close();
    };

    request.onerror = () => {
      reject(request.error);
      db.close();
    };
  });
}

async function saveDocument(doc: TravelDocument): Promise<void> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");

    transaction.objectStore(STORE_NAME).put(doc);

    transaction.oncomplete = () => {
      db.close();
      resolve();
    };

    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
  });
}

async function removeDocument(id: string): Promise<void> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");

    transaction.objectStore(STORE_NAME).delete(id);

    transaction.oncomplete = () => {
      db.close();
      resolve();
    };

    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
  });
}

function getDocumentType(name: string): string {
  const lower = name.toLowerCase();

  if (lower.includes("passport")) return "Passport";
  if (lower.includes("visa")) return "Visa";
  if (lower.includes("ticket") || lower.includes("flight"))
    return "Flight Ticket";
  if (lower.includes("hotel") || lower.includes("booking"))
    return "Booking";
  if (lower.includes("insurance")) return "Travel Insurance";

  return "Travel Document";
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024)
    return `${(bytes / 1024).toFixed(1)} KB`;

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function Documents() {
  const [documents, setDocuments] = useState<TravelDocument[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const fileInput = useRef<HTMLInputElement>(null);

  async function refreshDocuments() {
    setLoading(true);
    setError("");

    try {
      setDocuments(await getDocuments());
    } catch {
      setError(
        "Could not access your document storage. Please try another browser or check its storage permissions."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refreshDocuments();
  }, []);

  async function handleUpload(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const files = Array.from(event.target.files ?? []);

    // Allow the same file to be selected again later.
    event.target.value = "";

    if (!files.length) return;

    setBusy(true);
    setError("");

    try {
      for (const file of files) {
        const doc: TravelDocument = {
          id: crypto.randomUUID(),
          name: file.name,
          type: getDocumentType(file.name),
          size: file.size,
          uploadedAt: new Date().toISOString(),
          file,
        };

        await saveDocument(doc);
      }

      await refreshDocuments();
    } catch {
      setError(
        "Upload failed. Your browser may have run out of storage space."
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleDownload(doc: TravelDocument) {
    const url = URL.createObjectURL(doc.file);
    const link = document.createElement("a");

    link.href = url;
    link.download = doc.name;
    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  }

  async function handleDelete(doc: TravelDocument) {
    const confirmed = window.confirm(
      `Delete "${doc.name}" permanently from this browser?`
    );

    if (!confirmed) return;

    setError("");

    try {
      await removeDocument(doc.id);
      setDocuments((current) =>
        current.filter((item) => item.id !== doc.id)
      );
    } catch {
      setError("Could not delete this document. Please try again.");
    }
  }

  const filteredDocuments = documents.filter((doc) =>
    `${doc.name} ${doc.type}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-pink-50">
      <section className="mx-auto max-w-7xl px-6 pt-16">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="mb-3 font-semibold uppercase tracking-[0.2em] text-[#E78FB3]">
            Your travel essentials
          </p>

          <h1 className="text-4xl font-black sm:text-5xl">
            Travel <span className="text-[#E78FB3]">Documents</span>
          </h1>

          <p className="mt-4 max-w-2xl text-lg text-gray-600">
            Keep your passport, tickets, bookings and other travel
            files together in one convenient place.
          </p>
        </motion.div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8 grid gap-5 sm:grid-cols-2">
          <div className="rounded-3xl border border-pink-100 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-pink-100 p-3 text-[#E78FB3]">
                <FileText size={26} />
              </div>
              <div>
                <p className="text-sm text-gray-500">
                  Your stored documents
                </p>
                <p className="text-3xl font-black">
                  {documents.length}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-pink-100 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-green-50 p-3 text-green-600">
                <ShieldCheck size={26} />
              </div>
              <div>
                <p className="text-sm text-gray-500">
                  Storage status
                </p>
                <p className="text-lg font-bold">
                  Saved on this device
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search your documents..."
              className="w-full rounded-2xl border border-pink-100 bg-white py-4 pl-12 pr-4 outline-none transition focus:border-[#E78FB3] focus:ring-2 focus:ring-pink-100"
            />
          </div>

          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            disabled={busy}
            className="flex items-center justify-center gap-3 rounded-2xl bg-[#E78FB3] px-7 py-4 font-bold text-white transition hover:bg-pink-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? (
              <LoaderCircle size={20} className="animate-spin" />
            ) : (
              <Upload size={20} />
            )}
            {busy ? "Uploading..." : "Upload Documents"}
          </button>

          <input
            ref={fileInput}
            type="file"
            multiple
            className="hidden"
            onChange={handleUpload}
          />
        </div>

        <p className="mb-6 text-sm text-gray-500">
          Upload actual files from your device. Files remain in this
          browser's local storage and are not uploaded to a server.
        </p>

        {error && (
          <div
            role="alert"
            className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center gap-3 rounded-3xl bg-white p-12 text-gray-500 shadow-sm">
            <LoaderCircle className="animate-spin" />
            Loading your documents...
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-pink-200 bg-white px-6 py-16 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-pink-50 text-[#E78FB3]">
              <FileText size={32} />
            </div>

            <h2 className="text-xl font-bold text-gray-800">
              {documents.length === 0
                ? "No documents uploaded yet"
                : "No matching documents"}
            </h2>

            <p className="mx-auto mt-2 max-w-md text-gray-500">
              {documents.length === 0
                ? "Upload your first travel document to start building your personal collection."
                : "Try a different search term."}
            </p>

            {documents.length === 0 && (
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                className="mt-6 rounded-xl bg-[#E78FB3] px-6 py-3 font-semibold text-white hover:bg-pink-500"
              >
                Choose a file
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDocuments.map((doc) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-5 rounded-3xl border border-pink-50 bg-white p-5 shadow-sm transition hover:shadow-md sm:flex-row sm:items-center sm:justify-between sm:p-6"
              >
                <div className="flex min-w-0 items-center gap-4">
                  <div className="shrink-0 rounded-2xl bg-pink-50 p-4 text-[#E78FB3]">
                    <FileText size={28} />
                  </div>

                  <div className="min-w-0">
                    <h2 className="break-all text-lg font-bold text-gray-800">
                      {doc.name}
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      {doc.type} · {formatSize(doc.size)}
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      Added{" "}
                      {new Date(doc.uploadedAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:shrink-0">
                  <span className="mr-auto rounded-full bg-green-50 px-3 py-2 text-xs font-semibold text-green-700">
                    Stored locally
                  </span>

                  <button
                    type="button"
                    title="Download document"
                    aria-label={`Download ${doc.name}`}
                    onClick={() => void handleDownload(doc)}
                    className="rounded-xl bg-pink-50 p-3 text-[#E78FB3] transition hover:bg-pink-100"
                  >
                    <Download size={20} />
                  </button>

                  <button
                    type="button"
                    title="Delete document"
                    aria-label={`Delete ${doc.name}`}
                    onClick={() => void handleDelete(doc)}
                    className="rounded-xl bg-red-50 p-3 text-red-500 transition hover:bg-red-100"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}