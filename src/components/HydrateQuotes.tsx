'use client';

import { useEffect, useRef } from 'react';
import { useStore } from '@/store/useStore';
import { Quote } from '@/data/quotes';

export function HydrateQuotes({ quotes }: { quotes: Quote[] }) {
    const initialized = useRef(false);

    // We only want to set this once on mount
    if (!initialized.current) {
        useStore.setState({ quotes, filteredQuotes: quotes });
        initialized.current = true;
    }

    return null;
}
