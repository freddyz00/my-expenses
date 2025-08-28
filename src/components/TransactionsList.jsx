import React, { useEffect, useState } from "react";
import { Trash } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getAllTransactions, deleteTransaction } from "../db/indexedDB";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function TransactionsList() {
  const [transactions, setTransactions] = useState([]);
  const [transactionToDelete, setTransactionToDelete] = useState(null);

  useEffect(() => {
    getAllTransactions().then((transactions) => {
      setTransactions(
        transactions.sort((a, b) => new Date(b.date) - new Date(a.date))
      );
    });
  }, []);

  const handleDelete = async (id) => {
    if (transactionToDelete) {
      await deleteTransaction(transactionToDelete);
      setTransactionToDelete(null);
      setTransactions(
        transactions.filter(
          (transaction) => transaction.id !== transactionToDelete
        )
      );
    }
  };

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
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setTransactionToDelete(t.id)}
              >
                <Trash />
              </Button>
            </CardHeader>
            {t.description && (
              <CardContent className="text-gray-600">
                {t.description}
              </CardContent>
            )}
          </Card>
        ))
      )}
      <AlertDialog open={!!transactionToDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Transaction?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently remove the
              transaction from your records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setTransactionToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
