const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
});

async function main() {
    try {
        console.log("Connecting...");
        const userCount = await prisma.user.count();
        console.log(`Successfully connected. User count: ${userCount}`);
    } catch (e) {
        console.error("Connection failed FULL ERROR:", JSON.stringify(e, null, 2));
        console.error("Message:", e.message);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
