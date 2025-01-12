import { createAdminUser } from "../admin";

async function main() {
    const [email, password, name] = process.argv.slice(2);

    if (!email || !password || !name) {
        console.error("Usage: pnpm create-admin <email> <password> <name>");
        process.exit(1);
    }

    try {
        const user = await createAdminUser(email, password, name);
        console.log("Admin user created successfully:", user.email);
    } catch (error) {
        console.error("Error creating admin user:", error);
        process.exit(1);
    }

    process.exit(0);
}

main(); 