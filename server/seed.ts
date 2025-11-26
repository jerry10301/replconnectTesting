import { db, schema } from "./db";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import crypto from "crypto";

const { users } = schema;
const SALT_ROUNDS = 10;

async function seed() {
  console.log("Seeding database...");

  const existingAdmin = await db
    .select()
    .from(users)
    .where(eq(users.username, "admin"))
    .limit(1);

  if (existingAdmin.length === 0) {
    const hashedPassword = await bcrypt.hash("admin123", SALT_ROUNDS);
    const id = crypto.randomUUID();
    
    await db.insert(users).values({
      id,
      username: "admin",
      email: "admin@example.com",
      password: hashedPassword,
      name: "Administrator",
      role: "admin",
      createdAt: new Date(),
    } as any);
    
    console.log("Created default admin user:");
    console.log("  Username: admin");
    console.log("  Password: admin123");
  } else {
    console.log("Admin user already exists, skipping...");
  }

  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.username, "user"))
    .limit(1);

  if (existingUser.length === 0) {
    const hashedPassword = await bcrypt.hash("user123", SALT_ROUNDS);
    const id = crypto.randomUUID();
    
    await db.insert(users).values({
      id,
      username: "user",
      email: "user@example.com",
      password: hashedPassword,
      name: "Regular User",
      role: "user",
      createdAt: new Date(),
    } as any);
    
    console.log("Created default regular user:");
    console.log("  Username: user");
    console.log("  Password: user123");
  } else {
    console.log("Regular user already exists, skipping...");
  }

  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch((error) => {
  console.error("Seeding failed:", error);
  process.exit(1);
});
