'use client';

import Link from 'next/link';
import { Talent } from '@/lib/data';
import Image from "next/image";

export default function TalentCard({ talent }: { talent: Talent }) {
    return (
        <Link
            href={`/talent/${talent.id}`}
            className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300"
        >
            <div className="p-6">
                {/* Profile Header */}
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                        {talent.avatarUrl ? (
                            <Image
                                src={talent.avatarUrl}
                                alt={talent.name}
                                width={64}
                                height={64}
                                className="w-full h-full rounded-full object-cover"
                            />
                        ) : (
                            <span className="text-gray-500 text-2xl">👤</span>
                        )}
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-black">{talent.name}</h3>
                        <p className="text-sm text-gray-600">{talent.role}</p>
                    </div>
                </div>

                {/* Skills */}
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

                {/* Stats */}
                <div className="flex justify-between text-sm text-gray-600">
                    <div className="text-center">
                        <div className="font-bold">{talent.rating?.toFixed(1) || '4.9'}</div>
                        <div>Rating</div>
                    </div>
                    <div className="text-center">
                        <div className="font-bold">{talent.likeCount || 0}</div>
                        <div>Likes</div>
                    </div>
                    <div className="text-center">
                        <div className="font-bold">{talent.experience || 5}yrs</div>
                        <div>Experience</div>
                    </div>
                </div>
            </div>
        </Link>
    );
}