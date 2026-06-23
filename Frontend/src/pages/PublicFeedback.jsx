import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Star, CheckCircle2, AlertCircle, ChevronDown, Sparkles } from "lucide-react";
import api from "../services/api";
import toast from "react-hot-toast";

export default function PublicFeedback() {
  const { meetingId } = useParams();
  
  const [meeting, setMeeting] = useState(null);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [satisfactionLevel, setSatisfactionLevel] = useState("");
  const [comment, setComment] = useState("");
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchMeeting = async () => {
      try {
        setIsLoading(true);
        const res = await api.get(`/feedback/${meetingId}`);
        setMeeting(res.data.meeting);
        if (res.data.feedback) {
          setRating(res.data.feedback.rating);
          setSatisfactionLevel(res.data.feedback.satisfactionLevel);
          setComment(res.data.feedback.comment || "");
          setSubmitted(true);
        }
      } catch (err) {
        setErrorMsg(err.response?.data?.error || "Invalid feedback link or meeting not found.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchMeeting();
  }, [meetingId]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (rating === 0) {
      toast.error("Please select a star rating!");
      return;
    }
    if (!satisfactionLevel) {
      toast.error("Please select your satisfaction level!");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post("/feedback", {
        meetingId,
        rating,
        satisfactionLevel,
        comment,
      });
      toast.success("Feedback submitted successfully!");
      setSubmitted(true);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to submit feedback.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-md border border-slate-100 text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-orange-500/20 border-t-orange-500 animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-500">Loading meeting details...</p>
        </div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-md border border-slate-100 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto animate-bounce" />
          <h2 className="text-lg font-bold text-slate-800">Feedback Link Expired</h2>
          <p className="text-sm text-slate-500 leading-relaxed">{errorMsg}</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md bg-white rounded-2xl p-6 sm:p-8 shadow-md border border-slate-100 text-center space-y-6 overflow-hidden relative"
        >
          {/* Subtle branding accent line */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-brand-gradient" />

          <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto border border-teal-100 shadow-sm">
            <CheckCircle2 className="w-8 h-8 text-teal-600" />
          </div>
          
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Thank You!</h2>
            <p className="text-[10px] text-orange-600 font-extrabold uppercase tracking-widest mt-1">
              FirstCry Intellitots
            </p>
            <p className="text-sm text-slate-500 mt-4 leading-relaxed">
              Your feedback was logged successfully. It directly supports our efforts to offer the best care and learning experience for your child.
            </p>
          </div>

          <div className="pt-5 border-t border-slate-100 space-y-3.5 text-left">
            <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
              <span>Student</span>
              <span className="text-slate-800 font-extrabold">{meeting?.student?.name}</span>
            </div>
            <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
              <span>Class</span>
              <span className="text-slate-800 font-extrabold">{meeting?.student?.className}</span>
            </div>
            <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
              <span>Rating Given</span>
              <span className="text-amber-500 flex items-center gap-0.5 font-extrabold">
                {rating} <Star size={12} className="fill-amber-400 text-amber-400" />
              </span>
            </div>
            <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
              <span>Satisfaction</span>
              <span className="text-slate-800 font-extrabold">{satisfactionLevel}</span>
            </div>
            {comment && (
              <div className="mt-3 p-3 bg-slate-50 rounded-xl text-xs text-slate-600 border border-slate-100 italic leading-relaxed">
                "{comment}"
              </div>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white rounded-2xl p-6 sm:p-8 shadow-md border border-slate-100 overflow-hidden relative"
      >
        {/* Subtle branding accent line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-brand-gradient" />

        <div className="text-center mb-6">
          <div className="h-9 w-fit px-3 py-1.5 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 font-bold text-[10px] uppercase tracking-wider mx-auto mb-4">
            Preschool Operations
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center justify-center gap-1.5">
            ⭐ Parent Feedback
          </h1>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed max-w-sm mx-auto">
            We value your partnership. Please share your feedback on the recent parent-teacher discussion for <span className="font-semibold text-slate-700">{meeting?.student?.name}</span> ({meeting?.student?.className}).
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Star Rating Selector */}
          <div className="space-y-2 text-center p-3 bg-slate-50/50 rounded-2xl border border-slate-100/50">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
              Rate the Discussion
            </label>
            <div className="flex justify-center gap-1.5 py-1">
              {[1, 2, 3, 4, 5].map((star) => {
                const isActive = star <= (hoveredRating || rating);
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="p-1 hover:scale-115 transition-transform focus:outline-none"
                  >
                    <Star
                      size={32}
                      className={`transition-colors ${
                        isActive 
                          ? "fill-amber-400 text-amber-400 filter drop-shadow-[0_2px_4px_rgba(251,191,36,0.2)]" 
                          : "text-slate-200"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
            <p className="text-[9px] text-slate-400 italic">Select 1 to 5 stars based on your experience</p>
          </div>

          {/* Satisfaction Dropdown Selector */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Satisfaction Level
            </label>
            <div className="relative">
              <select
                value={satisfactionLevel}
                onChange={(e) => setSatisfactionLevel(e.target.value)}
                disabled={isSubmitting}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all bg-white text-slate-700 disabled:opacity-60 appearance-none cursor-pointer pr-10"
              >
                <option value="" disabled>Select your satisfaction level</option>
                <option value="Very Satisfied">😊 Very Satisfied</option>
                <option value="Satisfied">🙂 Satisfied</option>
                <option value="Neutral">😐 Neutral</option>
                <option value="Dissatisfied">🙁 Dissatisfied</option>
                <option value="Very Dissatisfied">😞 Very Dissatisfied</option>
              </select>
              <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                <ChevronDown size={16} />
              </div>
            </div>
          </div>

          {/* Comments Box */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Additional Comments
            </label>
            <textarea
              placeholder="What went well or how can we improve?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full min-h-[90px] p-3 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent leading-relaxed transition-all placeholder:text-slate-400/80 resize-none"
            />
            <p className="text-[9px] text-slate-400/80 italic leading-snug">
              Press Enter to submit, or Shift + Enter for new lines.
            </p>
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={isSubmitting}
            whileHover={{ scale: isSubmitting ? 1 : 1.01 }}
            whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
            className="w-full py-3.5 rounded-xl bg-brand-gradient text-white font-semibold text-sm shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                Submitting Feedback...
              </>
            ) : (
              "Submit Feedback"
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
