export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { question } = req.body;
  if (!question) {
    return res.status(400).json({ error: "No question provided" });
  }

  // Prompt → quiz-style instruction
  const prompt = `
  You are a quiz bot.
  - Answer the question clearly and concisely.
  - If it's a trivia/general knowledge question, give the answer only (no explanation).
  - If the question is not valid or makes no sense, respond with "I don't know".
  Output ONLY the answer, nothing else.
  `;

  try {
    const response = await fetch("https://api.cohere.ai/v1/chat", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.COHERE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "command-a-03-2025",
        message: `${prompt}\n\nQuestion: ${question}`,
      }),
    });

    const data = await response.json();
    let quizAnswer = data.text?.trim() || "I don't know";

    // cleanup any AI fluff
    quizAnswer = quizAnswer
      .replace(/^["“”']+|["“”']+$/g, "")
      .replace(/^(answer:?)/i, "")
      .trim();

    res.status(200).json({ answer: quizAnswer });
  } catch (err) {
    console.error("Cohere API Error:", err);
    res.status(500).json({ error: "Failed to contact AI" });
  }
}
