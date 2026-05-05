"use client";

import { getAvailableCategoryIconNames, getCategoryIconByName } from '@/lib/categoryIcons';

const AVAILABLE = getAvailableCategoryIconNames();

const decorations = [
	{ idx: 0, animation: 'animate-pulse', startPos: 'top-[25%] left-[0.5%]', id: 'dec-0' },
	{ idx: 1, animation: 'animate-bounce', startPos: 'top-[65%] left-[0.5%]', id: 'dec-1' },
	{ idx: 2, animation: 'animate-pulse', startPos: 'top-[35%] right-[0.5%]', id: 'dec-2' },
	{ idx: 3, animation: 'animate-bounce', startPos: 'top-[75%] right-[0.5%]', id: 'dec-3' },
	{ idx: 4, animation: 'animate-pulse', startPos: 'top-[1%] left-[1%]', id: 'dec-4' },
	{ idx: 5, animation: 'animate-bounce', startPos: 'top-[1%] right-[1%]', id: 'dec-5' },
];

export default function AnimatedIcons() {
	return (
		<div className="fixed inset-0 w-full h-full overflow-hidden z-10 pointer-events-none">
			{decorations.map(({ idx, animation, startPos, id }) => {
				const key = AVAILABLE[idx % AVAILABLE.length];
				const Icon = getCategoryIconByName(undefined, key);
				if (!Icon) return null;
				return (
					<div key={id} className={`absolute ${startPos} w-8 h-8`}>
						<Icon className={`w-full h-full text-gray-400 dark:text-gray-600 ${animation} opacity-15`} />
					</div>
				);
			})}
		</div>
	);
}
