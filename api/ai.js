export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { text, level } = req.body;
  if (!text) {
    return res.status(400).json({ error: "No text provided" });
  }

  // Map levels to style prompts
  const levels = {
    rich: "Rewrite the following into smooth, modern elegant English.",
    richer: "Rewrite the following into refined, polished English, like a Victorian aristocrat.",
    royal: "Rewrite the following into majestic, regal English, as if spoken by royalty.",
  };

  const prompt = levels[level] || levels.rich; // default to rich

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
    const royalText = data.text?.trim() || text;

    res.status(200).json({ royal_text: royalText });
  } catch (err) {
    console.error("Cohere API Error:", err);
    res.status(500).json({ error: "Failed to contact AI" });
  }
}
