import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash("admin123", 10);
  
  const admin = await prisma.user.upsert({
    where: { email: "admin@tech57.ma" },
    update: {},
    create: {
      email: "admin@tech57.ma",
      name: "Naoual Houssni",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  console.log("✅ Seed terminé. Utilisateur admin créé : admin@tech57.ma / admin123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
