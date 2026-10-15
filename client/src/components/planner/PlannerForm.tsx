import { useState } from "react";
import { chatWithAI } from "../../services/chatService";

const PlannerForm = () => {
  const [destination, setDestination] = useState("");
  const [loading, setLoading] = useState(false);
  const [reply, setReply] = useState("");

  const handleSubmit = async () => {
    if (!destination.trim()) return;

    setLoading(true);

    try {
      const result = await chatWithAI(destination);
      setReply(result);
    } catch (err) {
      console.error(err);
      setReply("Something went wrong.");
    }

    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Where do you want to go?"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          className="flex-1 border rounded-lg px-4 py-3"
        />

        <button
          onClick={handleSubmit}
          className="bg-pink-500 text-white px-6 rounded-lg"
        >
          {loading ? "Planning..." : "Plan Trip"}
        </button>
      </div>

      {reply && (
        <div className="mt-6 whitespace-pre-wrap border rounded-xl p-5 shadow">
          {reply}
        </div>
      )}
    </div>
  );
};

export default PlannerForm;