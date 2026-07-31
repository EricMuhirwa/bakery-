const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    const res = await prisma.$runCommandRaw({
      insert: 'User',
      documents: [{
        email: 'raw_test2@example.com',
        password: 'abc',
        role: 'user',
        createdAt: { $date: new Date().toISOString() }
      }]
    });
    console.log(res);
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}
run();
