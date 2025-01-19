import { prisma } from "@vocab/database";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const body = await request.json();
        const { name, email } = body;
        const param = (await params).id
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
    { params }: { params: Promise<{ id: string }>    }
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