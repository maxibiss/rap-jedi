import rawQuotes from '../../data/quotes_data.json';

export interface Quote {
    id: number;
    text: string;
    author: string;
    sourceType: string;
    sourceTitle: string;
    isPinned: boolean;
    topicIds: string[];
    favoritesCount?: number;
}

export const QUOTES: Quote[] = rawQuotes.map((q: any) => ({
    id: parseInt(q.quote_id),
    text: q.quote_text,
    author: q.author,
    sourceType: q.source_type,
    sourceTitle: q.source_title,
    isPinned: q.is_pinned === "true",
    topicIds: q.topic_ids ? q.topic_ids.split(',').map((id: string) => id.trim()) : []
}));
