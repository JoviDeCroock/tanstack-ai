import type { Tool } from "./types";

/**
 * Property definition with optional required flag
 */
type PropertyDefinition = {
  readonly type: "string" | "number" | "boolean" | "array" | "object";
  readonly description?: string;
  readonly required?: boolean;
  readonly [key: string]: any;
};

/**
 * Infer TypeScript type from property type string
 */
type InferPropertyType<T extends { type: string }> =
  T["type"] extends "string" ? string :
  T["type"] extends "number" ? number :
  T["type"] extends "boolean" ? boolean :
  T["type"] extends "array" ? any[] :
  T["type"] extends "object" ? Record<string, any> :
  any;

/**
 * Check if a property has required: true at the type level
 */
type IsRequired<T> = T extends { required: true } ? true : false;

/**
 * Make property optional if required is not true
 */
type MakeOptional<T extends Record<string, any>> = {
  [K in keyof T as IsRequired<T[K]> extends true ? K : never]: InferPropertyType<T[K]>
} & {
  [K in keyof T as IsRequired<T[K]> extends true ? never : K]?: InferPropertyType<T[K]>
};

/**
 * Infer argument type from properties object
 */
type InferArgs<T extends Record<string, any>> = MakeOptional<T>;

/**
 * Configuration for defining a tool with type inference
 */
export interface DefineToolConfig<
  TName extends string,
  TProps extends Record<string, PropertyDefinition>
> {
  /**
   * The name of the tool function
   */
  name: TName;
  /**
   * Description of what the tool does
   */
  description: string;
  /**
   * Properties with inline required flags
   */
  properties: TProps;
  /**
   * The function to execute when the tool is called.
   * Args are automatically typed based on the properties.
   */
  execute: (args: InferArgs<TProps>) => Promise<string> | string;
}

/**
 * Define a single tool with full type safety and auto-inference.
 * 
 * @example
 * ```typescript
 * const getWeatherTool = defineTool({
 *   name: "getWeather",
 *   description: "Get the current weather",
 *   properties: {
 *     location: { type: "string", description: "City name", required: true },
 *     units: { type: "string", description: "Temperature units" },
 *   },
 *   execute: async (args) => {
 *     // args is automatically typed as { location: string; units?: string }
 *     return JSON.stringify({ temp: 72 });
 *   },
 * });
 * ```
 */
export function defineTool<
  const TName extends string,
  const TProps extends Record<string, PropertyDefinition>
>(
  config: DefineToolConfig<TName, TProps>
): Tool & { __toolName: TName } {
  // Extract required properties
  const required = Object.entries(config.properties)
    .filter(([_, prop]) => prop.required === true)
    .map(([key]) => key);

  // Build JSON Schema properties (without required flag)
  const properties: Record<string, any> = {};
  for (const [key, prop] of Object.entries(config.properties)) {
    const { required: _, ...rest } = prop;
    properties[key] = rest;
  }

  return {
    type: "function" as const,
    function: {
      name: config.name,
      description: config.description,
      parameters: {
        type: "object",
        properties,
        required,
      },
    },
    execute: config.execute as any,
    __toolName: config.name,
  } as Tool & { __toolName: TName };
}

/**
 * Configuration for a single tool in defineTools
 */
export type DefineToolsConfig<TProps extends Record<string, any>> = {
  description: string;
  properties: TProps;
  execute: (args: InferArgs<TProps>) => Promise<string> | string;
}

/**
 * Helper to define a tool with enforced type safety.
 * Use this when defining tools for `defineTools` to get proper type inference.
 * 
 * @example
 * ```typescript
 * const tools = defineTools({
 *   myTool: tool({
 *     description: "My tool",
 *     properties: {
 *       id: { type: "string", required: true },
 *     },
 *     execute: async (args) => {
 *       // args is properly typed as { id: string }
 *       return args.id;
 *     },
 *   }),
 * });
 * ```
 */
export function tool<const TProps extends Record<string, any>>(config: {
  description: string;
  properties: TProps;
  execute: (args: InferArgs<TProps>) => Promise<string> | string;
}) {
  return config;
}

/**
 * Define multiple tools at once with full type safety.
 * Returns an object where keys are tool names and values are tool definitions.
 * 
 * @example
 * ```typescript
 * const tools = defineTools({
 *   getWeather: tool({
 *     description: "Get the current weather",
 *     properties: {
 *       location: { type: "string", required: true },
 *       units: { type: "string" },
 *     },
 *     execute: async (args) => {
 *       // args is typed as { location: string; units?: string }
 *       return JSON.stringify({ temp: 72 });
 *     },
 *   }),
 *   getTime: tool({
 *     description: "Get the current time",
 *     properties: {
 *       timezone: { type: "string" },
 *     },
 *     execute: async (args) => {
 *       // args is typed as { timezone?: string }
 *       return new Date().toISOString();
 *     },
 *   }),
 * });
 * 
 * // Use with AI constructor
 * const ai = new AI({ adapters, tools });
 * ```
 */
export function defineTools<
  T extends Record<
    string,
    {
      description: string;
      properties: Record<string, any>;
    } & {
      execute: (args: any) => Promise<string> | string;
    }
  >
>(
  toolsConfig: T
): {
    [K in keyof T]: Tool & {
      __toolName: K;
      execute: T[K]["execute"];
    };
  } {
  const result = {} as any;

  for (const [name, config] of Object.entries(toolsConfig)) {
    // Extract required properties
    const required = Object.entries(config.properties as Record<string, PropertyDefinition>)
      .filter(([_, prop]) => prop.required === true)
      .map(([key]) => key);

    // Build JSON Schema properties (without required flag)
    const properties: Record<string, any> = {};
    for (const [key, prop] of Object.entries(config.properties as Record<string, PropertyDefinition>)) {
      const { required: _, ...rest } = prop;
      properties[key] = rest;
    }

    result[name] = {
      type: "function" as const,
      function: {
        name,
        description: config.description,
        parameters: {
          type: "object",
          properties,
          required,
        },
      },
      execute: config.execute,
      __toolName: name,
    };
  }

  return result;
}

/**
 * Type helper to extract tool names from a tools object created with defineTools
 */
export type ToolNames<T> = T extends Record<string, Tool & { __toolName: infer N }>
  ? N
  : never;

/**
 * Type helper to extract a specific tool's argument type
 */
export type ToolArgs<T extends Tool> = T extends {
  execute: (args: infer A) => any;
}
  ? A
  : never;
