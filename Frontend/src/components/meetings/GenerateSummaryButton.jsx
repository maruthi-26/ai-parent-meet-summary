import { useState } from "react";
import { Bot, Loader2 } from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";

export default function GenerateSummaryButton({ meetingId, onGenerated, hasExisting }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    setIsLoading(true);
    const toastId = toast.loading("Generating AI summary...");
    try {
      await api.post(`/ai/generate/${meetingId}`);
      toast.success("AI summary generated!", { id: toastId });
      onGenerated();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to generate summary", { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleGenerate}
      disabled={isLoading}
      title={hasExisting ? "Regenerate AI Summary" : "Generate AI Summary"}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
        hasExisting
          ? "bg-purple-50 text-purple-600 hover:bg-purple-100"
          : "bg-brand-gradient text-white shadow-sm hover:shadow-md"
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {isLoading ? (
        <Loader2 size={13} className="animate-spin" />
      ) : (
        <Bot size={13} />
      )}
      {isLoading ? "Generating..." : hasExisting ? "Regen AI" : "Generate AI"}
    </button>
  );
}