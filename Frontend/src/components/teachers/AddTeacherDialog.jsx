import { useState, useEffect } from "react";
import api from "../../services/api";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "../ui/dialog";

export default function AddTeacherDialog({
  onTeacherCreated,
  teacher = null,
  open: externalOpen,
  onOpenChange: externalOnOpenChange,
  trigger,
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = externalOpen !== undefined ? externalOpen : internalOpen;
  const setIsOpen = externalOnOpenChange !== undefined ? externalOnOpenChange : setInternalOpen;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    classes: "",
    role: "TEACHER",
    gender: "FEMALE",
  });

  useEffect(() => {
    if (teacher) {
      setFormData({
        name: teacher.name || "",
        email: teacher.email || "",
        password: "",
        classes: teacher.classes || "",
        role: teacher.role || "TEACHER",
        gender: teacher.gender || "FEMALE",
      });
    } else {
      setFormData({
        name: "",
        email: "",
        password: "",
        classes: "",
        role: "TEACHER",
        gender: "FEMALE",
      });
    }
  }, [teacher, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const toastId = toast.loading(teacher ? "Saving user changes..." : "Creating user...");

    try {
      const payload = {
        ...formData,
        classes: formData.role === "ADMIN" ? "" : formData.classes,
      };

      if (teacher) {
        await api.patch(`/teachers/${teacher.id}`, payload);
        toast.success("User updated successfully!", { id: toastId });
      } else {
        await api.post("/teachers", payload);
        toast.success("User created successfully!", { id: toastId });
      }

      onTeacherCreated();
      setIsOpen(false);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to save user", { id: toastId });
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
          <Button>Add User</Button>
        </DialogTrigger>
      ) : null}

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{teacher ? "Edit User" : "Add User"}</DialogTitle>
          <DialogDescription className="sr-only">
            Provide details of the user and assign roles and classes.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Name"
            value={formData.name}
            required
            onChange={(e) =>
              setFormData({
                ...formData,
                name: e.target.value,
              })
            }
          />

          <Input
            placeholder="Email"
            type="email"
            value={formData.email}
            required
            onChange={(e) =>
              setFormData({
                ...formData,
                email: e.target.value,
              })
            }
          />

          <Input
            type="password"
            placeholder={teacher ? "Password (leave blank to keep current)" : "Password"}
            value={formData.password}
            required={!teacher}
            onChange={(e) =>
              setFormData({
                ...formData,
                password: e.target.value,
              })
            }
          />

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500">Role</label>
            <select
              value={formData.role}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  role: e.target.value,
                })
              }
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white transition-all text-slate-700"
            >
              <option value="TEACHER">Teacher</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500">Gender</label>
            <select
              value={formData.gender}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  gender: e.target.value,
                })
              }
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white transition-all text-slate-700"
            >
              <option value="FEMALE">Female</option>
              <option value="MALE">Male</option>
            </select>
          </div>

          {formData.role === "TEACHER" && (
            <Input
              placeholder="Assigned Classes (e.g. Nursery, LKG, UKG)"
              value={formData.classes}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  classes: e.target.value,
                })
              }
            />
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Saving...
              </>
            ) : teacher ? (
              "Save Changes"
            ) : (
              "Create User"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}