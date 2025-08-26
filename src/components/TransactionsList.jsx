import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { getAllTransactions } from "../db/indexedDB";

export default function TransactionsList() {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    getAllTransactions().then(setTransactions);
  }, []);

  return (
    <div className="space-y-3">
      {transactions.length === 0 ? (
        <p className="text-gray-500 text-center">No transactions yet.</p>
      ) : (
        transactions.map((t, idx) => (
          <Card key={idx} className="shadow-md border border-gray-200">
            <CardHeader className="flex justify-between items-center">
              <CardTitle className="text-lg font-medium">
                ${Number(t.amount).toFixed(2)}
              </CardTitle>
              <span className="text-sm text-gray-400">
                {new Date(t.date).toLocaleDateString()}
              </span>
            </CardHeader>
            {t.description && (
              <CardContent className="text-gray-600">
                {t.description}
              </CardContent>
            )}
          </Card>
        ))
      )}
    </div>
  );
}
