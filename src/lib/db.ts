import { PrismaClient } from "@/generated/prisma";

const globalprisma = global as unknown as {
    prisma : PrismaClient;
};    /// type for globalprisma 

const prisma = globalprisma.prisma || new PrismaClient();

if(process.env.NODE_ENV!= "production"){
    globalprisma.prisma = prisma;
}

export default prisma;                