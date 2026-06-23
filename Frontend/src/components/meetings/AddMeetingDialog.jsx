import { useEffect, useState } from "react";
import { Plus, GraduationCap, Loader2 } from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger,
} from "../ui/dialog";

export default function AddMeetingDialog({ onMeetingCreated }) {
  const [open, setOpen] = useState(false);
  const [students, setStudents] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    studentId: "",
    notes: "",
    meetingDate: new Date().toISOString().split("T")[0],
    meetingTime: "10:00",
    meetingStatus: "Scheduled",
  });

  useEffect(() => { fetchStudents(); }, []);

  const fetchStudents = async () => {
    try {
      const response = await api.get("/students");
      setStudents(response.data);
    } catch {
      toast.error("Failed to load students");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.studentId) { toast.error("Please select a student"); return; }
    setIsSubmitting(true);
    const toastId = toast.loading("Creating meeting...");
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      await api.post("/meetings", {
        teacherId: user.id,
        studentId: formData.studentId,
        notes: formData.notes,
        meetingDate: formData.meetingDate,
        meetingTime: formData.meetingTime,
        meetingStatus: formData.meetingStatus,
      });
      toast.success("Meeting created successfully!", { id: toastId });
      onMeetingCreated();
      setFormData({
        studentId: "",
        notes: "",
        meetingDate: new Date().toISOString().split("T")[0],
        meetingTime: "10:00",
        meetingStatus: "Scheduled",
      });
      setOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create meeting", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-gradient text-white text-sm font-semibold shadow-sm hover:shadow-md transition-all">
          <Plus size={16} /> New Meeting
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <div className="w-8 h-8 rounded-lg bg-brand-gradient flex items-center justify-center">
              <GraduationCap size={16} className="text-white" />
            </div>
            Create Meeting
          </DialogTitle>
          <DialogDescription className="sr-only">
            Select a student and write discussion notes to record a new PTM meeting.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Student</label>
            <select
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white transition-all"
              value={formData.studentId}
              onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
            >
              <option value="">Select a student...</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name} — {student.className}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Date</label>
              <input
                type="date"
                value={formData.meetingDate}
                onChange={(e) => setFormData({ ...formData, meetingDate: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Time</label>
              <input
                type="time"
                value={formData.meetingTime}
                onChange={(e) => setFormData({ ...formData, meetingTime: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Status</label>
            <select
              value={formData.meetingStatus}
              onChange={(e) => setFormData({ ...formData, meetingStatus: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white transition-all"
            >
              <option value="Scheduled">Scheduled</option>
              <option value="Completed">Completed</option>
              <option value="Follow-Up Required">Follow-Up Required</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Meeting Notes (Optional)</label>
            <textarea
              placeholder="Describe what was discussed in the parent meeting..."
              rows={4}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-brand-gradient text-white font-semibold text-sm shadow-sm hover:shadow-md transition-all disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : "Save Meeting"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}