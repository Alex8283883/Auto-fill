export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { difficulty } = req.body;

  const difficulties = {
    easy: "Create a very simple quiz question with 3 options.",
    medium: "Create a medium difficulty quiz question with 4 options.",
    hard: "Create a tricky quiz question with 4 options."
  };

  const prompt = difficulties[difficulty] || difficulties.easy;

  try {
    const response = await fetch("https://api.cohere.ai/v1/chat", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.COHERE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "command-a-03-2025",
        message: `${prompt}
Make sure the output is ONLY valid JSON in this exact format:
{"question":"...","options":["...","...","..."],"answer":"..."}
Do not include explanations. The question must be different each time.`,
      }),
    });

    const data = await response.json();
    let raw = data.text || "";
    let quiz = null;

    // Extract JSON safely (regex in case extra text is returned)
    try {
      const match = raw.match(/\{[\s\S]*\}/);
      quiz = match ? JSON.parse(match[0]) : null;
    } catch (e) {
      console.error("JSON parse failed:", raw);
    }

    if (!quiz) {
      quiz = {
        question: "Error generating question",
        options: ["Try Again"],
        answer: "Try Again",
      };
    }

    res.status(200).json(quiz);
  } catch (err) {
    console.error("Quiz API Error:", err);
    res.status(500).json({ error: "Failed to contact AI" });
  }
}
