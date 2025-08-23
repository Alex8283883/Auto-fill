export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { text, level } = req.body;
  if (!text) {
    return res.status(400).json({ error: "No text provided" });
  }

  // Style levels → concise, conversational, single-sentence
  const levels = {
  rich: "You are a rewriter, not an assistant. Rewrite only. Return exactly one short sentence in smooth modern English. Do not explain, do not add commentary, do not say anything except the rewritten text.",
  richer: "You are a rewriter, not an assistant. Rewrite only. Return exactly one short refined English sentence. No commentary, no assistant phrases.",
  royal: "You are a rewriter, not an assistant. Rewrite only. Return exactly one short regal-style English sentence. Nothing else, no quotes, no explanations."
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

    // 🧹 Strip leading/trailing quotes (handles " “ ” ')
    royalText = royalText.replace(/^["“”']+|["“”']+$/g, "");

    res.status(200).json({ royal_text: royalText });
  } catch (err) {
    console.error("Cohere API Error:", err);
    res.status(500).json({ error: "Failed to contact AI" });
  }
}
