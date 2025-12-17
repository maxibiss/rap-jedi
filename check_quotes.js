
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const quotes = await prisma.quote.findMany({
        where: {
            sourceType: { not: null }
        },
        select: { id: true, sourceType: true }
    });
    console.log("Quotes with sourceType:", quotes);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
