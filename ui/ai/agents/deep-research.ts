// deepResearch(researchPrompt, depth (d), breadth (b))
// --> generate b search queries
// ----> for each search query, search web, and then pass results to LLM to generate a list of (3) learnings, and follow up questions (b - based on overall research prompt)
// ----> recursively call deepResearch(followUpQuestion, depth-1, Math.ceil(breadth/2)) until d = 0.

import Exa from "exa-js";
import "dotenv/config";
import { DataStreamWriter, generateObject, generateText, tool } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

export const SYSTEM_PROMPT = `You are an expert researcher. Today is ${new Date().toISOString()}. Follow these instructions when responding:
  - You may be asked to research subjects that is after your knowledge cutoff, assume the user is right when presented with news.
  - The user is a highly experienced analyst, no need to simplify it, be as detailed as possible and make sure your response is correct.
  - Be highly organized.
  - Suggest solutions that I didn't think about.
  - Be proactive and anticipate my needs.
  - Treat me as an expert in all subject matter.
  - Mistakes erode my trust, so be accurate and thorough.
  - Provide detailed explanations, I'm comfortable with lots of detail.
  - Value good arguments over authorities, the source is irrelevant.
  - Consider new technologies and contrarian ideas, not just the conventional wisdom.
  - You may use high levels of speculation or prediction, just flag it for me.
  - You must provide links to sources used. Ideally these are inline e.g. [this documentation](https://documentation.com/this)
  `;

export const exa = new Exa(process.env.EXA_API_KEY);

type SearchResult = {
  title: string;
  url: string;
  content: string;
  publishedDate: string;
  favicon: string;
};

export type Research = {
  learnings: string[];
  sources: SearchResult[];
  questionsExplored: string[];
  searchQueries: string[];
};

const searchWeb = async (query: string) => {
  const { results } = await exa.searchAndContents(query, {
    livecrawl: "always",
    numResults: 3,
    type: "keyword",
  });
  return results.map((r) => ({
    title: r.title,
    url: r.url,
    content: r.text,
    publishedDate: r.publishedDate,
    favicon: r.favicon,
  })) as SearchResult[];
};

const generateSearchQueries = async (
  query: string,
  breadth: number,
  learnings?: string[],
) => {
  const {
    object: { queries },
  } = await generateObject({
    system: SYSTEM_PROMPT,
    model: openai("o3-mini"),
    prompt: `Given the following prompt from the user, generate a list of SERP queries to research the topic. Ensure at least one is almost identical to the initial prompt. Return a maximum of ${breadth} queries, but feel free to return less if the original prompt is clear. Make sure each query is unique and not similar to each other: <prompt>${query}</prompt>\n\n${
      learnings
        ? `Here are some learnings from previous research, use them to generate more specific queries: ${learnings.join(
            "\n",
          )}`
        : ""
    }`,
    schema: z.object({
      queries: z
        .array(
          z.object({
            query: z.string().describe("The SERP query"),
            researchGoal: z
              .string()
              .describe(
                "First talk about the goal of the research that this query is meant to accomplish, then go deeper into how to advance the research once the results are found, mention additional research directions. Be as specific as possible, especially for additional research directions.",
              ),
          }),
        )
        .describe(`List of SERP queries, max of ${breadth}`),
    }),
  });
  return queries;
};

const generateLearnings = async (
  query: string,
  results: SearchResult[],
  numberOfLearnings: number,
  numberOfFollowUpQuestions: number,
) => {
  const {
    object: { followUpQuestions, learnings },
  } = await generateObject({
    model: openai("o3-mini"),
    system: SYSTEM_PROMPT,
    prompt: `Given the following contents from a SERP search for the query <query>${query}</query>, generate a list of learnings from the contents. Return a maximum of ${numberOfLearnings} learnings, but feel free to return less if the contents are clear. Make sure each learning is unique and not similar to each other. The learnings should be concise and to the point, as detailed and information dense as possible. Make sure to include any entities like people, places, companies, products, things, etc in the learnings, as well as any exact metrics, numbers, or dates. The learnings will be used to research the topic further.\n\n<contents>${results
      .map((content) => `<content>\n${content.content}\n</content>`)
      .join("\n")}</contents>`,
    schema: z.object({
      learnings: z
        .array(z.string())
        .describe(`List of learnings, max of ${numberOfLearnings}`),
      followUpQuestions: z
        .array(z.string())
        .describe(
          `List of follow-up questions to research the topic further, max of ${numberOfFollowUpQuestions}`,
        ),
    }),
  });
  return {
    learnings,
    followUpQuestions,
  };
};

const deepResearch = async (
  prompt: string,
  depth: number = 1,
  breadth: number = 3,
  accumulatedResearch: Research = {
    learnings: [],
    sources: [],
    questionsExplored: [],
    searchQueries: [],
  },
  dataStream: DataStreamWriter,
): Promise<Research> => {
  // Base case: regardless whether accumulatedResearch is present or empty, if depth is 0 we stop.
  if (depth === 0) {
    return accumulatedResearch;
  }

  dataStream.writeMessageAnnotation({
    status: { title: `Generating search queries for "${prompt}"` },
  });
  const searchQueries = await generateSearchQueries(
    prompt,
    breadth,
    accumulatedResearch.learnings,
  );
  dataStream.writeMessageAnnotation({
    status: { title: `Generated search queries for "${prompt}"` },
  });

  // Process each query and merge the results rather than overwrite
  const subResults = await Promise.all(
    searchQueries.map(async ({ query, researchGoal }) => {
      dataStream.writeMessageAnnotation({
        status: { title: `Searching the web for "${query}"` },
      });
      const results = await searchWeb(query);
      results.forEach(async (source) => {
        dataStream.writeMessageAnnotation({
          source: { title: source.title, url: source.url },
        });
        await new Promise((resolve) => setTimeout(resolve, 1000));
      });

      dataStream.writeMessageAnnotation({
        status: { title: `Analyzing search results for "${query}"` },
      });

      const { learnings, followUpQuestions } = await generateLearnings(
        query,
        results,
        3,
        breadth,
      );
      const nextQuery =
        `Previous research goal: ${researchGoal}` +
        ` Follow-up directions: ${followUpQuestions.map((q) => `\n${q}`).join("")}`.trim();

      // Make the recursive call
      dataStream.writeMessageAnnotation({
        status: {
          title: `Diving deeper to understand "${followUpQuestions.slice(0, 3).join(", ")}"`,
        },
      });
      const subResearch = await deepResearch(
        nextQuery,
        depth - 1,
        Math.ceil(breadth / 2),
        undefined,
        dataStream,
      );

      subResearch.sources.forEach((source) => {
        dataStream.writeMessageAnnotation({
          source: { title: source.title, url: source.url },
        });
      });

      // Merge the research found at this level with the research in the child call.
      return {
        learnings,
        sources: results,
        questionsExplored: followUpQuestions,
        searchQueries: [query, ...subResearch.searchQueries],
        // Also merge in subResearch learnings, sources, and questions.
        subLearnings: subResearch.learnings,
        subSources: subResearch.sources,
        subQuestionsExplored: subResearch.questionsExplored,
      };
    }),
  );
  for (const res of subResults) {
    accumulatedResearch.learnings.push(...res.learnings, ...res.subLearnings);
    accumulatedResearch.sources.push(...res.sources, ...res.subSources);
    accumulatedResearch.questionsExplored.push(
      ...res.questionsExplored,
      ...res.subQuestionsExplored,
    );
    accumulatedResearch.searchQueries.push(...res.searchQueries);
  }

  return accumulatedResearch;
};

const generateReport = async (prompt: string, research: Research) => {
  const { learnings, sources, questionsExplored, searchQueries } = research;
  const { text: report } = await generateText({
    model: openai("o3-mini"),
    system: SYSTEM_PROMPT + "\n- Write in markdown sytax.",
    prompt: `Generate a comprehensive report focused on "${prompt}". The main research findings should be drawn from the learnings below, with the search queries and related questions explored serving as supplementary context. Focus on synthesizing the key insights into a coherent narrative around the main topic.

    <learnings>
    ${learnings.map((l) => `\n<learning>${l}</learning>`).join("")}
    </learnings>

    <searchQueries>
    ${searchQueries.map((q) => `\n<query>${q}</query>`).join("")}
    </searchQueries>

    <relatedQuestions>
    ${questionsExplored.map((q) => `\n<question>${q}</question>`).join("")}
    </relatedQuestions>

    <sources>
    ${sources.map((s) => `\n<source>${JSON.stringify({ ...s, content: s.content.slice(0, 350) })}</source>`).join("")}
    </sources>
    `,
  });
  const { object } = await generateObject({
    model: openai("gpt-4o-mini"),
    prompt:
      "Generate a punchy title (5 words) for the following report:\n\n" +
      report,
    schema: z.object({
      title: z.string(),
    }),
  });

  return { report, title: object.title };
};

export const deepResearchTool = (dataStream: DataStreamWriter) =>
  tool({
    description: "Use this tool to conduct a deep research on a given topic.",
    parameters: z.object({
      prompt: z
        .string()
        .min(1)
        .max(1000)
        .describe(
          "This should take the user's exact prompt. Extract from the context but do not infer or change in any way.",
        ),
      depth: z.number().min(1).max(3).default(1).describe("Default to 1 unless the user specifically references otherwise"),
      breadth: z.number().min(1).max(5).default(3).describe("Default to 3 unless the user specifically references otherwise"),
    }),
    execute: async ({ prompt, depth, breadth }) => {
      console.log({ prompt, depth, breadth });
      dataStream.writeMessageAnnotation({
        status: { title: "Beginning deep research" },
      });
      const research = await deepResearch(
        prompt,
        depth,
        breadth,
        undefined,
        dataStream,
      );
      dataStream.writeMessageAnnotation({
        status: { title: "Generating report" },
      });
      const report = await generateReport(prompt, research);
      dataStream.writeMessageAnnotation({
        status: { title: "Successfully generated report" },
      });

      return {
        report,
        research: {
          ...research,
          sources: Array.from(
            new Map(
              research.sources.map((s) => [
                s.url,
                { ...s, content: s.content.slice(0, 50) + "..." },
              ]),
            ).values(),
          ),
        },
      };
    },
  });