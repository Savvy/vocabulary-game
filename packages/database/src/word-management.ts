import { prisma } from './index';

export async function createWord(data: {
    word: string;
    translation: string;
    imageUrl: string;
    categoryId: string;
    languageId: string;
    options: string[];
}) {
    return prisma.word.create({
        data: {
            word: data.word,
            translation: data.translation,
            imageUrl: data.imageUrl,
            options: data.options,
            category: { connect: { id: data.categoryId } },
            language: { connect: { id: data.languageId } }
        },
        include: {
            category: true,
            language: true,
        },
    });
}

export async function getRandomWordsByCategory(
    categoryId: string,
    languageCode: string,
    count: number
) {
    const language = await prisma.language.findUnique({
        where: { code: languageCode }
    });

    if (!language) {
        throw new Error(`Language with code ${languageCode} not found`);
    }

    console.log('Category ID:', categoryId);
    console.log('Language ID:', language.id);

    const words = await prisma.word.findMany({
        where: {
            categoryId,
            languageId: language.id,
        },
        take: count,
        orderBy: {
            id: 'asc'
        },
        include: {
            category: true,
            language: true,
        },
    });

    return words.length > 0 ? words.sort(() => Math.random() - 0.5) : words;
}

export async function getAllCategories() {
    return prisma.category.findMany();
}

export async function getAllLanguages() {
    return prisma.language.findMany();
} 