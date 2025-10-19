import { inngest } from "@/inngest/client";
import { createAgent, gemini } from '@inngest/agent-kit';

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    const codeAgent = createAgent({
      name : "codeAgent",
      system : "you are an expert nextjs coder. you read and write nextjs code and code snippets like react button component",
      model : gemini({model : "gemini-2.5-flash"}),
    });
    const { output } =await codeAgent.run(
      `write the following snippet : ${event.data.value}`
    );

    console.log(output)

    return { output };
  },
);
