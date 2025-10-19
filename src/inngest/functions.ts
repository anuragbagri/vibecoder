import { inngest } from "@/inngest/client";
import { createAgent, gemini } from '@inngest/agent-kit';
import { Sandbox } from "@e2b/code-interpreter";
import { getSandbox } from "./utils";

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    const sandboxId = await step.run("get-sandbox-id", async () => {
      const sandbox = await Sandbox.create("anurag-nextjs-2");
      return sandbox.sandboxId;
    });
    const codeAgent = createAgent({
      name : "codeAgent",
      system : "you are an expert nextjs coder. you read and write nextjs code and code snippets like react button component",
      model : gemini({model : "gemini-2.5-flash"}),
    });
    const { output } =await codeAgent.run(
      `write the following snippet : ${event.data.value}`
    );

    const sandboxUrl = await step.run("get-sandbox-url" , async () => {
      const sandbox = await getSandbox(sandboxId);
      const host =  sandbox.getHost(3000);
      return `https://${host}`
    })

    return { output, sandboxUrl };
  },
);
