import { createFileRoute } from "@tanstack/react-router";
import { AI, defineTools, tool } from "@tanstack/ai";
import { OllamaAdapter } from "@tanstack/ai-ollama";
import { OpenAIAdapter } from "@tanstack/ai-openai";

import guitars from "@/data/example-guitars";

const SYSTEM_PROMPT = `You are a helpful assistant for a store that sells guitars.

You can use the following tools to help the user:

- getGuitars: Get all guitars from the database
- recommendGuitar: Recommend a guitar to the user
`;

// Define tools registry with full type safety using defineTools + tool()
const tools = defineTools({
  getGuitars: tool({
    description: "Get all products from the database",
    properties: {},
    execute: async () => {
      return JSON.stringify(guitars);
    },
  }),
  recommendGuitar: tool({
    description: "Use this tool to recommend a guitar to the user",
    properties: {
      id: {
        type: "string",
        description: "The id of the guitar to recommend",
        required: true,
      },
      name: {
        type: "boolean",
        description: "Whether to include the name in the response",
        required: false,

      }
    },
    execute: async (args) => {
      // ✅ args is now properly typed as { id: string } with full type safety!
      return JSON.stringify({ id: args.id });
    },
  }),
});

// Initialize AI with tools and system prompts in constructor
const ai = new AI({
  adapters: {
    ollama: new OllamaAdapter({
      apiKey: process.env.AI_KEY!,
    }),
    openAi: new OpenAIAdapter({
      apiKey: process.env.AI_KEY!,
    }),
  },
  fallbacks: [
    {
      adapter: "openAi",
      model: "gpt-4",
    },
  ],
  tools,
  systemPrompts: [SYSTEM_PROMPT],
});

export const Route = createFileRoute("/demo/api/tanchat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages } = await request.json();

        // System prompts are automatically prepended from constructor
        // No need to manually add system messages anymore!
        return ai.chat({
          model: "gpt-4o",
          adapter: "openAi",
          fallbacks: [
            {
              adapter: "ollama",
              model: "gpt-oss:20b",
            },
          ],
          as: "response",
          messages,
          temperature: 0.7,
          tools: ["getGuitars", "recommendGuitar"],
          toolChoice: "auto",
          maxIterations: 5,
        });
      },
    },
  },
});
