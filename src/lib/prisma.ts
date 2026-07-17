import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const getConnectionString = () => {
  let url = process.env.DATABASE_URL || '';
  try {
    if (url.startsWith('postgresql://') || url.startsWith('postgres://')) {
      const prefix = url.startsWith('postgresql://') ? 'postgresql://' : 'postgres://';
      const remainder = url.substring(prefix.length);
      
      const lastAt = remainder.lastIndexOf('@');
      if (lastAt !== -1) {
        const userinfo = remainder.substring(0, lastAt);
        const hostDb = remainder.substring(lastAt + 1);
        
        const firstColon = userinfo.indexOf(':');
        if (firstColon !== -1) {
          const user = userinfo.substring(0, firstColon);
          const password = userinfo.substring(firstColon + 1);
          
          const encodedPassword = password.includes('%') ? password : encodeURIComponent(password);
          return `${prefix}${user}:${encodedPassword}@${hostDb}`;
        }
      }
    }
  } catch (e) {
    console.error("Error parsing/encoding DATABASE_URL:", e);
  }
  return url;
};

const connectionString = getConnectionString();

const prismaClientSingleton = () => {
  const isProd = process.env.NODE_ENV === 'production';
  const pool = new Pool({ 
    connectionString,
    ssl: isProd ? { rejectUnauthorized: false } : false,
    max: isProd ? 2 : undefined,
    idleTimeoutMillis: isProd ? 15000 : undefined,
  })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prisma ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma
