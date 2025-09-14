var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
var PrismaClient = require('@prisma/client').PrismaClient;
var bcrypt = require('bcryptjs');
var prisma = new PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var adminPassword, adminHashedPassword, categories, _i, categories_1, category, createdCategory, sampleUserPassword, voiceOverCategory, commercialsSubcat, talentUser1, translationCategory, documentSubcat, talentUser2, adminUser, talent1Profile, talent2Profile, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 29, 30, 32]);
                    console.log("Start seeding ...");
                    // Clear existing data
                    console.log('Clearing existing data...');
                    return [4 /*yield*/, prisma.portfolioItem.deleteMany()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, prisma.review.deleteMany()];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, prisma.booking.deleteMany()];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, prisma.talentProfile.deleteMany()];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, prisma.user.deleteMany()];
                case 5:
                    _a.sent();
                    return [4 /*yield*/, prisma.subcategory.deleteMany()];
                case 6:
                    _a.sent();
                    return [4 /*yield*/, prisma.category.deleteMany()];
                case 7:
                    _a.sent();
                    console.log('Existing data cleared.');
                    // Create a default admin user
                    console.log('Creating admin user...');
                    adminPassword = 'AdminPassword123!';
                    return [4 /*yield*/, bcrypt.hash(adminPassword, 12)];
                case 8:
                    adminHashedPassword = _a.sent();
                    return [4 /*yield*/, prisma.user.create({
                            data: {
                                email: 'admin@example.com',
                                name: 'Admin User',
                                password: adminHashedPassword,
                                role: 'ADMIN',
                                emailVerified: new Date(), // Pre-verify the admin user
                            },
                        })];
                case 9:
                    _a.sent();
                    console.log('Admin user created with email: admin@example.com and password: ${adminPassword}');
                    console.log('Please change this password in a production environment!');
                    // Create categories and subcategories
                    console.log('Creating categories and subcategories...');
                    categories = [
                        {
                            name: 'Voice Over & Dubbing',
                            icon: '🎙️',
                            description: 'Professional voice acting and dubbing services',
                            subcategories: [
                                'Commercials',
                                'E-learning',
                                'Audiobooks',
                                'Animation',
                                'Video Games',
                                'Narration',
                                'IVR & Phone Systems'
                            ]
                        },
                        {
                            name: 'Translation & Localization',
                            icon: '🌍',
                            description: 'Professional translation and localization services',
                            subcategories: [
                                'Document Translation',
                                'Website Localization',
                                'Software Localization',
                                'Subtitling & Captioning',
                                'Technical Translation',
                                'Legal Translation',
                                'Medical Translation'
                            ]
                        },
                        {
                            name: 'Content Creation',
                            icon: '✍️',
                            description: 'Creative writing and content development',
                            subcategories: [
                                'Blog & Article Writing',
                                'Copywriting',
                                'Social Media Content',
                                'Video Scripting',
                                'Product Descriptions',
                                'Email Marketing',
                                'SEO Content'
                            ]
                        },
                        {
                            name: 'Music & Audio',
                            icon: '🎵',
                            description: 'Music composition and audio production',
                            subcategories: [
                                'Pop Music',
                                'Rock Music',
                                'Jazz Music',
                                'Classical Music',
                                'Hip Hop Music',
                                'Country Music',
                                'Electronic Music',
                                'R&B Music',
                                'Folk Music',
                                'Audio Production',
                                'Sound Design'
                            ]
                        },
                        {
                            name: 'Video Production',
                            icon: '🎬',
                            description: 'Video creation and editing services',
                            subcategories: [
                                'Video Editing',
                                'Motion Graphics',
                                'Animation',
                                'Promotional Videos',
                                'Explainer Videos',
                                'Social Media Videos',
                                'Documentary Production'
                            ]
                        },
                        {
                            name: 'Acting & Performance',
                            icon: '🎭',
                            description: 'Professional acting and performance talent',
                            subcategories: [
                                'Theatre Acting',
                                'Film Acting',
                                'TV Acting',
                                'Voice Acting',
                                'Commercial Acting',
                                'Background Acting',
                                'Character Acting'
                            ]
                        },
                        {
                            name: 'Modeling',
                            icon: '📸',
                            description: 'Professional modeling services',
                            subcategories: [
                                'Fashion Modeling',
                                'Commercial Modeling',
                                'Hand Modeling',
                                'Fitness Modeling',
                                'Product Modeling',
                                'Lifestyle Modeling',
                                'Plus Size Modeling'
                            ]
                        },
                        {
                            name: 'Dancing & Choreography',
                            icon: '💃',
                            description: 'Professional dance and choreography services',
                            subcategories: [
                                'Contemporary Dance',
                                'Hip Hop',
                                'Ballet',
                                'Jazz Dance',
                                'Latin Dance',
                                'Choreography',
                                'Dance Instruction'
                            ]
                        },
                        {
                            name: 'Beauty & Wellness',
                            icon: '💄',
                            description: 'Beauty, wellness and lifestyle services',
                            subcategories: [
                                'Makeup Artist',
                                'Hair Styling',
                                'Beauty Consulting',
                                'Wellness Coaching',
                                'Fitness Training',
                                'Nutrition Consulting',
                                'Spa Services'
                            ]
                        },
                        {
                            name: 'Sports & Fitness',
                            icon: '🏃',
                            description: 'Sports and fitness talent services',
                            subcategories: [
                                'Personal Training',
                                'Sports Coaching',
                                'Fitness Modeling',
                                'Athletic Performance',
                                'Sports Commentary',
                                'Fitness Instruction',
                                'Sports Demonstration'
                            ]
                        }
                    ];
                    _i = 0, categories_1 = categories;
                    _a.label = 10;
                case 10:
                    if (!(_i < categories_1.length)) return [3 /*break*/, 13];
                    category = categories_1[_i];
                    return [4 /*yield*/, prisma.category.create({
                            data: {
                                name: category.name,
                                icon: category.icon,
                                description: category.description,
                                subcategories: {
                                    create: category.subcategories.map(function (name) { return ({ name: name }); }),
                                },
                            },
                        })];
                case 11:
                    createdCategory = _a.sent();
                    console.log("Created category: ".concat(createdCategory.name));
                    _a.label = 12;
                case 12:
                    _i++;
                    return [3 /*break*/, 10];
                case 13:
                    console.log('Categories and subcategories created.');
                    // Create sample users
                    console.log('Creating sample users...');
                    return [4 /*yield*/, bcrypt.hash('password123', 10)];
                case 14:
                    sampleUserPassword = _a.sent();
                    // Create admin user
                    return [4 /*yield*/, prisma.user.create({
                            data: {
                                name: 'Admin User',
                                email: 'admin@3yeses.com',
                                password: sampleUserPassword,
                                role: 'ADMIN',
                                emailVerified: new Date()
                            }
                        })];
                case 15:
                    // Create admin user
                    _a.sent();
                    return [4 /*yield*/, prisma.category.findFirst({ where: { name: 'Voice Over & Dubbing' } })];
                case 16:
                    voiceOverCategory = _a.sent();
                    return [4 /*yield*/, prisma.subcategory.findFirst({ where: { name: 'Commercials' } })];
                case 17:
                    commercialsSubcat = _a.sent();
                    return [4 /*yield*/, prisma.user.create({
                            data: {
                                name: 'Sarah Johnson',
                                email: 'sarah@example.com',
                                password: sampleUserPassword,
                                role: 'TALENT',
                                emailVerified: new Date(),
                                talentProfile: {
                                    create: {
                                        roleDescription: 'Professional Voice Over Artist',
                                        bio: 'Experienced voice over artist with 8+ years in commercials and e-learning. Warm, friendly tone perfect for brands targeting millennials.',
                                        location: 'Los Angeles, CA',
                                        experience: 8,
                                        rating: 4.9,
                                        languages: ['English', 'Spanish'],
                                        skills: ['Commercial Voice Over', 'E-learning Narration', 'Character Voices', 'IVR Systems'],
                                        categoryId: voiceOverCategory === null || voiceOverCategory === void 0 ? void 0 : voiceOverCategory.id,
                                        subcategoryId: commercialsSubcat === null || commercialsSubcat === void 0 ? void 0 : commercialsSubcat.id,
                                        avatarUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=400&h=400&fit=crop&crop=face',
                                        viewCount: 247
                                    }
                                }
                            }
                        })];
                case 18:
                    talentUser1 = _a.sent();
                    return [4 /*yield*/, prisma.category.findFirst({ where: { name: 'Translation & Localization' } })];
                case 19:
                    translationCategory = _a.sent();
                    return [4 /*yield*/, prisma.subcategory.findFirst({ where: { name: 'Document Translation' } })];
                case 20:
                    documentSubcat = _a.sent();
                    return [4 /*yield*/, prisma.user.create({
                            data: {
                                name: 'Carlos Rodriguez',
                                email: 'carlos@example.com',
                                password: sampleUserPassword,
                                role: 'TALENT',
                                emailVerified: new Date(),
                                talentProfile: {
                                    create: {
                                        roleDescription: 'Certified Spanish-English Translator',
                                        bio: 'Native bilingual translator specializing in legal and medical documents. 10+ years experience with perfect accuracy record.',
                                        location: 'Madrid, Spain',
                                        experience: 10,
                                        rating: 4.9,
                                        languages: ['Spanish', 'English', 'Portuguese'],
                                        skills: ['Legal Translation', 'Medical Translation', 'Technical Documentation', 'Certified Translation'],
                                        categoryId: translationCategory === null || translationCategory === void 0 ? void 0 : translationCategory.id,
                                        subcategoryId: documentSubcat === null || documentSubcat === void 0 ? void 0 : documentSubcat.id,
                                        avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
                                        viewCount: 189
                                    }
                                }
                            }
                        })];
                case 21:
                    talentUser2 = _a.sent();
                    console.log('Sample users created.');
                    return [4 /*yield*/, prisma.user.findFirst({ where: { email: 'admin@example.com' } })];
                case 22:
                    adminUser = _a.sent();
                    return [4 /*yield*/, prisma.talentProfile.findFirst({ where: { userId: talentUser1.id } })];
                case 23:
                    talent1Profile = _a.sent();
                    return [4 /*yield*/, prisma.talentProfile.findFirst({ where: { userId: talentUser2.id } })];
                case 24:
                    talent2Profile = _a.sent();
                    if (!(talent1Profile && adminUser)) return [3 /*break*/, 26];
                    return [4 /*yield*/, prisma.review.create({
                            data: {
                                rating: 5,
                                comment: 'Outstanding work! Sarah delivered exactly what we needed with perfect timing and quality.',
                                reviewerId: adminUser.id,
                                talentProfileId: talent1Profile.id
                            }
                        })];
                case 25:
                    _a.sent();
                    _a.label = 26;
                case 26:
                    if (!(talent2Profile && adminUser)) return [3 /*break*/, 28];
                    return [4 /*yield*/, prisma.review.create({
                            data: {
                                rating: 5,
                                comment: 'Carlos is incredibly professional and accurate. Highly recommended for any translation work.',
                                reviewerId: adminUser.id,
                                talentProfileId: talent2Profile.id
                            }
                        })];
                case 27:
                    _a.sent();
                    _a.label = 28;
                case 28:
                    console.log("- Sample reviews");
                    console.log('Database seeding completed successfully.');
                    return [3 /*break*/, 32];
                case 29:
                    error_1 = _a.sent();
                    console.error('Error during database seeding:', error_1);
                    return [3 /*break*/, 32];
                case 30: return [4 /*yield*/, prisma.$disconnect()];
                case 31:
                    _a.sent();
                    return [7 /*endfinally*/];
                case 32: return [2 /*return*/];
            }
        });
    });
}
main()
    .catch(function (e) {
    console.error(e);
    process.exit(1);
})
    .finally(function () { return __awaiter(_this, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.$disconnect()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
