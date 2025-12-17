const fs = require('fs');

try {
    const data = fs.readFileSync('data/quotes_data.json', 'utf8');
    const quotes = JSON.parse(data);
    const topics = {};

    quotes.forEach(q => {
        if (q.topic_ids) {
            q.topic_ids.split(',').forEach(t => {
                const tid = t.trim();
                if (tid) {
                    if (!topics[tid]) topics[tid] = [];
                    topics[tid].push(q.quote_text);
                }
            });
        }
    });

    let output = '';
    Object.keys(topics).sort().forEach(tid => {
        output += `\n--- TOPIC ${tid} ---\n`;
        output += topics[tid].slice(0, 5).map(t => `- ${t}`).join('\n') + '\n';
    });

    fs.writeFileSync('topics_analysis.txt', output, 'utf8');
    console.log("Written to topics_analysis.txt");
} catch (error) {
    console.error("Error:", error.message);
}
