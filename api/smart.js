export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: "No text provided" });
  }

  try {
    const response = await fetch("https://api.cohere.ai/v1/chat", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.COHERE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "command-a-03-2025",
        message: `You are a smart completion assistant. Expand or finish the user’s sentence naturally, with factual or logical continuation. 
Return ONLY the completed sentence, nothing else.

User: ${text}
AI:`,
      }),
    });

    const data = await response.json();

    const smartText = data.text?.trim() || text;
    res.status(200).json({ smart_text: smartText });
  } catch (err) {
    console.error("Cohere API Error:", err);
    res.status(500).json({ error: "Failed to contact AI" });
  }
}
