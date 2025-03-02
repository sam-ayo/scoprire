import Anthropic from "@anthropic-ai/sdk";

export const llmClient = new Anthropic({
  apiKey: process.env["ANTHROPIC_API_KEY"], // This is the default and can be omitted
});
