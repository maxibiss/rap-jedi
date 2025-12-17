const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
    const dataPath = path.join(__dirname, 'data', 'quotes_data.json');
    const quotesData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

    console.log(`Seeding ${quotesData.length} quotes...`);

    for (const q of quotesData) {
        const id = parseInt(q.quote_id);

        // Check if exists to avoid duplicates if re-run
        const existing = await prisma.quote.findUnique({ where: { id } });

        if (!existing) {
            await prisma.quote.create({
                data: {
                    id: id,
                    text: q.quote_text,
                    author: q.author,
                    sourceTitle: q.source_title === 'BLANK' ? null : q.source_title,
                    sourceType: q.source_type, // Map or keep string
                    topicIds: q.topic_ids || "",
                    isPinned: q.is_pinned === "true",
                    status: "PUBLISHED"
                }
            });
        }
    }

    console.log("Seeding completed.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
