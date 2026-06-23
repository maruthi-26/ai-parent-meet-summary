import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { Button } from "../ui/button";
import toast from "react-hot-toast";
import jsPDF from "jspdf";

export default function SummaryDialog({
  open,
  onOpenChange,
  summary,
  studentName = "Student",
}) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      toast.success("Summary copied to clipboard!");
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.setTextColor(255, 107, 53);
      doc.text("FirstCry Intellitots — Parent Summary", 14, 20);
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Student: ${studentName}`, 14, 28);
      doc.text(`Generated: ${new Date().toLocaleDateString("en-IN")}`, 14, 34);

      doc.setFontSize(11);
      doc.setTextColor(50);
      const splitText = doc.splitTextToSize(summary, 180);
      doc.text(splitText, 14, 46);

      doc.save(`summary-${studentName.replace(/\s+/g, "-").toLowerCase()}.pdf`);
      toast.success("Summary PDF downloaded!");
    } catch {
      toast.error("Failed to download PDF");
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="max-w-2xl rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-slate-800 font-bold">
            AI Parent Summary — {studentName}
          </DialogTitle>
          <DialogDescription className="sr-only">
            View or copy the AI parent summary for this student.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-slate-600 bg-slate-50 p-5 rounded-2xl border border-slate-100 max-h-[400px] overflow-y-auto">
          {summary}
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <Button
            variant="outline"
            onClick={handleExportPDF}
            className="rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            Export PDF
          </Button>
          <Button
            onClick={handleCopy}
            className="bg-brand-gradient text-white hover:opacity-90 rounded-xl"
          >
            Copy Summary
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}