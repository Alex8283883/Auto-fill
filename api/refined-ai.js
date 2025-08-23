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
  royal: "Rewrite into short, regal English suitable for casual speech. Output ONLY the rewritten sentence. No explanations or introductions.",
  therapist: "Rewrite with a calm, empathetic, and profound tone like a deep-thinking therapist. It should sound thoughtful, supportive, and reflective, as if guiding someone to self-awareness. Keep it short but weighty. Output ONLY the rewritten sentence. No explanations or introductions."
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

    // 🧹 Cleanup: strip quotes + filler phrases
    royalText = royalText
      .replace(/^["“”']+|["“”']+$/g, "")  
      .replace(/^(here[’']?s|refined version:?)/i, "") 
      .trim();

    res.status(200).json({ royal_text: royalText });
  } catch (err) {
    console.error("Cohere API Error:", err);
    res.status(500).json({ error: "Failed to contact AI" });
  }
}
