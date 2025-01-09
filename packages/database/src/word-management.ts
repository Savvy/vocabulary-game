import { Prisma, prisma } from "./index";

export async function createWord(data: {
	translations: Array<{
		languageId: string;
		translation: string;
		options: string[];
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
			options: string[];
		}>;
	}>>`
		WITH RandomWords AS (
			SELECT DISTINCT w.id, w."imageUrl", w."categoryId", random() as rand
			FROM "Word" w
			JOIN "WordTranslation" wt ON w.id = wt."wordId"
			JOIN "Language" l ON wt."languageId" = l.id
			WHERE w."categoryId" = ${categoryId}
			AND l.code IN (${sourceLanguageCode}, ${targetLanguageCode})
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
					'languageId', l.code,
					'options', wt.options
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

interface DashboardError extends Error {
	code: "STATS_ERROR" | "CHART_ERROR";
	cause?: unknown;
}

function createDashboardError(
	message: string,
	code: DashboardError["code"],
	cause?: unknown
): DashboardError {
	const error = new Error(message) as DashboardError;
	error.code = code;
	error.cause = cause;
	return error;
}

export async function getDashboardStats() {
	try {
		const [totalWords, categories, languages, recentWords] =
			await Promise.all([
				prisma.word.count(),
				prisma.category.count(),
				prisma.language.findMany(),
				prisma.word.count({
					where: {
						createdAt: {
							gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
						},
					},
				}),
			]);

		// Calculate unique language pairs
		const languagePairs = new Set<string>();
		languages.forEach((lang1) => {
			languages.forEach((lang2) => {
				if (lang1.id !== lang2.id) {
					const pair = [lang1.id, lang2.id].sort().join("-");
					languagePairs.add(pair);
				}
			});
		});

		return {
			totalWords: Number(totalWords),
			categories: Number(categories),
			languagePairs: languagePairs.size,
			recentAdditions: Number(recentWords),
		};
	} catch (error) {
		console.error("Failed to fetch dashboard stats:", error);
		throw createDashboardError(
			"Failed to fetch dashboard statistics",
			"STATS_ERROR",
			error
		);
	}
}

export async function getDashboardChartData() {
	try {
		const sixMonthsAgo = new Date();
		sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

		const [wordsOverTime, categoryDistribution, languageUsage] =
			await Promise.all([
				// Words added over time (monthly)
				prisma.$queryRaw<Array<{ date: string; count: bigint }>>`
                WITH months AS (
                    SELECT generate_series(
                        date_trunc('month', ${sixMonthsAgo}::timestamp),
                        date_trunc('month', CURRENT_DATE),
                        '1 month'::interval
                    ) as month
                )
                SELECT 
                    to_char(months.month, 'Mon') as date,
                    COALESCE(COUNT(w.id), 0) as count
                FROM months
                LEFT JOIN "Word" w ON date_trunc('month', w."createdAt") = months.month
                GROUP BY months.month
                ORDER BY months.month
            `.catch((error) => {
					throw createDashboardError(
						"Failed to fetch words over time data",
						"CHART_ERROR",
						error
					);
				}),

				// Category distribution
				prisma.$queryRaw<Array<{ category: string; count: bigint }>>`
                WITH ranked_categories AS (
                    SELECT 
                        c.name as category,
                        COUNT(w.id) as count,
                        ROW_NUMBER() OVER (ORDER BY COUNT(w.id) DESC) as rn
                    FROM "Category" c
                    LEFT JOIN "Word" w ON w."categoryId" = c.id
                    GROUP BY c.id, c.name
                )
                SELECT category, count
                FROM ranked_categories
                WHERE rn <= 5
            `.catch((error) => {
					throw createDashboardError(
						"Failed to fetch category distribution data",
						"CHART_ERROR",
						error
					);
				}),

				// Language pair usage
				prisma.$queryRaw<Array<{ pair: string; count: bigint }>>`
                WITH language_pairs AS (
                    SELECT 
                        CONCAT(l1.code, '-', l2.code) as pair,
                        COUNT(*) as count,
                        ROW_NUMBER() OVER (ORDER BY COUNT(*) DESC) as rn
                    FROM "Word" w
                    JOIN "Language" l1 ON w."sourceLanguageId" = l1.id
                    JOIN "Language" l2 ON w."targetLanguageId" = l2.id
                    GROUP BY l1.code, l2.code
                )
                SELECT pair, count
                FROM language_pairs
                WHERE rn <= 4
            `.catch((error) => {
					throw createDashboardError(
						"Failed to fetch language pair usage data",
						"CHART_ERROR",
						error
					);
				}),
			]);

		return {
			wordsOverTime: wordsOverTime.map((row) => ({
				date: row.date,
				count: Number(row.count),
			})),
			categoryDistribution: categoryDistribution.map((row) => ({
				category: row.category,
				count: Number(row.count),
			})),
			languageUsage: languageUsage.map((row) => ({
				pair: row.pair,
				count: Number(row.count),
			})),
		};
	} catch (error) {
		console.error("Failed to fetch dashboard chart data:", error);
		throw createDashboardError(
			"Failed to fetch dashboard charts",
			"CHART_ERROR",
			error
		);
	}
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
