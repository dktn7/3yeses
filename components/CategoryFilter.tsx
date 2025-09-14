'use client';

import { useRouter } from 'next/navigation';

export default function CategoryFilter({ categories }: { categories: string[] }) {
    const router = useRouter();

    const handleCategoryChange = (selectedCategory: string) => {
        router.push(`/categories/${selectedCategory}`);
    };

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">Filter by Category</h3>
            <select
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full p-3 border rounded-lg bg-white"
            >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                    <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                ))}
            </select>
        </div>
    );
}