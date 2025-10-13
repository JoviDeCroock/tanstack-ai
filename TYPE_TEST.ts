// TYPE SAFETY VERIFICATION TEST
// This file tests that args are properly typed, not `any`

import { defineTools, tool } from "./packages/ai/src/index";

const tools = defineTools({
  testRequired: tool({
    description: "Test required property",
    properties: {
      id: {
        type: "string",
        required: true,
      },
    },
    execute: async (args) => {
      // ✅ This should work - id is string
      const test1: string = args.id;

      // ❌ This should ERROR - id is required, not optional
      // @ts-expect-error - id should be string, not string | undefined
      const test2: string | undefined = args.id;

      // ❌ This should ERROR - id is string, not number
      // @ts-expect-error - id should be string, not number
      const test3: number = args.id;

      return test1;
    },
  }),
  testOptional: tool({
    description: "Test optional property",
    properties: {
      name: {
        type: "string",
      },
    },
    execute: async (args) => {
      // ✅ This should work - name is string | undefined
      const test1: string | undefined = args.name;

      // ❌ This should ERROR - name is optional
      // @ts-expect-error - name should be string | undefined, not string
      const test2: string = args.name;

      return test1 ?? "";
    },
  }),
  testMixed: tool({
    description: "Test mixed required and optional",
    properties: {
      id: {
        type: "string",
        required: true,
      },
      count: {
        type: "number",
        required: true,
      },
      tag: {
        type: "string",
      },
      active: {
        type: "boolean",
      },
    },
    execute: async (args) => {
      // ✅ Required properties should be required
      const id: string = args.id;
      const count: number = args.count;

      // ✅ Optional properties should be optional
      const tag: string | undefined = args.tag;
      const active: boolean | undefined = args.active;

      // ❌ These should ERROR
      // @ts-expect-error - id is required
      const badId: string | undefined = args.id;
      // @ts-expect-error - tag is optional
      const badTag: string = args.tag;

      return `${id}-${count}-${tag ?? ""}-${active ?? false}`;
    },
  }),
});

// Verify the execute function has proper types
type Test1Args = Parameters<typeof tools.testRequired.execute>[0];
type Test2Args = Parameters<typeof tools.testOptional.execute>[0];
type Test3Args = Parameters<typeof tools.testMixed.execute>[0];

// These type checks should pass:
const _verify1: Test1Args = { id: "test" };
const _verify2: Test2Args = {};
const _verify3: Test2Args = { name: "test" };
const _verify4: Test3Args = { id: "test", count: 5 };
const _verify5: Test3Args = { id: "test", count: 5, tag: "hello", active: true };

// These should ERROR:
// @ts-expect-error - id is required
const _error1: Test1Args = {};
// @ts-expect-error - id must be string, not number
const _error2: Test1Args = { id: 123 };
// @ts-expect-error - count is required
const _error3: Test3Args = { id: "test" };

console.log("Type test completed. If this file compiles with only the expected @ts-expect-error comments, types are working correctly!");

export { };
