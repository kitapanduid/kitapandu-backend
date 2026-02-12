import { PrismaClient } from "@prisma/client"
import { adapter } from "../helper/adapter"


const prismaClientSingleton = () => {
  return new PrismaClient({ adapter })
}

declare global {
  var prisma: PrismaClient | undefined
}

export const prisma = global.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma
}
