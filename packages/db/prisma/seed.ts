import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedData() {
  try {
    const data1 = await prisma.asset.upsert({
      create: {
        symbol: "SOL",
        imageUrl: "",
        name: "Solana",
        decimals: 200,
      },
      update: {},
      where: {
        id: "3b0824ae-f9a8-49bc-bd11-ead455c1f249",
      },
    });
    const data2 = await prisma.asset.upsert({
      create: {
        symbol: "ETH",
        imageUrl: "",
        name: "Ethereum",
        decimals: 200,
      },
      update: {},
      where: {
        id: "422b9b8a-6f20-46f5-bae9-b12b2f62d28e",
      },
    });
    const data3 = await prisma.asset.upsert({
      create: {
        symbol: "BTC",
        imageUrl: "",
        name: "Bitcoin",
        decimals: 200,
      },
      update: {},
      where: {
        id: "21763ac6-a7f5-452f-971a-9a72bcb87b20",
      },
    });
    console.log(data1, data2, data3);
    console.log("Db successfully seeded ");
  } catch (error) {
    console.log(error);
  }
}

seedData()
  .then(() => console.log("Db successfully seeded"))
  .catch((err) => console.log(err));
