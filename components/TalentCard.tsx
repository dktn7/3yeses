'use client';

import Link from 'next/link';
import { Talent } from '@/lib/data.ts';
import Image from "next/image";
import { getCategoryIconByName } from '@/lib/categoryIcons';
import { getSafeAvatarUrl, shouldBeUnoptimized } from '@/lib/image-utils';

export default function TalentCard({ talent }: { talent: Talent }) {
    const safeAvatarUrl = getSafeAvatarUrl(talent.avatarUrl);
    const unoptimized = shouldBeUnoptimized(talent.avatarUrl);
    const CategoryIcon = getCategoryIconByName(talent.category);
    
    return (
        <Link
            href={`/talent/${(talent as any).userId ?? talent.id}`}
            className="group bg-light-surface dark:bg-dark-surface rounded-xl shadow-md hover:shadow-xl transition-all duration-300 block hover:bg-primary-blue dark:hover:bg-accent-red hover:border-blue-300 dark:hover:border-red-600"
        >
            <div className="p-6">
                {/* Profile Header */}
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full bg-light-surface/20 dark:bg-dark-surface/20 flex items-center justify-center overflow-hidden">
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
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg text-light-surface dark:text-dark-surface group-hover:text-white dark:group-hover:text-white">{talent.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-white/90 dark:group-hover:text-white/90">{talent.role}</p>
                        <div className="mt-2">
                                                <Link
                                                        href={talent.category ? `/categories?category=${encodeURIComponent(talent.category)}` : '/categories'}
                                                        className="inline-flex items-center gap-2 text-xs md:text-sm font-semibold text-primary-blue dark:text-accent-red px-2 py-1 rounded-full bg-primary-blue/10 dark:bg-accent-red/15 border border-primary-blue/20 dark:border-accent-red/20 hover:bg-primary-blue/20 dark:hover:bg-accent-red/25 transition-all group-hover:bg-light-surface/10 group-hover:text-white"
                                                        aria-label={`Browse ${talent.category ?? 'all'} talents`}
                                                    >
                            <span className="inline-flex p-1 bg-light-surface/20 dark:bg-dark-surface/20 rounded-full shadow-sm">
                              <CategoryIcon className="w-4 h-4 text-white" />
                            </span>
                            <span className="max-w-[140px] md:max-w-[180px] overflow-hidden text-ellipsis whitespace-nowrap md:whitespace-normal md:line-clamp-2">
                              {talent.category || 'All'}
                            </span>
                          </Link>
                        </div>
                    </div>
                </div>

                {/* Skills */}
                <div className="flex flex-wrap gap-2 mb-4">
                    {talent.skills.slice(0, 4).map((skill: string) => (
                        <span
                            key={skill}
                            className="px-3 py-1 bg-[var(--marketing-pill-bg)] dark:bg-[var(--marketing-pill-bg)] text-[var(--marketing-pill-icon)] dark:text-[var(--marketing-pill-icon)] border border-[var(--marketing-pill-border)] text-sm rounded-full"
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