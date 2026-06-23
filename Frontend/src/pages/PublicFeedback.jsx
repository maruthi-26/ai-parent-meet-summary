import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, CheckCircle, AlertCircle, Smile, Frown, Meh } from "lucide-react";
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
        <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-sm border border-slate-100 text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-orange-500/20 border-t-orange-500 animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-500">Loading meeting details...</p>
        </div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-sm border border-slate-100 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-800">Feedback Unavailable</h2>
          <p className="text-sm text-slate-500">{errorMsg}</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white rounded-3xl p-8 shadow-sm border border-slate-100 text-center space-y-6"
        >
          <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto border border-teal-100">
            <CheckCircle className="w-8 h-8 text-teal-600" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-800">Thank You!</h2>
            <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-bold">FirstCry Intellitots Operations</p>
            <p className="text-sm text-slate-500 mt-4 leading-relaxed">
              Thank you for your feedback. Your response has been logged and will help us further support your child's learning journey.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-50 space-y-3 text-left">
            <div className="flex justify-between text-xs font-semibold text-slate-400">
              <span>Student</span>
              <span className="text-slate-700">{meeting?.student?.name}</span>
            </div>
            <div className="flex justify-between text-xs font-semibold text-slate-400">
              <span>Rating Given</span>
              <span className="text-amber-500 flex items-center gap-0.5">
                {rating} <Star size={12} className="fill-amber-500 text-amber-500" />
              </span>
            </div>
            <div className="flex justify-between text-xs font-semibold text-slate-400">
              <span>Satisfaction</span>
              <span className="text-slate-700 font-bold">{satisfactionLevel}</span>
            </div>
            {comment && (
              <div className="mt-2 p-3 bg-slate-50 rounded-xl text-xs text-slate-600 italic">
                "{comment}"
              </div>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  const satisfactions = [
    { value: "Very Satisfied", icon: Smile, color: "text-teal-600 bg-teal-50 border-teal-200" },
    { value: "Satisfied", icon: Smile, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
    { value: "Neutral", icon: Meh, color: "text-slate-600 bg-slate-50 border-slate-200" },
    { value: "Dissatisfied", icon: Frown, color: "text-amber-600 bg-amber-50 border-amber-200" },
    { value: "Very Dissatisfied", icon: Frown, color: "text-rose-600 bg-rose-50 border-rose-200" }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg bg-white rounded-3xl p-8 shadow-sm border border-slate-100"
      >
        <div className="text-center mb-6">
          <div className="h-10 w-fit px-4 py-1.5 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 font-bold text-xs mx-auto mb-3">
            FirstCry Intellitots
          </div>
          <h1 className="text-xl font-black text-slate-800 tracking-tight">Parent Feedback Form</h1>
          <p className="text-xs text-slate-400 mt-1">
            For meeting regarding <span className="font-bold text-slate-600">{meeting?.student?.name}</span> (Class: {meeting?.student?.className})
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Star Rating */}
          <div className="space-y-2 text-center">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Rate the Discussion</label>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => {
                const isActive = star <= (hoveredRating || rating);
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="p-1 text-slate-200 hover:scale-110 transition-all focus:outline-none"
                  >
                    <Star
                      size={36}
                      className={isActive ? "fill-amber-400 text-amber-400" : "text-slate-200"}
                    />
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-slate-400 italic">Select 1 to 5 stars</p>
          </div>

          {/* Satisfaction Level Select */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Satisfaction Level</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {satisfactions.map((sat) => {
                const IconComp = sat.icon;
                const isSelected = satisfactionLevel === sat.value;
                return (
                  <button
                    key={sat.value}
                    type="button"
                    onClick={() => setSatisfactionLevel(sat.value)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all justify-center ${
                      isSelected
                        ? sat.color + " ring-2 ring-offset-1 ring-orange-500/20"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <IconComp size={14} />
                    {sat.value}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Comment Area */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Additional Comments (Optional)</label>
            <textarea
              placeholder="Share details about what went well, or what we can work on to improve child development."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full min-h-[100px] p-3 text-xs sm:text-sm rounded-2xl border border-slate-200 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 leading-relaxed transition-all"
            />
            <p className="text-[9px] text-slate-400 italic">Press Enter to submit feedback directly, or Shift + Enter for new lines.</p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-bold text-sm flex items-center justify-center transition-all disabled:opacity-50 shadow-sm"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
            ) : (
              "Submit Feedback"
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
