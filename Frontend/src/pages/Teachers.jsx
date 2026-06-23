import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { UserCog, Search, Mail, FileText, BookOpen, Edit2, Trash2 } from "lucide-react";
import DashboardLayout from "../layouts/DashboardLayout";
import PageHeader from "../components/ui/PageHeader";
import { SkeletonCard } from "../components/ui/LoadingSpinner";
import EmptyState from "../components/ui/EmptyState";
import AddTeacherDialog from "../components/teachers/AddTeacherDialog";
import api from "../services/api";
import toast from "react-hot-toast";

export default function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const fetchTeachers = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/teachers");
      setTeachers(response.data);
    } catch {
      toast.error("Failed to load teachers");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user? All associated meetings and notices will be permanently deleted, and students will be unassigned.")) {
      return;
    }
    const toastId = toast.loading("Deleting user...");
    try {
      await api.delete(`/teachers/${id}`);
      toast.success("User deleted successfully", { id: toastId });
      fetchTeachers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete user", { id: toastId });
    }
  };

  const filtered = teachers.filter(
    (t) =>
      t.name?.toLowerCase().includes(search.toLowerCase()) ||
      t.email?.toLowerCase().includes(search.toLowerCase())
  );

  const GRADIENT_COLORS = [
    "bg-brand-gradient", "bg-teal-gradient", "bg-purple-gradient", "bg-amber-gradient", "bg-blue-gradient",
  ];

  return (
    <DashboardLayout>
      <PageHeader
        title="Teachers"
        subtitle={`${teachers.length} team members`}
        icon={UserCog}
        action={<AddTeacherDialog onTeacherCreated={fetchTeachers} />}
      />

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="relative mb-6"
      >
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white transition-all"
        />
      </motion.div>

      {isLoading ? (
        <div className="grid md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : teachers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
          <EmptyState
            title="No users yet"
            description="Add your first teacher or admin to start managing the school."
            illustration="students"
            action={<AddTeacherDialog onTeacherCreated={fetchTeachers} />}
          />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
          <EmptyState title="No results" description={`No users match "${search}"`} illustration="students" />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((teacher, i) => (
            <motion.div
              key={teacher.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 card-hover flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={`w-12 h-12 rounded-xl ${GRADIENT_COLORS[i % GRADIENT_COLORS.length]} flex items-center justify-center text-white text-lg font-bold shadow-sm flex-shrink-0`}>
                      {teacher.name?.[0]?.toUpperCase() || "T"}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-800 truncate">{teacher.name}</h3>
                      <span className={teacher.role === "ADMIN" ? "badge-admin" : "badge-teacher"}>
                        {teacher.role}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => {
                        setEditingTeacher(teacher);
                        setIsEditDialogOpen(true);
                      }}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                      title="Edit User"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(teacher.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                      title="Delete User"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Mail size={12} className="flex-shrink-0" />
                    <span className="truncate">{teacher.email}</span>
                  </div>
                  {teacher.classes && (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <BookOpen size={12} className="flex-shrink-0" />
                      <span className="truncate">Classes: {teacher.classes}</span>
                    </div>
                  )}
                  {teacher._count?.meetings !== undefined && (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <FileText size={12} />
                      <span>{teacher._count.meetings} meetings</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${teacher.isActive !== false ? "bg-teal-50 text-teal-600" : "bg-slate-100 text-slate-400"}`}>
                  {teacher.isActive !== false ? "Active" : "Inactive"}
                </span>
                <span className="text-xs text-slate-400">
                  {new Date(teacher.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AddTeacherDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        teacher={editingTeacher}
        onTeacherCreated={fetchTeachers}
      />
    </DashboardLayout>
  );
}