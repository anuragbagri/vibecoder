import { inngest } from "@/inngest/client";

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    await step.sleep("transcribing the video", "5s");

    // second step 
    await step.sleep("ai summary and uplaod", "5s");
    return { message: `Hello ${event.data.email}!` };
  },
);
