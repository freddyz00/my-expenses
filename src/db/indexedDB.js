import { openDB } from "idb";

const DB_NAME = "expense_tracker";
const DB_VERSION = 1;

export async function initDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("transactions")) {
        db.createObjectStore("transactions", {
          keyPath: "id",
          autoIncrement: true,
        });
      }
    },
  });
}

export async function addTransaction(transaction) {
  const db = await initDB();
  return db.add("transactions", {
    ...transaction,
    createdAt: new Date().toISOString(), // optional extra field
  });
}

export async function getAllTransactions() {
  const db = await initDB();
  return db.getAll("transactions");
}
