import { prisma } from "./index";
import bcrypt from "bcryptjs";

export async function createAdminUser(email: string, password: string, name: string) {
    const hashedPassword = await bcrypt.hash(password, 12);

    return prisma.adminUser.create({
        data: {
            email,
            password: hashedPassword,
            name,
        },
    });
} 