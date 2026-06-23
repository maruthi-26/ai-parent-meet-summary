const prisma = require("../config/prisma");

function calculateGrowth(current, previous) {
  if (previous === 0) {
    if (current === 0) {
      return {
        growthPercent: 0,
        growthDirection: "none",
        growthText: "0% change compared to last month (no records found)"
      };
    }
    return {
      growthPercent: 100,
      growthDirection: "up",
      growthText: "100% increase compared to last month"
    };
  }
  const diff = current - previous;
  const percentage = Math.abs(Math.round((diff / previous) * 100));
  const direction = diff > 0 ? "up" : diff < 0 ? "down" : "none";
  const term = diff > 0 ? "increase" : diff < 0 ? "decrease" : "change";
  return {
    growthPercent: percentage,
    growthDirection: direction,
    growthText: `${percentage}% ${term} compared to last month`
  };
}

const getTeacherAnalytics = async (req, res, next) => {
  try {
    const { teacherId } = req.params;

    const teacher = await prisma.teacher.findUnique({
      where: { id: teacherId },
      select: { id: true, name: true, email: true, role: true, classes: true },
    });

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    const teacherClasses = teacher.classes
      ? teacher.classes.split(",").map(c => c.trim()).filter(Boolean)
      : [];

    const meetingWhereClause = teacherClasses.length > 0
      ? {
          OR: [
            { teacherId },
            { student: { className: { in: teacherClasses } } }
          ]
        }
      : { teacherId };

    const totalMeetings = await prisma.meeting.count({
      where: meetingWhereClause,
    });

    const totalAiSummaries = await prisma.meeting.count({
      where: {
        ...meetingWhereClause,
        aiSummary: { not: null },
      },
    });

    const totalMessagesSent = await prisma.meeting.count({
      where: {
        ...meetingWhereClause,
        whatsappSent: true,
      },
    });

    // Fetch meetings to build monthly trend dynamically (no pre-initialized fake months)
    const allMeetings = await prisma.meeting.findMany({
      where: meetingWhereClause,
      orderBy: { createdAt: "asc" },
      select: { id: true, aiSummary: true, whatsappSent: true, createdAt: true },
    });

    const monthlyMap = {};
    allMeetings.forEach((m) => {
      const key = m.createdAt.toISOString().slice(0, 7); // "2024-01"
      if (!monthlyMap[key]) {
        monthlyMap[key] = { month: key, meetings: 0, aiSummaries: 0, messagesSent: 0 };
      }
      monthlyMap[key].meetings++;
      if (m.aiSummary) monthlyMap[key].aiSummaries++;
      if (m.whatsappSent) monthlyMap[key].messagesSent++;
    });

    const monthlyTrend = Object.keys(monthlyMap)
      .sort()
      .map((key) => {
        const item = monthlyMap[key];
        return {
          ...item,
          month: new Date(item.month + "-01").toLocaleString("default", {
            month: "short",
            year: "2-digit",
          }),
        };
      });

    // Date intervals for MoM stats
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const meetingsThisMonth = await prisma.meeting.count({
      where: { ...meetingWhereClause, createdAt: { gte: startOfThisMonth } }
    });
    const meetingsLastMonth = await prisma.meeting.count({
      where: { ...meetingWhereClause, createdAt: { gte: startOfLastMonth, lt: startOfThisMonth } }
    });
    const meetingsGrowth = calculateGrowth(meetingsThisMonth, meetingsLastMonth);

    const summariesThisMonth = await prisma.meeting.count({
      where: { ...meetingWhereClause, createdAt: { gte: startOfThisMonth }, aiSummary: { not: null } }
    });
    const summariesLastMonth = await prisma.meeting.count({
      where: { ...meetingWhereClause, createdAt: { gte: startOfLastMonth, lt: startOfThisMonth }, aiSummary: { not: null } }
    });
    const summariesGrowth = calculateGrowth(summariesThisMonth, summariesLastMonth);

    const messagesThisMonth = await prisma.meeting.count({
      where: { ...meetingWhereClause, whatsappSentAt: { gte: startOfThisMonth }, whatsappSent: true }
    });
    const messagesLastMonth = await prisma.meeting.count({
      where: { ...meetingWhereClause, whatsappSentAt: { gte: startOfLastMonth, lt: startOfThisMonth }, whatsappSent: true }
    });
    const messagesGrowth = calculateGrowth(messagesThisMonth, messagesLastMonth);

    // Calculate feedback stats for teacher's meetings
    const feedbackAgg = await prisma.feedback.aggregate({
      _avg: { rating: true },
      _count: { rating: true },
      where: {
        meeting: meetingWhereClause
      }
    });

    const feedbackCount = feedbackAgg._count.rating || 0;
    const avgSatisfaction = feedbackAgg._avg.rating
      ? Math.round((feedbackAgg._avg.rating / 5) * 100)
      : 0;

    res.json({
      teacher,
      totalMeetings,
      totalAiSummaries,
      totalMessagesSent,
      feedbackCount,
      avgSatisfaction,
      monthlyTrend,
      growth: {
        meetings: meetingsGrowth,
        aiSummaries: summariesGrowth,
        messages: messagesGrowth
      }
    });
  } catch (error) {
    next(error);
  }
};

const getAdminAnalytics = async (req, res, next) => {
  try {
    const totalStudents = await prisma.student.count();
    const totalTeachers = await prisma.teacher.count({ where: { role: "TEACHER" } });
    const totalMeetings = await prisma.meeting.count();
    const totalAiSummaries = await prisma.meeting.count({ where: { aiSummary: { not: null } } });
    const totalMessagesSent = await prisma.meeting.count({ where: { whatsappSent: true } });

    // Fetch meetings to build monthly trend dynamically (no pre-initialized fake months)
    const allMeetings = await prisma.meeting.findMany({
      orderBy: { createdAt: "asc" },
      select: { id: true, aiSummary: true, whatsappSent: true, createdAt: true },
    });

    const monthlyMap = {};
    allMeetings.forEach((m) => {
      const key = m.createdAt.toISOString().slice(0, 7);
      if (!monthlyMap[key]) {
        monthlyMap[key] = { month: key, meetings: 0, aiSummaries: 0, messagesSent: 0 };
      }
      monthlyMap[key].meetings++;
      if (m.aiSummary) monthlyMap[key].aiSummaries++;
      if (m.whatsappSent) monthlyMap[key].messagesSent++;
    });

    const monthlyTrend = Object.keys(monthlyMap)
      .sort()
      .map((key) => {
        const item = monthlyMap[key];
        return {
          ...item,
          month: new Date(item.month + "-01").toLocaleString("default", {
            month: "short",
            year: "2-digit",
          }),
        };
      });

    // Fetch feedbacks to build monthly feedback trend dynamically
    const allFeedbacks = await prisma.feedback.findMany({
      orderBy: { createdAt: "asc" },
      select: { rating: true, createdAt: true, sentiment: true }
    });

    const feedbackMonthlyMap = {};
    allFeedbacks.forEach((f) => {
      const key = f.createdAt.toISOString().slice(0, 7);
      if (!feedbackMonthlyMap[key]) {
        feedbackMonthlyMap[key] = { month: key, count: 0, sumRating: 0, positive: 0, neutral: 0, negative: 0 };
      }
      feedbackMonthlyMap[key].count++;
      feedbackMonthlyMap[key].sumRating += f.rating;
      if (f.sentiment === "Positive") feedbackMonthlyMap[key].positive++;
      else if (f.sentiment === "Neutral") feedbackMonthlyMap[key].neutral++;
      else if (f.sentiment === "Negative") feedbackMonthlyMap[key].negative++;
    });

    const feedbackTrend = Object.keys(feedbackMonthlyMap)
      .sort()
      .map((key) => {
        const item = feedbackMonthlyMap[key];
        return {
          month: new Date(item.month + "-01").toLocaleString("default", {
            month: "short",
            year: "2-digit",
          }),
          count: item.count,
          averageRating: parseFloat((item.sumRating / item.count).toFixed(2)),
          positive: item.positive,
          neutral: item.neutral,
          negative: item.negative,
        };
      });

    // Date intervals for MoM stats
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const studentsThisMonth = await prisma.student.count({
      where: { createdAt: { gte: startOfThisMonth } }
    });
    const studentsLastMonth = await prisma.student.count({
      where: { createdAt: { gte: startOfLastMonth, lt: startOfThisMonth } }
    });
    const studentsGrowth = calculateGrowth(studentsThisMonth, studentsLastMonth);

    const teachersThisMonth = await prisma.teacher.count({
      where: { role: "TEACHER", createdAt: { gte: startOfThisMonth } }
    });
    const teachersLastMonth = await prisma.teacher.count({
      where: { role: "TEACHER", createdAt: { gte: startOfLastMonth, lt: startOfThisMonth } }
    });
    const teachersGrowth = calculateGrowth(teachersThisMonth, teachersLastMonth);

    const meetingsThisMonth = await prisma.meeting.count({
      where: { createdAt: { gte: startOfThisMonth } }
    });
    const meetingsLastMonth = await prisma.meeting.count({
      where: { createdAt: { gte: startOfLastMonth, lt: startOfThisMonth } }
    });
    const meetingsGrowth = calculateGrowth(meetingsThisMonth, meetingsLastMonth);

    const summariesThisMonth = await prisma.meeting.count({
      where: { createdAt: { gte: startOfThisMonth }, aiSummary: { not: null } }
    });
    const summariesLastMonth = await prisma.meeting.count({
      where: { createdAt: { gte: startOfLastMonth, lt: startOfThisMonth }, aiSummary: { not: null } }
    });
    const summariesGrowth = calculateGrowth(summariesThisMonth, summariesLastMonth);

    const messagesThisMonth = await prisma.meeting.count({
      where: { whatsappSentAt: { gte: startOfThisMonth }, whatsappSent: true }
    });
    const messagesLastMonth = await prisma.meeting.count({
      where: { whatsappSentAt: { gte: startOfLastMonth, lt: startOfThisMonth }, whatsappSent: true }
    });
    const messagesGrowth = calculateGrowth(messagesThisMonth, messagesLastMonth);

    // Teacher performance
    const teacherStats = await prisma.teacher.findMany({
      where: { role: "TEACHER" },
      include: {
        meetings: {
          include: {
            feedback: true,
          },
        },
      },
    });

    const teacherPerformance = teacherStats.map((t) => {
      const meetings = t.meetings;
      const totalMeetings = meetings.length;
      const aiSummaries = meetings.filter((m) => m.aiSummary).length;
      const messagesSent = meetings.filter((m) => m.whatsappSent).length;
      
      const feedbacks = meetings.filter((m) => m.feedback).map((m) => m.feedback);
      const feedbackCount = feedbacks.length;
      
      const satisfactionSum = feedbacks.reduce((sum, f) => sum + f.rating, 0);
      const averageSatisfaction = feedbackCount > 0
        ? parseFloat((satisfactionSum / feedbackCount).toFixed(2))
        : 0;
        
      const responseRate = totalMeetings > 0
        ? parseFloat(((feedbackCount / totalMeetings) * 100).toFixed(1))
        : 0;
        
      const followUpsPending = meetings.filter((m) => m.meetingStatus === "Follow-Up Required").length;

      return {
        id: t.id,
        name: t.name,
        meetings: totalMeetings,
        aiSummaries,
        messagesSent,
        feedbackCount,
        averageSatisfaction,
        responseRate,
        followUpsPending,
      };
    });

    const teachersWithFeedback = teacherPerformance.filter((t) => t.feedbackCount > 0);
    const teachersWithMeetings = teacherPerformance.filter((t) => t.meetings > 0);

    const highestSatisfaction = teachersWithFeedback.length > 0
      ? [...teachersWithFeedback].sort((a, b) => b.averageSatisfaction - a.averageSatisfaction)[0]
      : null;

    const mostMeetings = teachersWithMeetings.length > 0
      ? [...teachersWithMeetings].sort((a, b) => b.meetings - a.meetings)[0]
      : null;

    const bestResponseRate = teachersWithMeetings.length > 0
      ? [...teachersWithMeetings].sort((a, b) => b.responseRate - a.responseRate)[0]
      : null;

    res.json({
      totalStudents,
      totalTeachers,
      totalMeetings,
      totalAiSummaries,
      totalMessagesSent,
      monthlyTrend,
      feedbackTrend,
      teacherPerformance,
      rankings: {
        highestSatisfaction,
        mostMeetings,
        bestResponseRate,
      },
      growth: {
        students: studentsGrowth,
        teachers: teachersGrowth,
        meetings: meetingsGrowth,
        aiSummaries: summariesGrowth,
        messages: messagesGrowth
      }
    });
  } catch (error) {
    next(error);
  }
};

const getActivityFeed = async (req, res, next) => {
  try {
    const queryOptions = {
      take: 20,
      orderBy: { createdAt: "desc" },
      include: {
        student: { select: { name: true } },
        teacher: { select: { name: true } },
      },
    };

    if (req.user.role === "TEACHER") {
      const teacher = await prisma.teacher.findUnique({
        where: { id: req.user.id },
        select: { classes: true }
      });
      const teacherClasses = teacher?.classes
        ? teacher.classes.split(",").map(c => c.trim()).filter(Boolean)
        : [];
      
      if (teacherClasses.length > 0) {
        queryOptions.where = {
          OR: [
            { teacherId: req.user.id },
            { student: { className: { in: teacherClasses } } }
          ]
        };
      } else {
        queryOptions.where = {
          teacherId: req.user.id,
        };
      }
    }

    const recentMeetings = await prisma.meeting.findMany(queryOptions);

    const activities = [];

    recentMeetings.forEach((m) => {
      activities.push({
        id: `meeting-${m.id}`,
        type: "MEETING_CREATED",
        title: "Meeting Created",
        description: `${m.teacher?.name} met with ${m.student?.name}'s parent`,
        timestamp: m.createdAt,
        icon: "calendar",
        color: "orange",
      });

      if (m.aiSummary) {
        activities.push({
          id: `ai-${m.id}`,
          type: "AI_SUMMARY",
          title: "AI Summary Generated",
          description: `AI summary created for ${m.student?.name}'s meeting`,
          timestamp: m.createdAt,
          icon: "bot",
          color: "purple",
        });
      }

      if (m.whatsappSent && m.whatsappSentAt) {
        activities.push({
          id: `whatsapp-${m.id}`,
          type: "MESSAGE_SENT",
          title: "Message Sent to Parent",
          description: `Summary shared with ${m.student?.name}'s parent`,
          timestamp: m.whatsappSentAt,
          icon: "message",
          color: "green",
        });
      }
    });

    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json(activities.slice(0, 30));
  } catch (error) {
    next(error);
  }
};

const getReminders = async (req, res, next) => {
  try {
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Build where clause based on role
    let meetingWhereBase = {};
    if (req.user.role === "TEACHER") {
      const teacher = await prisma.teacher.findUnique({
        where: { id: req.user.id },
        select: { classes: true }
      });
      const teacherClasses = teacher?.classes
        ? teacher.classes.split(",").map(c => c.trim()).filter(Boolean)
        : [];

      if (teacherClasses.length > 0) {
        meetingWhereBase = {
          OR: [
            { teacherId: req.user.id },
            { student: { className: { in: teacherClasses } } }
          ]
        };
      } else {
        meetingWhereBase = { teacherId: req.user.id };
      }
    }

    // 1. Pending Follow-Ups: meetings with status "Follow-Up Required"
    const pendingFollowUps = await prisma.meeting.findMany({
      where: { ...meetingWhereBase, meetingStatus: "Follow-Up Required" },
      include: {
        student: { select: { id: true, name: true, className: true, parentName: true, parentPhone: true } },
        teacher: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: "desc" },
      take: 10
    });

    // 2. Feedback Awaiting: Completed meetings (with ai summary sent) with no feedback yet
    const feedbackAwaiting = await prisma.meeting.findMany({
      where: {
        ...meetingWhereBase,
        whatsappSent: true,
        feedback: null
      },
      include: {
        student: { select: { id: true, name: true, className: true, parentName: true } },
        teacher: { select: { id: true, name: true } }
      },
      orderBy: { whatsappSentAt: "desc" },
      take: 10
    });

    // 3. Upcoming Scheduled Meetings: meetingDate is set and within next 7 days
    const upcomingMeetings = await prisma.meeting.findMany({
      where: {
        ...meetingWhereBase,
        meetingStatus: "Scheduled",
        meetingDate: { not: null }
      },
      include: {
        student: { select: { id: true, name: true, className: true, parentName: true } },
        teacher: { select: { id: true, name: true } }
      },
      orderBy: { meetingDate: "asc" },
      take: 10
    });

    res.json({
      pendingFollowUps,
      feedbackAwaiting,
      upcomingMeetings,
      summary: {
        followUpsCount: pendingFollowUps.length,
        feedbackAwaitingCount: feedbackAwaiting.length,
        upcomingCount: upcomingMeetings.length,
        totalActionsRequired: pendingFollowUps.length + feedbackAwaiting.length
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getTeacherAnalytics, getAdminAnalytics, getActivityFeed, getReminders };
