// memory store (per userId/session)
const sessions = {};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { text, userId } = req.body;
  if (!text || !userId) {
    return res.status(400).json({ error: "No text or userId provided" });
  }

  try {
    // initialize session if not exists
    if (!sessions[userId]) {
      sessions[userId] = [];
    }

    // push user message
    sessions[userId].push({ role: "user", content: text });

    // build conversation string
    const conversation = sessions[userId]
      .map(msg => `${msg.role === "user" ? "User" : "AI"}: ${msg.content}`)
      .join("\n");

    const response = await fetch("https://api.cohere.ai/v1/chat", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.COHERE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "command-a-03-2025",
        message: `You are a casual chat partner. 
Reply briefly and naturally like a real person and keep it short, dont write paragraphs!. 
Do not explain that you are an AI.

Conversation so far:
${conversation}
AI:`,
      }),
    });

    const data = await response.json();

    const smartText = data.text?.trim() || text;

    // store AI reply in memory
    sessions[userId].push({ role: "ai", content: smartText });

    res.status(200).json({ smart_text: smartText });
  } catch (err) {
    console.error("Cohere API Error:", err);
    res.status(500).json({ error: "Failed to contact AI" });
  }
}
