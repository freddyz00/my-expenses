import React, { useEffect, useState, useRef } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getAllTransactions, addTransaction } from "./db/indexedDB";
import TransactionsList from "@/components/TransactionsList";
import { Home, List } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [monthlyTotal, setMonthlyTotal] = useState(0);
  const [quickAmount, setQuickAmount] = useState("");
  const inputRef = useRef(null);

  const refreshMonthlyTotal = async () => {
    const txns = await getAllTransactions();
    const now = new Date();
    const monthTotal = txns
      .filter((t) => {
        const date = new Date(t.date);
        return (
          date.getMonth() === now.getMonth() &&
          date.getFullYear() === now.getFullYear()
        );
      })
      .reduce((sum, t) => sum + Number(t.amount), 0);
    setMonthlyTotal(monthTotal);
  };

  useEffect(() => {
    refreshMonthlyTotal();
  }, []);

  useEffect(() => {
    if (activeTab === "dashboard") inputRef.current?.focus();
  }, [activeTab]);

  const handleQuickAdd = async () => {
    if (!quickAmount || isNaN(quickAmount)) return;
    await addTransaction({
      amount: Number(quickAmount),
      category: "Uncategorized",
      description: "",
      date: new Date().toISOString(),
    });
    setQuickAmount("");
    refreshMonthlyTotal();
    inputRef.current?.focus();
  };

  return (
    <Tabs
      value={activeTab}
      onValueChange={setActiveTab}
      className="flex flex-col h-screen"
    >
      {/* Main content */}
      <div className="flex-1 p-4 max-w-md mx-auto w-full overflow-auto">
        <TabsContent value="dashboard">
          <Card className="mb-6 shadow-lg border border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg text-gray-500">
                Total Spent This Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-black">
                ${monthlyTotal.toFixed(2)}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg text-gray-500">
                Quick Add Expense
              </CardTitle>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Input
                ref={inputRef}
                type="number"
                inputMode="decimal"
                placeholder="Amount"
                value={quickAmount}
                onChange={(e) => setQuickAmount(e.target.value)}
                className="flex-1"
                autoFocus
              />
              <Button
                onClick={handleQuickAdd}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                Add
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
          <TransactionsList />
        </TabsContent>
      </div>

      {/* Bottom tabs */}
      <TabsList className="w-full h-12">
        <TabsTrigger value="dashboard">
          <Home />
        </TabsTrigger>
        <TabsTrigger value="transactions">
          <List />
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
