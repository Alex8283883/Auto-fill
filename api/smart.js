export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { question, difficulty } = req.body;

  // Difficulty levels → you can make them harder with AI
  const difficulties = {
    easy: "Make a very simple quiz question with 3 options.",
    medium: "Make a moderately difficult quiz question with 4 options.",
    hard: "Make a tricky quiz question with 4 options that require some thinking."
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
        message: `${prompt}\nFormat as JSON: {"question": "...", "options": ["A","B","C"], "answer": "B"}`,
      }),
    });

    const data = await response.json();
    let quiz = {};

    try {
      quiz = JSON.parse(data.text);
    } catch {
      quiz = { question: "Error generating question", options: ["N/A"], answer: "N/A" };
    }

    res.status(200).json(quiz);
  } catch (err) {
    console.error("Quiz API Error:", err);
    res.status(500).json({ error: "Failed to contact AI" });
  }
}
