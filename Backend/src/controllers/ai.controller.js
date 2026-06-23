const prisma = require("../config/prisma");
const { generateSummary, generateMeetingAnalysis } = require("../services/gemini.service");
const { createAuditLog } = require("../utils/logger");

const generateMeetingSummary = async (req, res, next) => {
  try {
    const { meetingId } = req.params;
    const { refinementInstruction } = req.body || {};

    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            className: true,
            parentName: true,
            gender: true,
          },
        },
        teacher: {
          select: {
            name: true,
            gender: true,
          },
        },
      },
    });

    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    const analysis = await generateMeetingAnalysis(
      meeting.notes || "",
      meeting.student?.name || "Student",
      meeting.student?.className || "Class",
      meeting.student?.parentName || "Parent",
      meeting.student?.gender || "MALE",
      meeting.teacher?.name || "Teacher",
      meeting.teacher?.gender || "FEMALE",
      refinementInstruction || ""
    );

    // Update meeting and student within a Prisma transaction
    const [updatedMeeting, updatedStudent] = await prisma.$transaction([
      prisma.meeting.update({
        where: { id: meetingId },
        data: {
          aiSummary: analysis.summary,
          riskLevel: analysis.riskLevel || "LOW",
          riskExplanation: analysis.riskExplanation || "",
          followUpActions: analysis.followUpActions ? JSON.stringify(analysis.followUpActions) : null,
        },
      }),
      prisma.student.update({
        where: { id: meeting.studentId },
        data: {
          riskLevel: analysis.riskLevel || "LOW",
          riskExplanation: analysis.riskExplanation || "",
        },
      }),
    ]);

    await createAuditLog(
      req.user.id,
      "SUMMARY_GENERATED",
      updatedMeeting.studentId,
      meetingId,
      { 
        notesSnippet: meeting.notes ? meeting.notes.substring(0, 100) : "",
        refinementUsed: !!refinementInstruction,
        riskLevel: analysis.riskLevel
      }
    );

    res.json(updatedMeeting);
  } catch (error) {
    next(error);
  }
};

const generateNotice = async (req, res, next) => {
  try {
    const { topic, targetAudience = "ALL", noticeType = "General Circular" } = req.body;
    const teacherId = req.teacher?.id || req.user?.id;

    if (!topic) {
      return res.status(400).json({ message: "Topic is required" });
    }

    const { generateNoticeContent } = require("../services/gemini.service");
    const currentDate = new Date().toLocaleDateString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const combinedTopic = `Notice Type: ${noticeType}\nPurpose/Details: ${topic}`;
    const content = await generateNoticeContent(combinedTopic, currentDate);

    // Extract a title from the first line of content
    const lines = content.split("\n").filter((l) => l.trim());
    const title = lines[0].replace(/^#+\s*/, "").replace(/\*\*/g, "").trim() || topic;
    const body = lines.slice(1).join("\n").trim() || content;

    // Save to database if teacher is authenticated
    let notice = null;
    if (teacherId) {
      notice = await prisma.notice.create({
        data: {
          title,
          content: body,
          targetAudience,
          createdById: teacherId,
        },
        include: { createdBy: { select: { id: true, name: true } } },
      });
    }

    if (notice) {
      await createAuditLog(
        req.user.id,
        "NOTICE_GENERATED",
        null,
        null,
        { noticeId: notice.id, title: notice.title }
      );
    }

    res.json({
      success: true,
      title,
      content: body,
      notice,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { generateMeetingSummary, generateNotice };