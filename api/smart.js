export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { mode, question } = req.body;

  // If mode is "question" → generate a quiz Q + A
  if (mode === "question") {
    try {
      const response = await fetch("https://api.cohere.ai/v1/chat", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.COHERE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "command-a-03-2025",
          message: `
          Generate a random trivia question with its correct answer.
          Respond ONLY in JSON format:
          { "question": "The question here", "answer": "The correct answer here" }
          `
        }),
      });

      const data = await response.json();
      let text = data.text?.trim();

      // Try parsing JSON
      let quizData;
      try {
        quizData = JSON.parse(text);
      } catch {
        quizData = { question: "What is 2+2?", answer: "4" }; // fallback
      }

      return res.status(200).json(quizData);
    } catch (err) {
      console.error("Cohere API Error:", err);
      return res.status(500).json({ error: "Failed to contact AI" });
    }
  }

  // If player sends a question (quiz in reverse mode)
  if (question) {
    try {
      const response = await fetch("https://api.cohere.ai/v1/chat", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.COHERE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "command-a-03-2025",
          message: `Answer this trivia question briefly: ${question}`,
        }),
      });

      const data = await response.json();
      let quizAnswer = data.text?.trim() || "I don't know";

      res.status(200).json({ answer: quizAnswer });
    } catch (err) {
      console.error("Cohere API Error:", err);
      res.status(500).json({ error: "Failed to contact AI" });
    }
  } else {
    res.status(400).json({ error: "No question provided" });
  }
}
