import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    try {
        // 1. Find the maximum ID in the Quote table
        const result = await prisma.quote.aggregate({
            _max: {
                id: true,
            },
        })

        const maxId = result._max.id || 0
        console.log(`Max Quote ID found: ${maxId}`)

        // 2. Reset the sequence to maxId + 1
        // Note: The sequence name is usually "Quote_id_seq" but Prisma might quote it.
        // In PostgreSQL, we can use setval.
        // The sequence name follows the pattern "Table_column_seq" usually.

        // We can try to dynamically get the sequence name or try standard naming.
        // Standard naming for Prisma on Postgres: "Quote_id_seq" (case sensitive if modeled as Quote)

        // Using explicit SQL generic to PostgreSQL
        await prisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('"Quote"', 'id'), ${maxId + 1}, false);`)

        // If table name is lowercase in DB:
        // await prisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('quote', 'id'), ${maxId + 1}, false);`)

        console.log(`Sequence reset to ${maxId + 1}`)

    } catch (e) {
        console.error(e)
    } finally {
        await prisma.$disconnect()
    }
}

main()
