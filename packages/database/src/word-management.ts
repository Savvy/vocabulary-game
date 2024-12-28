import { prisma } from './index';
import type { Word, Category, Language } from '@prisma/client';

export async function createWord(data: {
    word: string;
    translation: string;
    imageUrl?: string;
    categoryId: string;
    languageId: string;
    options: string[];
}) {
    return prisma.word.create({
        data,
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

    const words = await prisma.word.findMany({
        where: {
            categoryId,
            languageId: language.id
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

    return words.sort(() => Math.random() - 0.5);
}

export async function getAllCategories() {
    return prisma.category.findMany();
}

export async function getAllLanguages() {
    return prisma.language.findMany();
} 