'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useStore } from '@/store/useStore';
import { generateGraphData } from '@/utils/graphUtils';

// Dynamically import ForceGraph2D with no SSR
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
    ssr: false,
    loading: () => <div className="h-[500px] flex items-center justify-center text-zinc-600">Loading Visualization...</div>
});

export function MindMapViz() {
    const quotes = useStore((state) => state.quotes);
    const activeTopicIds = useStore((state) => state.activeTopicIds);
    const toggleTopic = useStore((state) => state.toggleTopic);
    const [windowWidth, setWindowWidth] = useState(1000);
    const [isOpen, setIsOpen] = useState(false);
    const fgRef = useRef<any>(null);

    // Helper to check if node is active
    const isNodeActive = (nodeId: string) => activeTopicIds.includes(nodeId);

    // Generate graph data once (or when quotes change)
    const graphData = useMemo(() => generateGraphData(quotes), [quotes]);

    useEffect(() => {
        setWindowWidth(window.innerWidth);
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    if (!isOpen) {
        return (
            <div className="w-full mb-12">
                <button
                    onClick={() => setIsOpen(true)}
                    className="w-full bg-neutral-900/50 hover:bg-neutral-800/80 border border-neutral-800 rounded-2xl p-6 text-center transition-all group relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_50%,rgba(57,255,20,0.03)_50%)] bg-[length:4px_4px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                    <h2 className="text-xl font-bold text-white mb-2 group-hover:text-[var(--accent)] transition-colors">Star Map</h2>
                    <p className="text-sm text-zinc-500">Chart your path through the virtues of the Force.</p>
                    <div className="mt-4 flex justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-600 group-hover:text-[var(--accent)] transition-colors animate-bounce"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </div>
                </button>
            </div>
        );
    }

    return (
        <div className="w-full h-[500px] md:h-[600px] bg-neutral-900/50 rounded-3xl border border-neutral-800 overflow-hidden mb-12 relative">
            <div className="absolute top-4 left-6 z-10 pointer-events-none">
                <h2 className="text-xl font-bold text-white mb-1">Star Map</h2>
                <p className="text-xs text-zinc-500">Chart your path through the virtues of the Force.</p>
            </div>

            <div className="absolute top-4 right-6 z-10 flex gap-2">
                {activeTopicIds.length > 0 && (
                    <button
                        onClick={() => useStore.getState().resetTopics()}
                        className="text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1.5 rounded-full hover:bg-red-500/20 transition-colors"
                    >
                        Clear Filters ({activeTopicIds.length})
                    </button>
                )}
                <button
                    onClick={() => setIsOpen(false)}
                    className="text-xs bg-neutral-800 text-zinc-400 border border-neutral-700 px-3 py-1.5 rounded-full hover:bg-neutral-700 hover:text-white transition-colors"
                >
                    Close
                </button>
            </div>

            <ForceGraph2D
                ref={fgRef}
                width={windowWidth > 1280 ? 1280 : windowWidth - 64} // Responsive width approximation
                height={600}
                graphData={graphData}
                backgroundColor="#0A0A0A"
                nodeLabel="name"
                nodeColor={(node: any) => isNodeActive(node.id) ? '#39FF14' : node.level === 1 ? '#ffffff' : '#404040'}
                nodeVal={(node: any) => node.val}
                linkColor={() => '#333333'}
                linkWidth={1}
                onNodeClick={(node: any) => {
                    // Only allow clicking topics (Level 2), or allow Hubs? 
                    // Let's allow clicking Hubs as well effectively selecting "Hub X" as a filter if we want, 
                    // but our logic assumes IDs are strictly matching quote topicIds using strings.
                    // Hubs are "Hub 1", topics are "1.1". Quotes only have "1.1".
                    // If we click "Hub 1", it won't match any quote topicIds directly.
                    // So let's restrict interaction to Level 2 nodes for filtering, or better yet, make toggling "Hub 1" meaningless for filtering unless we support hierarchical query.
                    // For now, let's only toggle topics (Level 2).
                    if (node.level === 2) {
                        toggleTopic(node.id);
                    }
                }}
                // Custom canvas painting for better control if needed, but props above work well for simple needs.
                // Let's add a glowing effect for active nodes
                nodeCanvasObject={(node: any, ctx, globalScale) => {
                    const label = node.name;
                    const fontSize = 12 / globalScale;
                    const radius = Math.sqrt(node.val) * 2; // base size
                    const isActive = isNodeActive(node.id);
                    const isHub = node.level === 1;

                    // Draw Node
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
                    ctx.fillStyle = isActive ? '#39FF14' : isHub ? '#ffffff' : '#404040';
                    ctx.fill();

                    // Glow for active
                    if (isActive) {
                        ctx.shadowColor = '#39FF14';
                        ctx.shadowBlur = 10;
                        ctx.stroke();
                        ctx.shadowBlur = 0;
                    }

                    // Draw Label
                    // Show label if active, is hub, or zoomed in
                    if (isActive || isHub || globalScale > 1.5) {
                        ctx.font = `${isActive ? 'bold' : ''} ${fontSize}px Sans-Serif`;
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillStyle = isActive ? '#39FF14' : isHub ? '#ffffff' : '#808080';
                        ctx.fillText(label, node.x, node.y + radius + fontSize);
                    }
                }}
                nodeCanvasObjectMode={() => 'replace'} // We draw the node ourselves
            />
        </div>
    );
}
