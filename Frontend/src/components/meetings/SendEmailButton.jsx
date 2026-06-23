import { useState } from "react";
import { Mail, Loader2, CheckCircle } from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";

export default function SendEmailButton({ meeting, onSent, alreadySent }) {
  const [isLoading, setIsLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const handleClick = () => {
    if (!meeting.student?.parentEmail) {
      toast.error("No parent email address stored for this student.");
      return;
    }
    if (!confirmed) {
      setConfirmed(true);
      setTimeout(() => setConfirmed(false), 3000); // auto-reset if not confirmed
      toast("Click again to confirm sending email", { icon: "⚠️", duration: 2500 });
      return;
    }
    handleSend();
  };

  const handleSend = async () => {
    setIsLoading(true);
    setConfirmed(false);
    const toastId = toast.loading("Sending email...");
    try {
      await api.post(`/email/send/${meeting.id}`);

      // Construct mailto URL
      const email = meeting.student.parentEmail;
      const subject = `Parent-Teacher Meeting Summary - FirstCry Intellitots`;
      const message = `Dear ${meeting.student?.parentName || "Parent"},\n\nWe hope this message finds you well.\n\n${meeting.aiSummary}\n\nWarm regards,\nFirstCry Intellitots Team`;
      
      const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
      
      // Open default mail client
      window.open(mailtoUrl, "_self");

      toast.success("Email client opened!", { id: toastId });
      onSent();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send email", { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  if (alreadySent) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-600">
        <CheckCircle size={13} /> Sent
      </span>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
        confirmed
          ? "bg-orange-500 text-white animate-pulse"
          : "bg-blue-500 text-white hover:bg-blue-600 shadow-sm hover:shadow-md"
      }`}
    >
      {isLoading ? (
        <Loader2 size={13} className="animate-spin" />
      ) : (
        <Mail size={13} />
      )}
      {isLoading ? "Sending..." : confirmed ? "Confirm?" : "Send Email"}
    </button>
  );
}
