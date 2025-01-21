import { Prisma, prisma } from "./index";

export async function createWord(data: {
	translations: Array<{
		languageId: string;
		translation: string;
	}>;
	categoryId: string;
	imageUrl: string;
}) {
	return prisma.word.create({
		data: {
			categoryId: data.categoryId,
			imageUrl: data.imageUrl,
			translations: {
				create: data.translations
			}
		},
		include: {
			category: {
				include: {
					translations: true
				}
			},
			translations: {
				include: {
					language: true
				}
			}
		}
	});
}

export async function getRandomWordsByCategory(
	categoryId: string,
	sourceLanguageCode: string,
	targetLanguageCode: string,
	count: number
) {
	return prisma.$queryRaw<Array<{
		id: string;
		imageUrl: string;
		categoryId: string;
		translations: Array<{
			translation: string;
			languageId: string;
		}>;
	}>>`
		WITH WordsWithBothTranslations AS (
			SELECT DISTINCT w.id
			FROM "Word" w
			WHERE w."categoryId" = ${categoryId}
			AND EXISTS (
				SELECT 1 FROM "WordTranslation" wt1
				JOIN "Language" l1 ON wt1."languageId" = l1.id
				WHERE wt1."wordId" = w.id AND l1.code = ${sourceLanguageCode}
			)
			AND EXISTS (
				SELECT 1 FROM "WordTranslation" wt2
				JOIN "Language" l2 ON wt2."languageId" = l2.id
				WHERE wt2."wordId" = w.id AND l2.code = ${targetLanguageCode}
			)
		),
		RandomWords AS (
			SELECT w.id, w."imageUrl", w."categoryId", random() as rand
			FROM "Word" w
			WHERE w.id IN (SELECT id FROM WordsWithBothTranslations)
			ORDER BY rand
			LIMIT ${count}
		)
		SELECT 
			w.id,
			w."imageUrl",
			w."categoryId",
			json_agg(
				json_build_object(
					'translation', wt.translation,
					'languageId', l.code
				)
			) as translations
		FROM RandomWords w
			JOIN "WordTranslation" wt ON w.id = wt."wordId"
			JOIN "Language" l ON wt."languageId" = l.id
		WHERE l.code IN (${sourceLanguageCode}, ${targetLanguageCode})
		GROUP BY w.id, w."imageUrl", w."categoryId"
	`;
}

export async function getAllCategories() {
	return prisma.category.findMany();
}

export async function getAllLanguages() {
	return prisma.language.findMany();
}

export async function getRandomCategories(
	count: number = 6,
	sourceLanguage?: string,
	targetLanguage?: string
) {
	return prisma.$queryRaw<
		Array<{
			id: string;
			name: string;
			sourceName: string | null;
			targetName: string | null;
			backgroundColor: string;
			textColor: string;
		}>
	>`
		SELECT 
			c.id,
			c."categoryCode" as name,
			ct_source.translation as "sourceName",
			ct_target.translation as "targetName",
			c."backgroundColor",
			c."textColor"
			FROM "Category" c
			LEFT JOIN "CategoryTranslation" ct_source 
				ON c.id = ct_source."categoryId" 
				AND ct_source."languageId" = (
					SELECT id FROM "Language" WHERE code = ${sourceLanguage}
				)
			LEFT JOIN "CategoryTranslation" ct_target
				ON c.id = ct_target."categoryId"
				AND ct_target."languageId" = (
					SELECT id FROM "Language" WHERE code = ${targetLanguage}
				)
			ORDER BY RANDOM()
			LIMIT ${count}
	`.then((categories) =>
		categories.map((cat) => ({
			id: cat.id,
			name: cat.sourceName || cat.name,
			translation: cat.targetName || cat.name,
			style: {
				backgroundColor: cat.backgroundColor,
				textColor: cat.textColor,
			},
		}))
	);
}

export async function getWords(params: {
	search?: string;
	categoryIds?: string[];
	languageId?: string;
	page?: number;
	pageSize?: number;
	sortBy?: string;
	sortOrder?: "asc" | "desc";
}) {
	const {
		search,
		categoryIds,
		languageId,
		page = 1,
		pageSize = 10,
		sortBy = "createdAt",
		sortOrder = "desc",
	} = params;

	const whereConditions: Prisma.WordWhereInput[] = [];

	if (search) {
		whereConditions.push({
			translations: {
				some: {
					translation: {
						contains: search,
						mode: "insensitive"
					}
				}
			}
		});
	}

	if (categoryIds?.length) {
		whereConditions.push({
			categoryId: {
				in: categoryIds
			}
		});
	}

	if (languageId) {
		whereConditions.push({
			translations: {
				some: {
					languageId
				}
			}
		});
	}

	const where: Prisma.WordWhereInput = whereConditions.length 
		? { AND: whereConditions }
		: {};

	const [total, words] = await Promise.all([
		prisma.word.count({ where }),
		prisma.word.findMany({
			where,
			include: {
				category: {
					include: {
						translations: true
					}
				},
				translations: {
					include: {
						language: true
					}
				}
			},
			orderBy: { [sortBy]: sortOrder },
			skip: (page - 1) * pageSize,
			take: pageSize,
		}),
	]);

	return { 
		words, 
		total, 
		pageCount: Math.ceil(total / pageSize) 
	};
}

export async function deleteWord(wordId: string) {
	// First delete all translations
	await prisma.wordTranslation.deleteMany({
		where: { wordId }
	});

	// Then delete the word
	return prisma.word.delete({
		where: { id: wordId }
	});
}

export async function bulkDeleteWords(wordIds: string[]) {
	// First delete all translations for these words
	await prisma.wordTranslation.deleteMany({
		where: {
			wordId: {
				in: wordIds
			}
		}
	});

	// Then delete the words
	return prisma.word.deleteMany({
		where: {
			id: {
				in: wordIds
			}
		}
	});
}

export async function getWordsByLanguagePair(
	sourceLangId: string,
	targetLangId: string,
	categoryId?: string
) {
	return prisma.word.findMany({
		where: {
			categoryId: categoryId,
			translations: {
				some: {
					languageId: {
						in: [sourceLangId, targetLangId]
					}
				}
			}
		},
		include: {
			translations: {
				where: {
					languageId: {
						in: [sourceLangId, targetLangId]
					}
				},
				include: {
					language: true
				}
			},
			category: {
				include: {
					translations: {
						where: {
							languageId: sourceLangId
						}
					}
				}
			}
		}
	});
}

export async function searchCategories(
	query: string,
	sourceLanguage?: string,
	targetLanguage?: string
) {
	return prisma.$queryRaw<Array<{
		id: string;
		name: string;
		sourceName: string | null;
		targetName: string | null;
		backgroundColor: string;
		textColor: string;
	}>>`
		SELECT DISTINCT
			c.id,
			c."categoryCode" as name,
			ct_source.translation as "sourceName",
			ct_target.translation as "targetName",
			c."backgroundColor",
			c."textColor"
		FROM "Category" c
		LEFT JOIN "CategoryTranslation" ct_source 
			ON c.id = ct_source."categoryId" 
			AND ct_source."languageId" = (
				SELECT id FROM "Language" WHERE code = ${sourceLanguage}
			)
		LEFT JOIN "CategoryTranslation" ct_target
			ON c.id = ct_target."categoryId"
			AND ct_target."languageId" = (
				SELECT id FROM "Language" WHERE code = ${targetLanguage}
			)
		WHERE 
			LOWER(c."categoryCode") LIKE LOWER(${`%${query}%`})
			OR LOWER(COALESCE(ct_source.translation, '')) LIKE LOWER(${`%${query}%`})
			OR LOWER(COALESCE(ct_target.translation, '')) LIKE LOWER(${`%${query}%`})
		LIMIT 25
	`.then((categories) =>
		categories.map((cat) => ({
			id: cat.id,
			name: cat.sourceName || cat.name,
			translation: cat.targetName || cat.name,
			style: {
				backgroundColor: cat.backgroundColor,
				textColor: cat.textColor,
			},
		}))
	);
}

export async function getCategories(
	categoryIds: string[],
	sourceLanguage?: string,
	targetLanguage?: string
) {
	return prisma.$queryRaw<
		Array<{
			id: string;
			name: string;
			sourceName: string | null;
			targetName: string | null;
			backgroundColor: string;
			textColor: string;
		}>
	>`
		SELECT 
			c.id,
			c."categoryCode" as name,
			ct_source.translation as "sourceName",
			ct_target.translation as "targetName",
			c."backgroundColor",
			c."textColor"
		FROM "Category" c
		LEFT JOIN "CategoryTranslation" ct_source 
			ON c.id = ct_source."categoryId" 
			AND ct_source."languageId" = (
				SELECT id FROM "Language" WHERE code = ${sourceLanguage}
			)
		LEFT JOIN "CategoryTranslation" ct_target
			ON c.id = ct_target."categoryId"
			AND ct_target."languageId" = (
				SELECT id FROM "Language" WHERE code = ${targetLanguage}
			)
		WHERE c.id = ANY(${categoryIds})
	`.then((categories) =>
		categories.map((cat) => ({
			id: cat.id,
			name: cat.sourceName || cat.name,
			translation: cat.targetName || cat.name,
			style: {
				backgroundColor: cat.backgroundColor,
				textColor: cat.textColor,
			},
		}))
	);
}