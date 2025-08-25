export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { difficulty } = req.body;

  // Difficulty → prompt style
  const difficulties = {
    easy: "Make a very simple quiz question with 3 options.",
    medium: "Make a medium quiz question with 4 options.",
    hard: "Make a tricky quiz question with 4 options."
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
        message: `${prompt}\nFormat ONLY as JSON like this:\n{"question": "...", "options": ["...","...","..."], "answer": "..."}`,
      }),
    });

    const data = await response.json();
    let quiz = null;

    try {
      quiz = JSON.parse(data.text);
    } catch (e) {
      console.error("JSON parse failed:", data.text);
      quiz = {
        question: "Error generating question",
        options: ["Try Again"],
        answer: "Try Again"
      };
    }

    res.status(200).json(quiz);
  } catch (err) {
    console.error("Quiz API Error:", err);
    res.status(500).json({ error: "Failed to contact AI" });
  }
}
