import { inngest } from "@/inngest/client";
import { createAgent, createNetwork, createTool, gemini } from '@inngest/agent-kit';
import {  Sandbox } from "@e2b/code-interpreter";
import { getSandbox, lastAssistantTextMessageContent } from "./utils";
import {z} from "zod";
import { PROMPT } from "@/prompt";



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
      description : "coding agent",
      system : PROMPT,
        model : gemini({
        model : "gemini-2.5-flash",
      }),
      tools : [
        createTool({
          name : "terminal",
          description : "used for running commands in terminal",
          parameters : z.object({
           command : z.string(),
          }),
          handler : async ({command} , { step}) => {
            return await step?.run("terminal" , async () => {
              const buffers =  { stdout: "", stderr: "" };
              try {
                const sandbox = await getSandbox(sandboxId);
                const result = await sandbox.commands.run(command, {
                  onStdout : (data : string) => {
                    buffers.stdout += data;
                  },
                  onStderr : (data : string) => {
                    buffers.stderr += data;
                  }  
                });
                return result.stdout;
              }
              catch(e) {
              console.error(`command failed , ${e} \nstdout: ${buffers.stdout}\nstderror: ${buffers.stderr}`,);
              return `command failed , ${e} \nstdout: ${buffers.stdout}\nstderror: ${buffers.stderr}`;
              }
            });
          }
        }),
        createTool({
          name : "createOrUpdateFiles",
          description : "create or updates files in the sandbox",
          parameters : z.object({
            filesJson  : z.string().describe(" a json string array of {path , content} objects")
          }),
          handler : async (
            { filesJson},
            { step , network}
          ) => {
             const files = JSON.parse(filesJson);
            const newFiles = await step?.run("createOrUpdateFiles", async () => {
              try {
                const updateFiles = network.state.data.files || {};
                const sandbox = await getSandbox(sandboxId);
                for (const file of files) {
                  await sandbox.files.write(file.path, file.content);
                  updateFiles[file.path] = file.content;
                }
                return updateFiles;
              }
              catch(e) {
                return "Error :" + e;
              }
            });
            if (typeof newFiles === "object" ){
              network.state.data.files = newFiles;
            }
          }
        }),
        createTool({
          name : "readFiles",
          description : "Read files from the object",
          parameters : z.object({
            files : z.array(
              z.string()
            ),
          }),
          handler : async ({files} , {step}) => {
            return await step?.run("readFiles", async () => {
              try  {
                const sandbox = await getSandbox(sandboxId);
                const contents = [];
                for(const file of files ) {
                  const content = await sandbox.files.read(file);
                  contents.push({path : file,content});
                }
                return JSON.stringify(contents);
              }
              catch (e) {
                return "Error : " + e;
              }
            })
          }
        })
      ],
      lifecycle : {
        onResponse: async ({result , network})=> {
               const lastAssitantMessageText = 
               lastAssistantTextMessageContent(result);

               if(lastAssitantMessageText && network) {
                if(lastAssitantMessageText.includes("<task_summary>")) {
                  network.state.data.summary = lastAssitantMessageText;
                }
               } 
               return result;
        },
      }
    });

    const network = createNetwork({
      name : "coding-agent-network",
      agents : [codeAgent],
      maxIter : 15,
      router : async ({network}) => {
        const summary = network.state.data.summary;
        if(summary) {
          return ;
        }

        return codeAgent;
      },
    });
    const result = await network.run(event.data.value);


    const sandboxUrl = await step.run("get-sandbox-url" , async () => {
      const sandbox = await getSandbox(sandboxId);
      const host =  sandbox.getHost(3000);
      return `https://${host}`
    })

    return { url : sandboxUrl ,
      title : "Fragment",
      files : result.state.data.files,
      summary : result.state.data.summary
    };
  },
);
