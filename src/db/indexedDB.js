import { openDB } from "idb";

const DB_NAME = "expense_tracker";
const DB_VERSION = 1;
const STORE_NAME = "transactions";

export async function initDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, {
          keyPath: "id",
          autoIncrement: true,
        });
      }
    },
  });
}

export async function addTransaction(transaction) {
  const db = await initDB();
  return db.add(STORE_NAME, {
    ...transaction,
    createdAt: new Date().toISOString(), // optional extra field
  });
}

export async function getAllTransactions() {
  const db = await initDB();
  return db.getAll(STORE_NAME);
}

export async function updateTransaction(id, updatedTransaction) {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);
  
  // Get the existing transaction
  const existing = await store.get(id);
  if (!existing) {
    throw new Error("Transaction not found");
  }
  
  // Merge with updates
  const updated = {
    ...existing,
    ...updatedTransaction,
    id, // Ensure ID stays the same
  };
  
  await store.put(updated);
  await tx.done;
  return updated;
}

export async function deleteTransaction(id) {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  await tx.objectStore(STORE_NAME).delete(id);
  await tx.done;
}

export async function replaceAllTransactions(records) {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);
  await store.clear();
  for (const record of records) {
    await store.put(record);
  }
  await tx.done;
}
