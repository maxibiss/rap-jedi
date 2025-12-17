import { Quote } from '@/data/quotes';
import { TOPIC_NAMES, HUB_NAMES } from '@/data/topics';

interface Node {
    id: string;
    name: string;
    val: number; // Size
    group: number; // For color coding by Hub
    level: 1 | 2; // 1 = Hub, 2 = Topic
}

interface Link {
    source: string;
    target: string;
    value?: number; // Strength
}

export interface GraphData {
    nodes: Node[];
    links: Link[];
}

export function generateGraphData(quotes: Quote[]): GraphData {
    const nodes: Node[] = [];
    const links: Link[] = [];
    const linkSet = new Set<string>();

    // 1. Define Hubs (1-5)
    for (let i = 1; i <= 5; i++) {
        nodes.push({
            id: `Hub ${i}`,
            name: HUB_NAMES[i] || `Hub ${i}`,
            val: 20,
            group: i,
            level: 1
        });
    }

    // 2. Identify all unique Topics and link to Hubs
    const topics = new Set<string>();
    quotes.forEach(q => {
        q.topicIds.forEach(tid => {
            // Only process if it fits schema "X.Y"
            if (tid.includes('.')) {
                topics.add(tid);
            }
        });
    });

    topics.forEach(tid => {
        const hubId = tid.split('.')[0];
        if (hubId && parseInt(hubId) >= 1 && parseInt(hubId) <= 5) {
            nodes.push({
                id: tid,
                name: TOPIC_NAMES[tid] || tid,
                val: 10,
                group: parseInt(hubId),
                level: 2
            });

            // Link Hub -> Topic
            links.push({
                source: `Hub ${hubId}`,
                target: tid,
                value: 1
            });
        }
    });

    // 3. Create cross-links between Topics based on co-occurrence in quotes
    quotes.forEach(q => {
        // For each pair of topics in the quote
        for (let i = 0; i < q.topicIds.length; i++) {
            for (let j = i + 1; j < q.topicIds.length; j++) {
                const t1 = q.topicIds[i];
                const t2 = q.topicIds[j];

                // Skip if not valid topics in our graph (e.g. malformed IDs)
                if (!topics.has(t1) || !topics.has(t2)) continue;

                // Create a unique key for the link to avoid duplicates
                // Sort IDs so 1.1->1.2 is same as 1.2->1.1
                const [source, target] = [t1, t2].sort();
                const key = `${source}-${target}`;

                if (!linkSet.has(key)) {
                    linkSet.add(key);
                    links.push({ source, target, value: 0.5 });
                }
            }
        }
    });

    return { nodes, links };
}
