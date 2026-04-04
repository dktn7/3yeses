'use client';

import Link from 'next/link';
import { Talent } from '@/lib/data.ts';
import Image from "next/image";
import { getSafeAvatarUrl, shouldBeUnoptimized } from '@/lib/image-utils';

export default function TalentCard({ talent }: { talent: Talent }) {
    const safeAvatarUrl = getSafeAvatarUrl(talent.avatarUrl);
    const unoptimized = shouldBeUnoptimized(talent.avatarUrl);
    
    return (
        <Link
            href={`/talent/${(talent as any).userId ?? talent.id}`}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 block"
        >
            <div className="p-6">
                {/* Profile Header */}
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                        {safeAvatarUrl ? (
                            <Image
                                src={safeAvatarUrl}
                                alt={talent.name}
                                width={64}
                                height={64}
                                className="w-full h-full rounded-full object-cover"
                                unoptimized={unoptimized}
                            />
                        ) : (
                            <span className="text-gray-500 dark:text-gray-400 text-2xl">👤</span>
                        )}
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">{talent.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{talent.role}</p>
                    </div>
                </div>

                {/* Skills */}
                <div className="flex flex-wrap gap-2 mb-4">
                    {talent.skills.slice(0, 4).map((skill: string) => (
                        <span
                            key={skill}
                            className="px-3 py-1 bg-blue-100 dark:bg-red-900/30 text-blue-800 dark:text-red-300 text-sm rounded-full"
                        >
                            {skill}
                        </span>
                    ))}
                </div>

                {/* Stats */}
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <div className="text-center">
                        <div className="font-bold">{talent.likeCount || 0}</div>
                        <div>Likes</div>
                    </div>
                    <div className="text-center">
                        <div className="font-bold">{talent.experienceLevel || 5}yrs</div>
                        <div>Experience</div>
                    </div>
                </div>
            </div>
        </Link>
    );
}