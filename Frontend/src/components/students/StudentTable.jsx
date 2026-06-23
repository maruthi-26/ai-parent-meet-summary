import { useState } from "react";
import { Link } from "react-router-dom";
import { Edit2, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import AddStudentDialog from "./AddStudentDialog";
import api from "../../services/api";
import toast from "react-hot-toast";

export default function StudentTable({
  students,
  onStudentChanged,
}) {
  const [editingStudent, setEditingStudent] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this student? All associated meetings and satisfaction feedback will be permanently deleted.")) {
      return;
    }
    const toastId = toast.loading("Deleting student...");
    try {
      await api.delete(`/students/${id}`);
      toast.success("Student deleted successfully", { id: toastId });
      if (onStudentChanged) onStudentChanged();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete student", { id: toastId });
    }
  };

  return (
    <div className="border rounded-lg bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Class</TableHead>
            <TableHead>Teacher</TableHead>
            <TableHead>Parent</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Email</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {students.map((student) => (
            <TableRow key={student.id}>
              <TableCell className="font-semibold text-slate-800">
                <Link to={`/students/${student.id}`} className="text-orange-500 hover:text-orange-600 hover:underline transition-colors">
                  {student.name}
                </Link>
              </TableCell>

              <TableCell>
                {student.className}
              </TableCell>

              <TableCell>
                {student.teacher?.name || <span className="text-slate-300 italic">Unassigned</span>}
              </TableCell>

              <TableCell>
                {student.parentName}
              </TableCell>

              <TableCell>
                {student.parentPhone}
              </TableCell>

              <TableCell>
                {student.parentEmail || <span className="text-slate-300 italic">No email</span>}
              </TableCell>

              <TableCell className="text-right">
                <div className="flex justify-end gap-1.5">
                  <button
                    onClick={() => {
                      setEditingStudent(student);
                      setIsEditDialogOpen(true);
                    }}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                    title="Edit Student"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(student.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                    title="Delete Student"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AddStudentDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        student={editingStudent}
        onStudentCreated={onStudentChanged}
      />
    </div>
  );
}