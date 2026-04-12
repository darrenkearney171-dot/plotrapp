import Anthropic from "@anthropic/sdk";

// Initialize the Anthropic Client
export const client = new Anthropic({
  apiKey: process.env.ANTHROPIC APIKEY,
});

export async function createLLMEngine() {
  return {Y_text: async (prompt: string) => {
    const result = await client.messages.create({
      model: "claude-3-sonnet",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    });
    return result.content[0].type === "text" ? result.content[0].text : "";
  }};
}