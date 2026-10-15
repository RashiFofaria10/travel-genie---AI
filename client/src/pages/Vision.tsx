import { useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Camera,
  Upload,
  MapPin,
  Sparkles,
  X,
  Search,
  Plane,
  Image as ImageIcon,
} from "lucide-react";

type VisionResult = {
  placeName: string;
  location: string;
  confidence: number;
  description: string;
  clues: string[];
};

export default function Vision() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [image, setImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VisionResult | null>(null);
  const [error, setError] = useState("");

  const handleFile = (selectedFile: File) => {
    if (!selectedFile.type.startsWith("image/")) {
      setError("Please upload an image file.");
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("Please upload an image smaller than 10 MB.");
      return;
    }

    setError("");
    setResult(null);
    setFile(selectedFile);

    const imageUrl = URL.createObjectURL(selectedFile);
    setImage(imageUrl);
  };

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile = event.target.files?.[0];

    if (selectedFile) {
      handleFile(selectedFile);
    }
  };

  const handleDrop = (
    event: React.DragEvent<HTMLDivElement>
  ) => {
    event.preventDefault();

    const droppedFile = event.dataTransfer.files?.[0];

    if (droppedFile) {
      handleFile(droppedFile);
    }
  };

  const clearImage = () => {
    setImage(null);
    setFile(null);
    setResult(null);
    setError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

 const analyzeImage = async () => {
  if (!file) {
    setError("Please upload an image first.");
    return;
  }

  setLoading(true);
  setError("");
  setResult(null);

  try {
    const reader = new FileReader();

    const imageData = await new Promise<string>((resolve, reject) => {
      reader.onload = () => {
        if (typeof reader.result === "string") {
          resolve(reader.result);
        } else {
          reject(new Error("Unable to read image."));
        }
      };

      reader.onerror = () => {
        reject(new Error("Unable to read image."));
      };

      reader.readAsDataURL(file);
    });

    const response = await fetch(
      "http://localhost:5000/api/vision/analyze",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: imageData,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(
        data.message || "Unable to analyze the image."
      );
    }

    setResult(data.result);
  } catch (err) {
    console.error("Vision Error:", err);

    setError(
      err instanceof Error
        ? err.message
        : "Something went wrong while analyzing the image."
    );
  } finally {
    setLoading(false);
  }
};

  const planTrip = () => {
    if (!result) return;

    const message = `I found this place from a photo: ${result.placeName}, ${result.location}. Help me plan a trip there.`;

    localStorage.setItem(
      "travel-genie-vision-request",
      message
    );

    window.location.href = "/assistant";
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-pink-50 px-6 py-10">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-pink-100 px-5 py-2 font-semibold text-[#E78FB3]">
            <Sparkles size={18} />
            AI Travel Vision
          </div>

          <h1 className="mt-6 text-5xl font-black text-gray-900">
            Where is this
            <span className="text-[#E78FB3]"> place?</span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-lg text-gray-600">
            Upload a travel photo and let Travel Genie identify the
            place, explain what it recognized, and help you plan a
            trip there.
          </p>
        </motion.div>

        {/* Main Area */}
        <div className="mt-12 grid gap-8 lg:grid-cols-2">

          {/* Upload / Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-[35px] bg-white p-6 shadow-xl"
          >
            {!image ? (
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
                className="flex min-h-[500px] cursor-pointer flex-col items-center justify-center rounded-[28px] border-2 border-dashed border-pink-200 bg-pink-50/50 p-10 text-center transition hover:border-[#E78FB3] hover:bg-pink-50"
              >
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-md">
                  <Camera
                    size={36}
                    className="text-[#E78FB3]"
                  />
                </div>

                <h2 className="mt-7 text-2xl font-bold text-gray-900">
                  Upload a travel photo
                </h2>

                <p className="mt-3 max-w-md text-gray-500">
                  Drop an image here or click to browse from your
                  computer.
                </p>

                <button
                  type="button"
                  className="mt-7 flex items-center gap-2 rounded-2xl bg-[#E78FB3] px-6 py-3 font-semibold text-white transition hover:bg-pink-500"
                >
                  <Upload size={18} />
                  Choose Photo
                </button>

                <p className="mt-4 text-sm text-gray-400">
                  JPG, PNG or WEBP • Maximum 10 MB
                </p>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleInputChange}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="relative">
                <img
                  src={image}
                  alt="Uploaded travel"
                  className="h-[500px] w-full rounded-[28px] object-cover"
                />

                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-md hover:bg-white"
                >
                  <X size={20} />
                </button>

                <div className="absolute bottom-5 left-5 right-5">
                  <button
                    type="button"
                    onClick={analyzeImage}
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#E78FB3] px-6 py-4 font-bold text-white shadow-lg transition hover:bg-pink-500 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <Sparkles
                          size={20}
                          className="animate-spin"
                        />
                        Travel Genie is analyzing...
                      </>
                    ) : (
                      <>
                        <Search size={20} />
                        Identify This Place
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-4 rounded-2xl bg-red-50 p-4 text-sm text-red-600">
                {error}
              </div>
            )}
          </motion.div>

          {/* Result */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-[35px] bg-white p-8 shadow-xl"
          >
            {!result ? (
              <div className="flex min-h-[500px] flex-col items-center justify-center text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-pink-50">
                  <ImageIcon
                    size={34}
                    className="text-[#E78FB3]"
                  />
                </div>

                <h2 className="mt-6 text-2xl font-bold text-gray-900">
                  Your result will appear here
                </h2>

                <p className="mt-3 max-w-md text-gray-500">
                  Upload a photo and Travel Genie will analyze the
                  visual clues to find the most likely place.
                </p>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2 text-[#E78FB3]">
                  <MapPin size={22} />
                  <span className="font-semibold">
                    Possible Match
                  </span>
                </div>

                <h2 className="mt-4 text-4xl font-black text-gray-900">
                  {result.placeName}
                </h2>

                <p className="mt-2 text-lg text-gray-500">
                  {result.location}
                </p>

                <div className="mt-6 rounded-2xl bg-pink-50 p-5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">
                      Confidence
                    </span>

                    <span className="font-bold text-[#E78FB3]">
                      {result.confidence}%
                    </span>
                  </div>

                  <div className="mt-3 h-3 overflow-hidden rounded-full bg-white">
                    <div
                      className="h-full rounded-full bg-[#E78FB3]"
                      style={{
                        width: `${result.confidence}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="mt-7">
                  <h3 className="text-xl font-bold">
                    What Travel Genie noticed
                  </h3>

                  <p className="mt-3 leading-7 text-gray-600">
                    {result.description}
                  </p>

                  <ul className="mt-4 space-y-3">
                    {result.clues.map((clue, index) => (
                      <li
                        key={index}
                        className="flex gap-3 text-gray-600"
                      >
                        <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-[#E78FB3]" />
                        {clue}
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={planTrip}
                  className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#E78FB3] px-6 py-4 font-bold text-white transition hover:bg-pink-500"
                >
                  <Plane size={20} />
                  Plan My Trip Here
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </main>
  );
}