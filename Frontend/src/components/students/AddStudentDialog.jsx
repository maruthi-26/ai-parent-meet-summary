import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "../ui/dialog";
import toast from "react-hot-toast";

export default function AddStudentDialog({
  onStudentCreated,
  student = null,
  open: externalOpen,
  onOpenChange: externalOnOpenChange,
  trigger,
}) {
  const { isAdmin } = useAuth();
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = externalOpen !== undefined ? externalOpen : internalOpen;
  const setIsOpen = externalOnOpenChange !== undefined ? externalOnOpenChange : setInternalOpen;
  const [teachers, setTeachers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    className: "",
    parentName: "",
    parentPhone: "",
    parentEmail: "",
    teacherId: "",
    gender: "MALE",
  });

  useEffect(() => {
    if (isOpen && isAdmin) {
      api.get("/teachers?role=TEACHER")
        .then((res) => setTeachers(res.data))
        .catch((err) => console.error("Error loading teachers:", err));
    }
  }, [isOpen, isAdmin]);

  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name || "",
        className: student.className || "",
        parentName: student.parentName || "",
        parentPhone: student.parentPhone || "",
        parentEmail: student.parentEmail || "",
        teacherId: student.teacherId || "",
        gender: student.gender || "MALE",
      });
    } else {
      setFormData({
        name: "",
        className: "",
        parentName: "",
        parentPhone: "",
        parentEmail: "",
        teacherId: "",
        gender: "MALE",
      });
    }
  }, [student, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isAdmin && !formData.teacherId) {
      toast.error("Teacher assignment is required for Admins");
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading(student ? "Saving changes..." : "Adding student...");
    try {
      const payload = {
        ...formData,
        teacherId: formData.teacherId || null,
      };

      if (student) {
        await api.patch(`/students/${student.id}`, payload);
        toast.success("Student updated successfully!", { id: toastId });
      } else {
        await api.post("/students", payload);
        toast.success("Student enrolled successfully!", { id: toastId });
      }

      onStudentCreated();
      setIsOpen(false);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to save student", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {trigger ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : externalOpen === undefined ? (
        <DialogTrigger asChild>
          <Button>Add Student</Button>
        </DialogTrigger>
      ) : null}

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{student ? "Edit Student" : "Add Student"}</DialogTitle>
          <DialogDescription className="sr-only">
            Provide details of the student and their parent to enroll them.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label htmlFor="student-name" className="text-xs font-semibold text-slate-500 block mb-1">Student Name</label>
            <Input
              id="student-name"
              name="name"
              placeholder="Student Name"
              value={formData.name}
              required
              onChange={(e) =>
                setFormData({
                  ...formData,
                  name: e.target.value,
                })
              }
            />
          </div>

          <div>
            <label htmlFor="student-class" className="text-xs font-semibold text-slate-500 block mb-1">Class</label>
            <Input
              id="student-class"
              name="className"
              placeholder="Class"
              value={formData.className}
              required
              onChange={(e) =>
                setFormData({
                  ...formData,
                  className: e.target.value,
                })
              }
            />
          </div>

          <div>
            <label htmlFor="parent-name" className="text-xs font-semibold text-slate-500 block mb-1">Parent Name</label>
            <Input
              id="parent-name"
              name="parentName"
              placeholder="Parent Name"
              value={formData.parentName}
              required
              onChange={(e) =>
                setFormData({
                  ...formData,
                  parentName: e.target.value,
                })
              }
            />
          </div>

          <div>
            <label htmlFor="parent-phone" className="text-xs font-semibold text-slate-500 block mb-1">Parent Phone</label>
            <Input
              id="parent-phone"
              name="parentPhone"
              placeholder="Parent Phone"
              value={formData.parentPhone}
              required
              onChange={(e) =>
                setFormData({
                  ...formData,
                  parentPhone: e.target.value,
                })
              }
            />
          </div>

          <div>
            <label htmlFor="parent-email" className="text-xs font-semibold text-slate-500 block mb-1">Parent Email</label>
            <Input
              id="parent-email"
              name="parentEmail"
              type="email"
              placeholder="Parent Email"
              value={formData.parentEmail}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  parentEmail: e.target.value,
                })
              }
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="student-gender" className="text-xs font-semibold text-slate-500">Gender</label>
            <select
              id="student-gender"
              name="gender"
              value={formData.gender}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  gender: e.target.value,
                })
              }
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white transition-all text-slate-700"
            >
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>
          </div>

          {isAdmin && (
            <div className="space-y-1">
              <label htmlFor="assigned-teacher" className="text-xs font-semibold text-slate-500">Assigned Teacher *</label>
              <select
                id="assigned-teacher"
                name="teacherId"
                value={formData.teacherId}
                required
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    teacherId: e.target.value,
                  })
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white transition-all text-slate-700"
              >
                <option value="">Select Teacher</option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.name} {teacher.classes ? `(${teacher.classes})` : ""}
                  </option>
                ))}
              </select>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Saving...
              </>
            ) : student ? (
              "Save Changes"
            ) : (
              "Save Student"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}