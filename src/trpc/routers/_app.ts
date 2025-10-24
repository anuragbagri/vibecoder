import { messageRouter } from "@/modules/messages/server/procedures";
import { projectRouter } from "@/modules/projects/server/procedure";
import { createTRPCRouter } from "@/trpc/init";
export const appRouter = createTRPCRouter({
messages : messageRouter,
projects : projectRouter
});
// export type definition of API
export type AppRouter = typeof appRouter;