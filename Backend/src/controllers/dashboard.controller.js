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

const getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // 1. Total & Monthly Students Count
    const studentsTotal = await prisma.student.count();
    const studentsThisMonth = await prisma.student.count({
      where: { createdAt: { gte: startOfThisMonth } }
    });
    const studentsLastMonth = await prisma.student.count({
      where: { createdAt: { gte: startOfLastMonth, lt: startOfThisMonth } }
    });
    const studentsGrowth = calculateGrowth(studentsThisMonth, studentsLastMonth);

    // 2. Total & Monthly Meetings Count
    const meetingsTotal = await prisma.meeting.count();
    const meetingsThisMonth = await prisma.meeting.count({
      where: { createdAt: { gte: startOfThisMonth } }
    });
    const meetingsLastMonth = await prisma.meeting.count({
      where: { createdAt: { gte: startOfLastMonth, lt: startOfThisMonth } }
    });
    const meetingsGrowth = calculateGrowth(meetingsThisMonth, meetingsLastMonth);

    // 3. Total & Monthly AI Summaries Count
    const aiSummariesTotal = await prisma.meeting.count({
      where: { aiSummary: { not: null } }
    });
    const aiSummariesThisMonth = await prisma.meeting.count({
      where: { createdAt: { gte: startOfThisMonth }, aiSummary: { not: null } }
    });
    const aiSummariesLastMonth = await prisma.meeting.count({
      where: { createdAt: { gte: startOfLastMonth, lt: startOfThisMonth }, aiSummary: { not: null } }
    });
    const aiSummariesGrowth = calculateGrowth(aiSummariesThisMonth, aiSummariesLastMonth);

    // 4. Total & Monthly Messages Sent Count (whatsappSent)
    const messagesTotal = await prisma.meeting.count({
      where: { whatsappSent: true }
    });
    const messagesThisMonth = await prisma.meeting.count({
      where: { whatsappSentAt: { gte: startOfThisMonth }, whatsappSent: true }
    });
    const messagesLastMonth = await prisma.meeting.count({
      where: { whatsappSentAt: { gte: startOfLastMonth, lt: startOfThisMonth }, whatsappSent: true }
    });
    const messagesGrowth = calculateGrowth(messagesThisMonth, messagesLastMonth);

    // 5. Total Teachers (role: TEACHER)
    const teachersTotal = await prisma.teacher.count({
      where: { role: "TEACHER" }
    });

    // 6. Active Teachers (teachers with at least 1 meeting)
    const activeTeachersCount = await prisma.teacher.count({
      where: { role: "TEACHER", meetings: { some: {} } }
    });

    // 7. Average Meetings Per Teacher
    const averageMeetingsPerTeacher = teachersTotal > 0
      ? parseFloat((meetingsTotal / teachersTotal).toFixed(1))
      : 0;

    // 8. Most Active Teacher
    const teachersList = await prisma.teacher.findMany({
      where: { role: "TEACHER" },
      include: { meetings: { select: { id: true } } }
    });

    let mostActiveTeacher = null;
    let maxMeetings = 0;
    teachersList.forEach(t => {
      if (t.meetings.length > maxMeetings) {
        maxMeetings = t.meetings.length;
        mostActiveTeacher = {
          name: t.name,
          meetingsCount: maxMeetings
        };
      }
    });

    // 9. Parent Satisfaction Rating Average (Percent) and Total Feedback Received
    const feedbackAgg = await prisma.feedback.aggregate({
      _avg: { rating: true },
      _count: { rating: true }
    });
    const totalFeedbackReceived = feedbackAgg._count.rating || 0;
    
    let avgSatisfactionPercent = 0;
    if (totalFeedbackReceived > 0) {
      avgSatisfactionPercent = Math.round((feedbackAgg._avg.rating / 5) * 100);
    } else {
      // Fallback to meeting satisfaction rating
      const satisfactionAgg = await prisma.meeting.aggregate({
        _avg: { satisfactionRating: true },
        where: { satisfactionRating: { not: null } }
      });
      avgSatisfactionPercent = satisfactionAgg._avg.satisfactionRating
        ? Math.round((satisfactionAgg._avg.satisfactionRating / 5) * 100)
        : 0;
    }

    // Counts by sentiment
    const positiveFeedbackCount = await prisma.feedback.count({ where: { sentiment: "Positive" } });
    const neutralFeedbackCount = await prisma.feedback.count({ where: { sentiment: "Neutral" } });
    const negativeFeedbackCount = await prisma.feedback.count({ where: { sentiment: "Negative" } });

    // Follow-ups Required (meetings with status "Follow-Up Required")
    const followUpsRequiredCount = await prisma.meeting.count({
      where: { meetingStatus: "Follow-Up Required" }
    });

    // 10. Most Improved Student Calculation
    const studentsWithMeetings = await prisma.student.findMany({
      include: {
        meetings: {
          orderBy: { createdAt: "asc" }
        }
      }
    });

    let mostImprovedStudent = null;
    let bestImprovement = -999;

    studentsWithMeetings.forEach(student => {
      if (student.meetings.length < 2) return;
      const first = student.meetings[0];
      const latest = student.meetings[student.meetings.length - 1];
      
      const riskScores = { HIGH: 3, MEDIUM: 2, LOW: 1 };
      const firstRiskScore = riskScores[first.riskLevel?.toUpperCase()] || 1;
      const latestRiskScore = riskScores[latest.riskLevel?.toUpperCase()] || 1;
      const riskImprovement = firstRiskScore - latestRiskScore;
      
      const firstSatisfaction = first.satisfactionRating || 3;
      const latestSatisfaction = latest.satisfactionRating || 3;
      const satisfactionImprovement = latestSatisfaction - firstSatisfaction;
      
      const improvementScore = (riskImprovement * 2) + satisfactionImprovement;
      
      if (improvementScore > bestImprovement && improvementScore > 0) {
        bestImprovement = improvementScore;
        let improvementText = "";
        if (riskImprovement > 0) {
          improvementText += `Development risk reduced from ${first.riskLevel} to ${latest.riskLevel}. `;
        }
        if (satisfactionImprovement > 0) {
          improvementText += `Parent satisfaction score increased by ${satisfactionImprovement} points.`;
        }
        if (!improvementText) {
          improvementText = "Steady progression and consistent school attendance.";
        }
        mostImprovedStudent = {
          name: student.name,
          improvement: improvementText
        };
      }
    });

    // 11. AI insights (scanned dynamically from notes and summaries)
    const concernKeywords = ["focus", "pencil", "writing", "numbers", "sharing", "listening", "shyness", "speaking", "language", "socializing", "tantrums", "attention"];
    const strengthKeywords = ["drawing", "math", "reading", "friendly", "creative", "helping", "counting", "singing", "participating", "polite", "verbal", "athletic"];
    const concernCounts = {};
    const strengthCounts = {};
    
    const allMeetingsForInsights = await prisma.meeting.findMany({
      select: { notes: true, aiSummary: true }
    });

    allMeetingsForInsights.forEach(m => {
      const text = `${m.notes || ""} ${m.aiSummary || ""}`.toLowerCase();
      concernKeywords.forEach(word => {
        if (text.includes(word)) {
          concernCounts[word] = (concernCounts[word] || 0) + 1;
        }
      });
      strengthKeywords.forEach(word => {
        if (text.includes(word)) {
          strengthCounts[word] = (strengthCounts[word] || 0) + 1;
        }
      });
    });

    let mostCommonConcern = "Pencil grip and active listening";
    let maxConcernCount = 0;
    Object.keys(concernCounts).forEach(word => {
      if (concernCounts[word] > maxConcernCount) {
        maxConcernCount = concernCounts[word];
        mostCommonConcern = `Focusing on ${word} exercises`;
      }
    });

    let mostCommonStrength = "Creative participation and social play";
    let maxStrengthCount = 0;
    Object.keys(strengthCounts).forEach(word => {
      if (strengthCounts[word] > maxStrengthCount) {
        maxStrengthCount = strengthCounts[word];
        mostCommonStrength = `Excellent skills in ${word}`;
      }
    });

    const studentsRequiringAttention = await prisma.student.count({
      where: { riskLevel: "HIGH" }
    });

    // 12. Recent Meetings
    const recentMeetings = await prisma.meeting.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        student: true,
        teacher: true,
      },
    });

    // 13. Progression alerts
    const riskAlerts = await prisma.student.findMany({
      where: { riskLevel: { in: ["MEDIUM", "HIGH"] } },
      select: {
        id: true,
        name: true,
        className: true,
        riskLevel: true,
        riskExplanation: true,
        teacher: { select: { name: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: 5,
    });

    // 14. Teacher Performance
    const teacherStats = teachersList.map(t => ({
      id: t.id,
      name: t.name,
      meetings: t.meetings.length,
      aiSummaries: t.meetings.filter(m => m.aiSummary).length,
      whatsappSent: t.meetings.filter(m => m.whatsappSent).length,
    }));

    res.json({
      summary: {
        students: {
          value: studentsTotal,
          thisMonth: studentsThisMonth,
          lastMonth: studentsLastMonth,
          growthPercent: studentsGrowth.growthPercent,
          growthDirection: studentsGrowth.growthDirection,
          growthText: studentsGrowth.growthText
        },
        meetings: {
          value: meetingsTotal,
          thisMonth: meetingsThisMonth,
          lastMonth: meetingsLastMonth,
          growthPercent: meetingsGrowth.growthPercent,
          growthDirection: meetingsGrowth.growthDirection,
          growthText: meetingsGrowth.growthText
        },
        aiSummaries: {
          value: aiSummariesTotal,
          thisMonth: aiSummariesThisMonth,
          lastMonth: aiSummariesLastMonth,
          growthPercent: aiSummariesGrowth.growthPercent,
          growthDirection: aiSummariesGrowth.growthDirection,
          growthText: aiSummariesGrowth.growthText
        },
        whatsappSent: {
          value: messagesTotal,
          thisMonth: messagesThisMonth,
          lastMonth: messagesLastMonth,
          growthPercent: messagesGrowth.growthPercent,
          growthDirection: messagesGrowth.growthDirection,
          growthText: messagesGrowth.growthText
        }
      },
      teachers: {
        total: teachersTotal,
        active: activeTeachersCount,
        averageMeetings: averageMeetingsPerTeacher,
        mostActive: mostActiveTeacher || { name: "None", meetingsCount: 0 }
      },
      parentSatisfaction: {
        percentage: avgSatisfactionPercent,
        totalRatings: totalFeedbackReceived,
        positiveCount: positiveFeedbackCount,
        neutralCount: neutralFeedbackCount,
        negativeCount: negativeFeedbackCount,
        followUpsRequired: followUpsRequiredCount
      },
      mostImprovedStudent: mostImprovedStudent || { name: "All Students", improvement: "All students maintaining steady developmental paths." },
      aiInsights: {
        mostCommonConcern,
        mostCommonStrength,
        studentsRequiringAttention
      },
      recentMeetings,
      riskAlerts,
      teacherStats
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  getDashboardStats,
};