import React from 'react';

interface BoomboxSwitchProps {
    isRapOnly: boolean;
    onToggle: (checked: boolean) => void;
}

export const BoomboxSwitch: React.FC<BoomboxSwitchProps> = ({ isRapOnly, onToggle }) => {
    return (
        <div className="flex flex-col items-center relative gap-1">
            <div
                className="relative w-32 h-10 bg-zinc-800 rounded-sm border-2 border-zinc-600 shadow-inner flex items-center cursor-pointer select-none overflow-hidden"
                onClick={() => onToggle(!isRapOnly)}
            >
                {/* Background Texture/Grooves */}
                <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:4px_4px] opacity-20 pointer-events-none"></div>

                {/* Labels */}
                <div className="absolute left-2 text-[10px] font-bold text-zinc-500 font-mono tracking-tighter z-0">RAP ONLY</div>
                <div className="absolute right-3 text-[10px] font-bold text-zinc-500 font-mono tracking-tighter z-0">ALL MIX</div>

                {/* The Switch Knob */}
                <div
                    className={`absolute h-8 w-14 bg-zinc-300 rounded-sm shadow-[0_2px_4px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.8)] border-b-2 border-zinc-500 transition-all duration-300 ease-out z-10 flex items-center justify-center transform ${isRapOnly ? 'translate-x-1' : 'translate-x-[calc(100%+0.5rem)]' /* Adjusted translation */
                        }`}
                    style={{ left: 0 }} /* Positioning relies on translate */
                >
                    {/* Grip Lines on Knob */}
                    <div className="flex gap-1">
                        <div className="w-0.5 h-4 bg-zinc-400/50"></div>
                        <div className="w-0.5 h-4 bg-zinc-400/50"></div>
                        <div className="w-0.5 h-4 bg-zinc-400/50"></div>
                    </div>

                    {/* LED Indicator */}
                    <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full ${isRapOnly ? 'bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.8)]' : 'bg-zinc-400'} opacity-0`}></div>
                </div>
            </div>

            {/* External Label */}
            <div className="flex gap-8 text-[9px] text-zinc-500 font-mono uppercase tracking-widest">
                <span className={isRapOnly ? "text-[var(--accent)] drop-shadow-[0_0_5px_rgba(57,255,20,0.8)]" : ""}>Rap</span>
                <span className={!isRapOnly ? "text-zinc-300" : ""}>All</span>
            </div>

            {/* Mock "screws" */}
            {/* Mock "screws" */}
            <div className="absolute top-1 left-1 w-[calc(100%-8px)] flex justify-between pointer-events-none opacity-50">
                <div className="w-1 h-1 rounded-full bg-zinc-700 shadow-inner"></div>
                <div className="w-1 h-1 rounded-full bg-zinc-700 shadow-inner"></div>
            </div>
            <div className="absolute bottom-1 left-1 w-[calc(100%-8px)] flex justify-between pointer-events-none opacity-50">
                <div className="w-1 h-1 rounded-full bg-zinc-700 shadow-inner"></div>
                <div className="w-1 h-1 rounded-full bg-zinc-700 shadow-inner"></div>
            </div>
        </div>
    );
};
