import { prisma } from ".";

interface DashboardError extends Error {
	code: "STATS_ERROR" | "CHART_ERROR";
	cause?: unknown;
}

interface DashboardStats {
	totalWords: number;
	categories: number;
	languagePairs: number;
	recentAdditions: number;
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

function calculateLanguagePairs(languages: number): number {
	const n = languages;
	return (n * (n - 1)) / 2;
}

export async function getDashboardStats(): Promise<DashboardStats> {
	try {
		const [totalWords, categories, languages, recentWords] =
			await Promise.all([
				prisma.word.count(),
				prisma.category.count(),
				prisma.language.count(),
				prisma.word.count({
					where: {
						createdAt: {
							gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
						},
					},
				}),
			]);

		return {
			totalWords: Number(totalWords),
			categories: Number(categories),
			languagePairs: calculateLanguagePairs(languages),
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

				prisma.$queryRaw<Array<{ category: string; count: bigint }>>`
				WITH ranked_categories AS (
					SELECT 
						c."categoryCode" as category,
						COUNT(w.id) as count,
						ROW_NUMBER() OVER (ORDER BY COUNT(w.id) DESC) as rn
					FROM "Category" c
					LEFT JOIN "Word" w ON w."categoryId" = c.id
					GROUP BY c.id, c."categoryCode"
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

				prisma.$queryRaw<Array<{ pair: string; count: bigint }>>`
				WITH language_pairs AS (
					SELECT 
						CONCAT(l1.code, '-', l2.code) as pair,
						COUNT(DISTINCT w.id) as count,
						ROW_NUMBER() OVER (ORDER BY COUNT(DISTINCT w.id) DESC) as rn
					FROM "WordTranslation" wt1
					JOIN "Language" l1 ON wt1."languageId" = l1.id
					JOIN "WordTranslation" wt2 ON wt1."wordId" = wt2."wordId" 
						AND wt1."languageId" < wt2."languageId"
					JOIN "Language" l2 ON wt2."languageId" = l2.id
					JOIN "Word" w ON w.id = wt1."wordId"
					GROUP BY l1.code, l2.code
					LIMIT 4
				)
				SELECT pair, count
				FROM language_pairs;
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