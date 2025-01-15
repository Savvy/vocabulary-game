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