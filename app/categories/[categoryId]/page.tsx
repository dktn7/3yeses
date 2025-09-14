// app/categories/[categoryId]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Search } from "lucide-react";
import CategoryFilter from '@/components/CategoryFilter';
import { fetchTalentsByCategory } from '@/lib/data';
import { FaRegUser } from "react-icons/fa6";
import type { Talent } from '@/lib/data';
import Image from "next/image";


export default function CategoryPage() {
    const params = useParams();
    const [talents, setTalents] = useState<Talent[]>([]);
    const categoryId = Array.isArray(params.categoryId)
        ? params.categoryId[0]
        : params.categoryId;

    useEffect(() => {
        const loadTalents = async () => {
            const data = await fetchTalentsByCategory(categoryId || 'all');
            setTalents(data);
        };
        loadTalents();
    }, [categoryId]);

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
                                <div
                                    key={talent.id}
                                    className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all"
                                >
                                    {/* Talent Card Header */}
                                    <div className="p-4 border-b">
                                        <div className="flex items-center gap-3">
                                            <Image
                                                src={talent.avatarUrl || '/default-avatar.png'}
                                                alt={talent.name}
                                                width={48}
                                                height={48}
                                                className="w-12 h-12 rounded-full object-cover"
                                            />
                                            <div>
                                                <h3 className="font-bold text-lg">{talent.name}</h3>
                                                <p className="text-sm text-gray-600">{talent.role}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Skills Section */}
                                    <div className="p-4">
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {talent.skills.map((skill: string) => (
                                                <span
                                                    key={skill}
                                                    className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                                                >
                          {skill}
                        </span>
                                            ))}
                                        </div>

                                        {/* Stats Footer */}
                                        <div className="flex justify-between text-center">
                                            <div>
                                                <div className="font-bold text-green-500">{talent.rating}</div>
                                                <div className="text-xs text-gray-600">Rating</div>
                                            </div>
                                            <div>
                                                <div className="font-bold text-green-500">32</div>
                                                <div className="text-xs text-gray-600">Projects</div>
                                            </div>
                                            <div>
                                                <div className="font-bold text-green-500">{talent.experience}yrs</div>
                                                <div className="text-xs text-gray-600">Experience</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
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
        </div>
    );
}