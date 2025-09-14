"use client";

import { Camera, Wrench, Paintbrush, Cog, Music } from "lucide-react";

const icons = [
	// Far left edge only - extreme whitespace
	{ Icon: Camera, animation: "animate-pulse", startPos: "top-[25%] left-[0.5%]", id: "camera-left" },
	{ Icon: Music, animation: "animate-bounce", startPos: "top-[65%] left-[0.5%]", id: "music-left" },
	// Far right edge only - extreme whitespace  
	{ Icon: Wrench, animation: "animate-pulse", startPos: "top-[35%] right-[0.5%]", id: "wrench-right" },
	{ Icon: Cog, animation: "animate-bounce", startPos: "top-[75%] right-[0.5%]", id: "cog-right" },
	// Top corner extreme whitespace only
	{ Icon: Paintbrush, animation: "animate-pulse", startPos: "top-[1%] left-[1%]", id: "brush-top-left" },
	{ Icon: Camera, animation: "animate-bounce", startPos: "top-[1%] right-[1%]", id: "camera-top-right" },
];

export default function AnimatedIcons() {
	return (
		<div className="fixed inset-0 w-full h-full overflow-hidden z-10 pointer-events-none">
			{icons.map(({ Icon, animation, startPos, id }) => (
				<div
					key={id}
					className={`absolute ${startPos} w-8 h-8`}
				>
					<Icon
						className={`w-full h-full text-gray-400 dark:text-gray-600 ${animation} opacity-15`}
						strokeWidth={0.3}
					/>
				</div>
			))}
		</div>
	);
}
