// app/categories/[categoryId]/page.tsx
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Search } from "lucide-react";
import CategoryFilter from '@/components/CategoryFilter';
import { fetchTalentsByCategory } from '@/lib/data.ts';
import { FaRegUser } from "react-icons/fa6";
import type { Talent } from '@/lib/data.ts';
import Image from "next/image";
import FeaturedTalentCard from '@/components/FeaturedTalentCard';
import MediaOverlay from '@/components/MediaOverlay';

export default function CategoryPage() {
    const params = useParams();
    const router = useRouter();
    const [talents, setTalents] = useState<Talent[]>([]);
    const [selectedMediaItem, setSelectedMediaItem] = useState<any | null>(null);
    const categoryId = params && Array.isArray(params.categoryId)
        ? params.categoryId[0]
        : params?.categoryId;
    const categoryIdStr: string = Array.isArray(categoryId) ? categoryId[0] : (categoryId || 'all');

    useEffect(() => {
        const loadTalents = async () => {
            const data = await fetchTalentsByCategory(categoryIdStr);
            setTalents(data);
        };
        loadTalents();
    }, [categoryIdStr]);

    const allMediaItems = useMemo(() => {
        return talents.flatMap(talent => 
            (talent.portfolio || []).map((item, index) => ({
                id: `${talent.id}-media-${index}`,
                title: item.title,
                url: item.url,
                type: item.type.toUpperCase() as 'IMAGE' | 'VIDEO' | 'AUDIO',
                thumbnail: item.type === 'video' ? undefined : item.url,
                talentProfile: {
                    id: talent.id,
                    user: { name: talent.name },
                    avatarUrl: talent.avatarUrl,
                    category: { name: talent.category },
                    location: talent.location
                },
                views: 0,
                likes: 0,
                createdAt: new Date().toISOString()
            }))
        );
    }, [talents]);

    // Sync URL with selectedMediaItem
    useEffect(() => {
        const mediaId = searchParams.get('mediaId');
        if (mediaId && allMediaItems.length > 0) {
            const item = allMediaItems.find(i => i.id === mediaId);
            if (item) {
                setSelectedMediaItem(item);
            }
        } else if (!mediaId) {
            setSelectedMediaItem(null);
        }
    }, [searchParams, allMediaItems]);

    const handleMediaSelect = (item: any) => {
        setSelectedMediaItem(item);
        const params = new URLSearchParams(searchParams.toString());
        params.set('mediaId', item.id);
        router.push(`?${params.toString()}`, { scroll: false });
    };

    const handleCloseOverlay = () => {
        setSelectedMediaItem(null);
        const params = new URLSearchParams(searchParams.toString());
        params.delete('mediaId');
        router.push(`?${params.toString()}`, { scroll: false });
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Main Content */}
            <div className="flex flex-col">
                {/* Search Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center border rounded-full px-4 py-2 shadow">
                            <Search size={20} className="text-gray-500 mr-2" />
                            <input
                                type="text"
                                placeholder="Search talents..."
                                className="outline-none bg-transparent w-64"
                            />
                        </div>
                    </div>
                    <FaRegUser
                        size={40}
                        className="text-gray-500 cursor-pointer hover:text-blue-500"
                    />
                </div>

                {/* Category Content */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 p-6">
                    <div className="lg:col-span-1">
                        <CategoryFilter categories={['actors', 'dancers', 'singers', 'crew']} />
                    </div>

                    {/* Talent Grid */}
                    <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {talents.length > 0 ? (
                            talents.map((talent) => (
                                <FeaturedTalentCard
                                    key={talent.id}
                                    talent={{
                                        id: talent.id,
                                        user: { name: talent.name },
                                        avatarUrl: talent.avatarUrl,
                                        category: { name: talent.category },
                                        skills: talent.skills
                                    }}
                                    mediaItems={(talent.portfolio || []).map((item, index) => ({
                                        id: `${talent.id}-media-${index}`,
                                        title: item.title,
                                        url: item.url,
                                        type: item.type.toUpperCase() as 'IMAGE' | 'VIDEO' | 'AUDIO',
                                        thumbnail: item.type === 'video' ? undefined : item.url,
                                        talentProfile: {
                                            id: talent.id,
                                            user: { name: talent.name },
                                            avatarUrl: talent.avatarUrl,
                                            category: { name: talent.category }
                                        },
                                        views: 0,
                                        likes: 0,
                                        createdAt: new Date().toISOString()
                                    }))}
                                    onMediaClick={handleMediaSelect}
                                    onProfileClick={() => router.push(`/talent/${talent.id}`)}
                                />
                            ))
                        ) : (
                            <div className="col-span-full text-center py-12">
                                <p className="text-gray-500 text-lg">
                                    No talents found in this category
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {/* Media Overlay */}
            {selectedMediaItem && (
                <MediaOverlay
                    media={selectedMediaItem}
                    allMedia={allMediaItems}
                    onClose={handleCloseOverlay}
                    onMediaSelect={handleMediaSelect}
                />
            )}
        </div>
    );
}