import { prisma } from "@vocab/database";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";

const querySchema = z.object({
    page: z.coerce.number().default(1),
    perPage: z.coerce.number().default(10),
    sort: z.string().optional(),
    order: z.enum(["asc", "desc"]).optional(),
    search: z.string().optional(),
});

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const query = querySchema.parse(Object.fromEntries(searchParams));

        const skip = (query.page - 1) * query.perPage;
        const take = query.perPage;

        const where = query.search
            ? {
                OR: [
                    { name: { contains: query.search, mode: "insensitive" as Prisma.QueryMode } },
                    { email: { contains: query.search, mode: "insensitive" as Prisma.QueryMode } },
                ],
            }
            : {};

        const orderBy = query.sort
            ? { [query.sort]: (query.order ?? "desc") as Prisma.SortOrder }
            : { createdAt: "desc" as Prisma.SortOrder };

        const [users, total] = await Promise.all([
            prisma.adminUser.findMany({
                where,
                orderBy,
                skip,
                take,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    createdAt: true,
                    updatedAt: true,
                },
            }),
            prisma.adminUser.count({ where }),
        ]);

        return NextResponse.json({
            data: users,
            meta: {
                total,
                page: query.page,
                perPage: query.perPage,
                pageCount: Math.ceil(total / query.perPage),
            },
        });
    } catch (error) {
        console.error("[ADMIN_USERS_GET]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const param = (await params).id
        const body = await request.json();
        const { name, email } = body;

        const user = await prisma.adminUser.update({
            where: { id: param },
            data: { name, email },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        return NextResponse.json(user);
    } catch (error) {
        console.error("[ADMIN_USER_PATCH]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const param = (await params).id
        await prisma.adminUser.delete({
            where: { id: param },
        });

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error("[ADMIN_USER_DELETE]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
} 