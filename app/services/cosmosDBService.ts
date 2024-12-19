import { CosmosClient } from "@azure/cosmos";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const endpoint = process.env.COSMOS_DB_ENDPOINT || "";
const key = process.env.COSMOS_DB_KEY || "";
const databaseId = process.env.COSMOS_DB_DATABASE_ID || "";
const containerId = process.env.COSMOS_DB_CONTAINER_ID || "";
const jwtSecret = process.env.JWT_SECRET || "";

const client = new CosmosClient({ endpoint, key });

export async function getContainer() {
  const { database } = await client.databases.createIfNotExists({
    id: databaseId,
  });
  const { container } = await database.containers.createIfNotExists({
    id: containerId,
  });
  return container;
}

export async function addUserHabit(habit: {
  date: string;
  sleep: number;
  exercise: number;
  calories: number;
  water: number;
}) {
  const container = await getContainer();
  const { resource } = await container.items.create(habit);
  return resource;
}

export async function getUserHabits(userId: string): Promise<{
  date: string;
  sleep: string;
  exercise: string;
  calories: string;
  water: string;
}[]> {
  const container = await getContainer();
  const querySpec = {
    query: "SELECT * from c WHERE c.userId = @userId",
    parameters: [{ name: "@userId", value: userId }],
  };
  const { resources } = await container.items.query(querySpec).fetchAll();
  return resources;
}

export async function registerUser(username: string, password: string) {
  const container = await getContainer();
  const hashedPassword = await bcrypt.hash(password, 10);
  const { resource } = await container.items.create({
    username,
    password: hashedPassword,
  });
  return resource;
}

export async function authenticateUser(username: string, password: string) {
  const container = await getContainer();
  const querySpec = {
    query: "SELECT * from c WHERE c.username = @username",
    parameters: [{ name: "@username", value: username }],
  };
  const { resources } = await container.items.query(querySpec).fetchAll();
  const user = resources[0];
  if (user && (await bcrypt.compare(password, user.password))) {
    const token = jwt.sign({ userId: user.id }, jwtSecret, { expiresIn: "1h" });
    return { token, userId: user.id };
  }
  throw new Error("Authentication failed");
}

export async function updateUserHabit(habit: any) {
  const container = await getContainer();
  const { resource } = await container.item(habit.id).replace(habit);
  return resource;
}
