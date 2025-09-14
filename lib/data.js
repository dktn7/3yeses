"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockTalents = void 0;
exports.filterTalents = filterTalents;
exports.getCategoryData = getCategoryData;
exports.searchTalents = searchTalents;
exports.getAllTalents = getAllTalents;
exports.getSubSubCategories = getSubSubCategories;
exports.getTalentsBySubCategory = getTalentsBySubCategory;
exports.fetchTalentsByCategory = fetchTalentsByCategory;
// Inclusive mock talents data
exports.mockTalents = [
    {
        id: '1',
        name: 'Sarah Johnson',
        role: 'Lead Actress',
        category: 'actors',
        subcategory: 'female-actor',
        skills: ['Method Acting', 'Stage Combat', 'Accent Work'],
        videoUrl: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4',
        avatarUrl: 'https://randomuser.me/api/portraits/women/1.jpg',
        location: 'Los Angeles, CA',
        experience: 8,
        rating: 4.9,
        languages: ['English', 'Spanish'],
        bio: 'A passionate and versatile actress with a strong background in classical and contemporary theatre.',
        gender: 'female',
        ethnicity: 'Caucasian',
        age: 28,
        height: 165,
        bodyType: 'slim',
        eyeColor: 'Blue',
        hairColor: 'Blonde',
        socialMedia: [{ platform: 'Instagram', url: 'https://instagram.com/sarahj' }],
        portfolio: [
            { title: 'Monologue from Hamlet', url: 'https://www.youtube.com/watch?v=abc123', type: 'video' },
            { title: 'Headshot 1', url: 'https://randomuser.me/api/portraits/women/1.jpg', type: 'image' },
        ],
        reviews: [{ reviewer: 'John Doe', rating: 5, comment: 'A true professional.' }],
        isBeginner: false,
        viewCount: 2847,
        likeCount: 120,
    },
    {
        id: '2',
        name: 'Alex Kim',
        role: 'Non-binary Actor',
        category: 'actors',
        subcategory: 'nonbinary-actor',
        skills: ['Improv', 'Physical Theatre'],
        videoUrl: '',
        avatarUrl: '',
        location: 'San Francisco, CA',
        experience: 4,
        rating: 4.7,
        languages: ['English'],
        bio: 'Energetic non-binary performer with a love for experimental theatre.',
        gender: 'non-binary',
        ethnicity: 'Asian',
        age: 24,
        height: 170,
        bodyType: 'athletic',
        eyeColor: 'Brown',
        hairColor: 'Black',
        socialMedia: [],
        portfolio: [],
        reviews: [],
        isBeginner: true,
        viewCount: 1200,
        likeCount: 45,
    },
    {
        id: '3',
        name: 'Marcus Williams',
        role: 'Male Lead Actor',
        category: 'actors',
        subcategory: 'male-actor',
        skills: ['Stage Combat', 'Comedy'],
        videoUrl: '',
        avatarUrl: '',
        location: 'Atlanta, GA',
        experience: 6,
        rating: 4.8,
        languages: ['English'],
        bio: 'Versatile male actor with experience in both drama and comedy.',
        gender: 'male',
        ethnicity: 'African American',
        age: 31,
        height: 180,
        bodyType: 'average',
        eyeColor: 'Green',
        hairColor: 'Brown',
        socialMedia: [],
        portfolio: [],
        reviews: [],
        isBeginner: false,
        viewCount: 2100,
        likeCount: 88,
    },
    {
        id: '4',
        name: 'Taylor Lee',
        role: 'Child Actor',
        category: 'actors',
        subcategory: 'child-actor',
        skills: ['Singing', 'Dance'],
        videoUrl: '',
        avatarUrl: '',
        location: 'Toronto, ON',
        experience: 2,
        rating: 4.5,
        languages: ['English', 'French'],
        bio: 'Young performer with a passion for musicals.',
        gender: 'female',
        ethnicity: 'Mixed Race',
        age: 12,
        height: 145,
        bodyType: 'slim',
        eyeColor: 'Hazel',
        hairColor: 'Brown',
        socialMedia: [],
        portfolio: [],
        reviews: [],
        isBeginner: true,
        viewCount: 500,
        likeCount: 12,
    },
];
// Enhanced filtering function
function filterTalents(talents, filters) {
    return talents.filter(function (talent) {
        var checks = [
            filters.gender && filters.gender.length > 0 ? filters.gender.includes(talent.gender) : true,
            filters.ethnicity && filters.ethnicity.length > 0 ? filters.ethnicity.includes(talent.ethnicity) : true,
            filters.ageRange ? (talent.age >= filters.ageRange.min && talent.age <= filters.ageRange.max) : true,
            filters.heightRange ? (talent.height >= filters.heightRange.min && talent.height <= filters.heightRange.max) : true,
            filters.bodyType && filters.bodyType.length > 0 ? filters.bodyType.includes(talent.bodyType) : true,
            filters.experience ? (talent.experience >= filters.experience.min && talent.experience <= filters.experience.max) : true,
            // availability filter removed
            filters.location ? talent.location.toLowerCase().includes(filters.location.toLowerCase()) : true,
        ];
        return checks.every(Boolean);
    });
}
// Inclusive categories/subcategories used by SearchClient and category pickers
function getCategoryData() {
    return [
        {
            id: 'actors',
            name: 'Actors',
            subcategories: [
                { id: 'female-actor', name: 'Female Actor', description: 'Women and femme-identifying actors' },
                { id: 'male-actor', name: 'Male Actor', description: 'Men and masc-identifying actors' },
                { id: 'nonbinary-actor', name: 'Non-binary Actor', description: 'Non-binary and gender-diverse actors' },
                { id: 'child-actor', name: 'Child Actor', description: 'Young performers and minors' },
            ],
        },
        {
            id: 'musicians',
            name: 'Musicians',
            subcategories: [
                { id: 'singers', name: 'Singers' },
                { id: 'guitarists', name: 'Guitarists' },
                { id: 'producers', name: 'Producers' },
            ],
        },
        {
            id: 'dancers',
            name: 'Dancers',
            subcategories: [
                { id: 'contemporary-dancers', name: 'Contemporary Dancers' },
                { id: 'ballet-dancers', name: 'Ballet Dancers' },
                { id: 'hiphop-dancers', name: 'Hip Hop Dancers' },
            ],
        },
    ];
}
// Search talents by name, role, skills, or category with optional filters
function searchTalents(query, filters) {
    if (!query.trim()) {
        return [];
    }
    var searchTerm = query.toLowerCase().trim();
    return exports.mockTalents.filter(function (talent) {
        var _a, _b;
        var matchesQuery = (talent.name.toLowerCase().includes(searchTerm) ||
            talent.role.toLowerCase().includes(searchTerm) ||
            talent.category.toLowerCase().includes(searchTerm) ||
            talent.skills.some(function (skill) { return skill.toLowerCase().includes(searchTerm); }) ||
            talent.bio.toLowerCase().includes(searchTerm) ||
            talent.location.toLowerCase().includes(searchTerm) ||
            ((_a = talent.gender) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(searchTerm)) ||
            ((_b = talent.ethnicity) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes(searchTerm)));
        var matchesFilters = (!filters || ((!filters.gender.length || filters.gender.includes(talent.gender)) &&
            (!filters.ethnicity.length || filters.ethnicity.includes(talent.ethnicity)) &&
            (!filters.eyeColor.length || filters.eyeColor.includes(talent.eyeColor)) &&
            (!filters.hairColor.length || filters.hairColor.includes(talent.hairColor)) &&
            (!filters.skills.length || filters.skills.every(function (skill) { return talent.skills.includes(skill); })) &&
            (!filters.languages.length || filters.languages.every(function (lang) { return talent.languages.includes(lang); })) &&
            (!filters.location || talent.location.toLowerCase().includes(filters.location.toLowerCase()))));
        return matchesQuery && matchesFilters;
    });
}
// Get all talents for global search
function getAllTalents() {
    return exports.mockTalents;
}
function getSubSubCategories(subcategoryId) {
    // If a subcategoryId is provided we could compute sub-subcategories; mock data has none.
    if (subcategoryId) {
        // noop - kept to acknowledge the parameter for callers
    }
    return [];
}
function getTalentsBySubCategory(subcategoryId) {
    // Return talents where the talent.subcategory or talent.category matches the given id
    return exports.mockTalents.filter(function (t) { return t.subcategory === subcategoryId || t.category === subcategoryId; });
}
// Backwards-compatible alias used in some client pages
function fetchTalentsByCategory(categoryId) {
    return getTalentsBySubCategory(categoryId);
}
