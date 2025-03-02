import Exa from "exa-js";
import "dotenv/config";
import { tool as createTool } from "ai";
import { z } from "zod";

export const exa = new Exa(process.env.EXA_API_KEY);

const webSearch = createTool({
  description: "Use this tool to search the web for information.",
  parameters: z.object({
    query: z
      .string()
      .min(1)
      .max(200)
      .describe(
        "The search query - be specific and include terms like 'vs', 'features', 'comparison' for better results",
      ),
    limit: z
      .number()
      .min(1)
      .max(10)
      .default(5)
      .describe("The number of results to return"),
  }),
  execute: async ({ query, limit }) => {
    const { results } = await exa.searchAndContents(query, {
      numResults: limit,
      startPublishedDate: new Date("2025-01-01").toISOString(),
    });
    // Process and clean the results
    return results.map((result) => ({
      title: result.title,
      url: result.url,
      snippet: result.text, // Limit snippet length
      domain: new URL(result.url).hostname, // Extract domain for source context
      date: result.publishedDate || "Date not available", // Include publish date when available
    }));
  },
});

export const tools = {
  webSearch,
};
