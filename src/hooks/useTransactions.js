import { useCallback, useEffect, useState } from "react";
import {
  getAllTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  replaceAllTransactions,
} from "@/db/indexedDB";

export function useTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllTransactions()
      .then(setTransactions)
      .catch((error) => console.error("Failed to load expenses:", error))
      .finally(() => setLoading(false));
  }, []);

  const add = useCallback(async (txn) => {
    const createdAt = new Date().toISOString();
    const id = await addTransaction(txn);
    setTransactions((prev) => [...prev, { ...txn, id, createdAt }]);
    return id;
  }, []);

  const update = useCallback(async (id, patch) => {
    const updated = await updateTransaction(id, patch);
    setTransactions((prev) => prev.map((t) => (t.id === id ? updated : t)));
  }, []);

  const remove = useCallback(async (id) => {
    await deleteTransaction(id);
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const replaceAll = useCallback(async (records) => {
    await replaceAllTransactions(records);
    setTransactions(await getAllTransactions());
  }, []);

  return { transactions, loading, add, update, remove, replaceAll };
}
