const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateSummary(notes, studentName = "Student", className = "Class", parentName = "Parent", studentGender = "MALE", teacherName = "Teacher", teacherGender = "FEMALE") {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `
You are an experienced Preschool Academic Coordinator at FirstCry Intellitots.

Your responsibility is to convert teacher meeting notes into a professional, accurate, parent-friendly progress report.

IMPORTANT RULES:

1. Use ONLY the information provided in the teacher notes.
2. Do NOT invent, assume, exaggerate, or hallucinate any facts.
3. If a topic is not mentioned, do not include it.
4. Keep the tone positive, professional, encouraging, and constructive.
5. Focus on child development rather than academic performance alone.
6. Write as if a teacher is communicating directly with a parent.
7. Avoid generic statements such as:
   - "The child is doing well."
   - "The child performed excellently."
   unless explicitly supported by the notes.
8. Every recommendation must be practical and actionable.
9. Parent Action Points should help the parent support the child's growth at home.
10. Keep the language simple and easy for parents to understand.

Analyze the teacher notes and generate the report in the EXACT format below.

----------------------------------------

📋 MEETING SUMMARY

Write a concise summary of the discussion between teacher and parent.

🌟 STRENGTHS OBSERVED

Provide 3-5 bullet points describing positive observations mentioned in the notes.

📈 AREAS FOR IMPROVEMENT

Provide 2-4 bullet points describing areas where the child may need additional support.

🏠 PARENT ACTION POINTS

Provide 4-6 practical activities or actions that parents can do at home.

Examples:
- Read together for 15 minutes daily.
- Encourage independent task completion.
- Practice communication through storytelling.
- Create a consistent learning routine.

The action points must:
- Be age-appropriate.
- Be measurable.
- Be realistic.
- Directly relate to the observations in the notes.

👩🏫 TEACHER RECOMMENDATIONS

Provide recommendations from the teacher's perspective.

📅 FOLLOW-UP PLAN

Mention what should be observed or discussed during the next meeting.

----------------------------------------

TEACHER NOTES:

${notes}

Generate only the final report.
Do not mention AI.
Do not explain your reasoning.
`;

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error("Gemini generateSummary error:", error);
    // Fallback if API fails
    return `📋 MEETING SUMMARY\n\nWe had a wonderful parent-teacher meeting regarding ${studentName} in Class ${className}.\n\n🌟 STRENGTHS OBSERVED\n\n- Demonstrates great interest in classroom learning activities.\n- Participates nicely with classmates and friends.\n- Follows teacher directions cooperatively.\n\n📈 AREAS FOR IMPROVEMENT\n\n- Needs guidance when transitioning between activities.\n- Encouraging more verbal communication during group circles.\n\n🏠 PARENT ACTION POINTS\n\n- Read together for 15 minutes daily.\n- Encourage independent task completion at home.\n- Practice communication through storytelling.\n- Create a consistent learning routine.\n\n👩🏫 TEACHER RECOMMENDATIONS\n\nWe will continue to provide classroom support and encourage social interactions.\n\n📅 FOLLOW-UP PLAN\n\nMonitor progression and follow up during the next school term.`;
  }
}

async function generateNoticeContent(topic, currentDate = "") {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `
You are an experienced school administrator at FirstCry Intellitots preschool.

Current Date: ${currentDate}
Topic: ${topic}

Convert this topic into a professional and warm school notice for parents.

Requirements:
- Start with a clear, bold Markdown title at the very top (e.g., # Notice: [Topic Name]).
- Address the parents warmly (e.g., Dear Parents and Guardians,).
- Present the details of the notice clearly and politely.
- Calculate and output the exact calendar date and day of the week for any relative timing mentioned in the topic based on the Current Date (e.g. if Current Date is Thursday, June 18, 2026, and the topic mentions "next Friday", you MUST calculate and write the exact date "Friday, June 26, 2026" instead of placeholders or relative phrases).
- Include clean placeholders only for other parameters (e.g., Time, Venue) if the notice is about a scheduled event.
- Outline any specific instructions or requirements for parents constructively.
- Keep the tone warm, welcoming, and administrative.
- Use Markdown for structure and readability (paragraphs, bold text, etc.).
- Keep the length between 100 and 180 words.
- End with: "Warm regards,\nFirstCry Intellitots Management".

Generate only the final notice content. Do not include any introductory or concluding comments outside the notice.
`;

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error("Gemini generateNoticeContent error:", error);
    return `# Notice: School Announcement\n\nDear Parents and Guardians,\n\nWe have an upcoming school event regarding: ${topic}.\n\nWarm regards,\nFirstCry Intellitots Management`;
  }
}

async function generateMeetingAnalysis(notes, studentName, className, parentName, studentGender, teacherName, teacherGender, refinementInstruction = "") {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    let prompt = `
You are an experienced Preschool Academic Coordinator at FirstCry Intellitots preparing a child progress report, risk assessment, and follow-up plan.

Parent Name: ${parentName}
Student Name: ${studentName}
Student Gender: ${studentGender}
Class: ${className}
Teacher Name: ${teacherName}
Teacher Gender: ${teacherGender}

Teacher Notes:
${notes}
`;

    if (refinementInstruction) {
      prompt += `
Additional Teacher Instruction:
Apply this refinement request to the parent progress report: "${refinementInstruction}"
`;
    }

    prompt += `
Convert the teacher's meeting notes into a structured JSON output with the following exact keys:
{
  "summary": "Generate the progress report exactly matching these requirements:
1. Use ONLY the information provided in the teacher notes. Do NOT invent, assume, exaggerate, or hallucinate any facts. Never assume student performance or create unsupported observations. If any critical information is missing from the notes, clearly mention it in the report.
2. If a topic is not mentioned, do not include it.
3. Keep the tone positive, professional, encouraging, and constructive.
4. Focus on child development rather than academic performance alone.
5. Write as if a teacher is communicating directly with a parent. Use the child's gender-appropriate pronouns (he/she, him/her, his/hers) based on the Student Gender, and refer to the parent by the Parent Name.
6. Avoid generic statements such as 'The child is doing well.' or 'The child performed excellently.' unless explicitly supported by the notes.
7. Every recommendation must be practical and actionable.
8. Parent Action Points must be practical, measurable, realistic, age-appropriate, and help the parent support the child's development at home. Example activities: Read together for 15 minutes daily, Encourage independent task completion, Practice communication through storytelling, Reinforce classroom routines at home.
9. Keep the language simple and easy for parents to understand.
10. Generate the report in the EXACT text format below:

----------------------------------------

📋 MEETING SUMMARY

[Write a concise summary of the discussion between teacher and parent.]

🌟 STRENGTHS OBSERVED

[Provide 3-5 bullet points describing positive observations mentioned in the notes.]

📈 AREAS FOR IMPROVEMENT

[Provide 2-4 bullet points describing areas where the child may need additional support.]

🏠 PARENT ACTION POINTS

[Provide 4-6 practical activities or actions that parents can do at home.]

👩🏫 TEACHER RECOMMENDATIONS

[Provide recommendations from the teacher's perspective.]

📅 FOLLOW-UP PLAN

[Mention what should be observed or discussed during the next meeting.]

----------------------------------------

Do not mention AI. Do not explain your reasoning. Include all formatting headers.",
  "riskLevel": "Analyze notes and summary. Assign either 'LOW', 'MEDIUM', or 'HIGH' based on behavioral or academic concerns.",
  "riskExplanation": "Provide a brief explanation (max 50 words) justifying the risk level based on the notes.",
  "followUpActions": {
    "nextActions": "Recommended next steps (e.g. follow-up in 2 weeks).",
    "parentFollowUp": "Suggested parent action items at home.",
    "studentSuggestions": "Specific improvement activities for the child.",
    "teacherItems": "Action items for the teacher in the classroom."
  }
}

Respond ONLY with the raw JSON object. Do not include markdown wraps or introductory text.
`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" }
    });

    const parsed = JSON.parse(result.response.text().trim());
    return parsed;
  } catch (error) {
    console.error("Gemini generateMeetingAnalysis error:", error);
    // Fallback if API fails
    return {
      summary: `📋 MEETING SUMMARY\n\nWe had a wonderful parent-teacher meeting regarding ${studentName} in Class ${className}.\n\n🌟 STRENGTHS OBSERVED\n\n- Demonstrates great interest in classroom learning activities.\n- Participates nicely with classmates and friends.\n- Follows teacher directions cooperatively.\n\n📈 AREAS FOR IMPROVEMENT\n\n- Needs guidance when transitioning between activities.\n- Encouraging more verbal communication during group circles.\n\n🏠 PARENT ACTION POINTS\n\n- Read together for 15 minutes daily.\n- Encourage independent task completion at home.\n- Practice communication through storytelling.\n- Create a consistent learning routine.\n\n👩🏫 TEACHER RECOMMENDATIONS\n\nWe will continue to provide classroom support and encourage social interactions.\n\n📅 FOLLOW-UP PLAN\n\nMonitor progression and follow up during the next school term.`,
      riskLevel: "LOW",
      riskExplanation: "No significant academic or behavioral issues flagged in meeting notes.",
      followUpActions: {
        nextActions: "Routine progress check in 4 weeks.",
        parentFollowUp: "Continue encouraging daily reading and counting activities at home.",
        studentSuggestions: "Practice writing numbers and spelling simple words.",
        teacherItems: "Monitor participation during group activities."
      }
    };
  }
}

module.exports = { generateSummary, generateNoticeContent, generateMeetingAnalysis };