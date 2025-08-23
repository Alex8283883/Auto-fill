export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { text, level } = req.body;
  if (!text) {
    return res.status(400).json({ error: "No text provided" });
  }

  // Style levels → force "output only"
  const levels = {
  rich: "Rewrite into short, smooth modern English. Output ONLY the rewritten sentence. No explanations or introductions.",
  richer: "Rewrite into short, refined English with a touch of elegance. Output ONLY the rewritten sentence. No explanations or introductions.",
  royal: "Rewrite into short, confident English with the charm of a gentleman. Use graceful, dignified vocabulary, as if spoken to impress with poise. One sentence only. Output ONLY the rewritten sentence. No explanations or introductions."
};
  const prompt = levels[level] || levels.rich;

  try {
    const response = await fetch("https://api.cohere.ai/v1/chat", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.COHERE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "command-a-03-2025",
        message: `${prompt}\n\n${text}`,
      }),
    });

    const data = await response.json();
    let royalText = data.text?.trim() || text;

    // 🧹 Cleanup: strip quotes + filler phrases like "Here’s..."
    royalText = royalText
      .replace(/^["“”']+|["“”']+$/g, "")  // remove stray quotes
      .replace(/^(here[’']?s|refined version:?)/i, "") // remove assistant-y intros
      .trim();

    res.status(200).json({ royal_text: royalText });
  } catch (err) {
    console.error("Cohere API Error:", err);
    res.status(500).json({ error: "Failed to contact AI" });
  }
}
