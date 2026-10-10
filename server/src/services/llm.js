export async function askLLM({ system, user, json = false }) {
  const {
    AI_API_KEY,
    AI_BASE_URL = "https://generativelanguage.googleapis.com",
    AI_MODEL = "gemini-2.5-flash",
  } = process.env;
  if (!AI_API_KEY) return null;
  const response = await fetch(
    `${AI_BASE_URL.replace(/\/$/, "")}/chat/completions`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${AI_API_KEY}`,
      },
      body: JSON.stringify({
        model: AI_MODEL,
        temperature: 0.2,
        ...(json ? { response_format: { type: "json_object" } } : {}),
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    },
  );
  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `AI provider error (${response.status}): ${body.slice(0, 300)}`,
    );
  }
  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? null;
}
