import React, { useEffect, useState, useRef } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getAllTransactions, addTransaction } from "./db/indexedDB";
import TransactionsList from "@/components/TransactionsList";
import { Home, List, Plus, TrendingUp, Calendar, Check } from "lucide-react";
import CategoryPicker from "./components/CategoryPicker";
import WeeklyChart from "./components/WeeklyChart";
import { hapticFeedback } from "./utils/haptics";

export default function App() {
  const [category, setCategory] = useState("Food");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [allTransactions, setAllTransactions] = useState([]);
  const [monthlyTotal, setMonthlyTotal] = useState(0);
  const [weeklyTotal, setWeeklyTotal] = useState(0);
  const [todayTotal, setTodayTotal] = useState(0);
  const [quickAmount, setQuickAmount] = useState("");
  const [description, setDescription] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(null);
  const inputRef = useRef(null);

  // Smart preset amounts - could be made dynamic based on user patterns
  const presetAmounts = [5, 10, 20];

  const refreshTotals = async () => {
    const txns = await getAllTransactions();
    setAllTransactions(txns);
    const now = new Date();
    
    // Monthly total
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

    // Weekly total (last 7 days)
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weekTotal = txns
      .filter((t) => new Date(t.date) >= weekAgo)
      .reduce((sum, t) => sum + Number(t.amount), 0);
    setWeeklyTotal(weekTotal);

    // Today total
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
    const todayTotalAmount = txns
      .filter((t) => {
        const date = new Date(t.date);
        return date >= todayStart && date < todayEnd;
      })
      .reduce((sum, t) => sum + Number(t.amount), 0);
    setTodayTotal(todayTotalAmount);
  };

  useEffect(() => {
    refreshTotals();
  }, []);

  const handlePresetSelect = (amount) => {
    hapticFeedback.selection();
    setSelectedPreset(amount);
    setQuickAmount(amount.toString());
    // Auto-focus on add button for immediate submission
    setTimeout(() => {
      const addButton = document.querySelector('[data-add-button]');
      if (addButton) addButton.focus();
    }, 100);
  };

  const handleInputFocus = () => {
    setSelectedPreset(null); // Clear any preset selection
  };

  const formatAmountInput = (value) => {
    // Remove all non-numeric characters except decimal point
    const numericValue = value.replace(/[^0-9.]/g, '');
    
    // Ensure only one decimal point
    const parts = numericValue.split('.');
    if (parts.length > 2) {
      return parts[0] + '.' + parts.slice(1).join('');
    }
    
    // Limit to 2 decimal places
    if (parts[1] && parts[1].length > 2) {
      return parts[0] + '.' + parts[1].slice(0, 2);
    }
    
    return numericValue;
  };

  const handleAmountChange = (e) => {
    const rawValue = e.target.value;
    const formattedValue = formatAmountInput(rawValue);
    setQuickAmount(formattedValue);
    setSelectedPreset(null); // Clear preset if manually typing
  };

  const handleQuickAdd = async () => {
    if (!quickAmount || isNaN(quickAmount) || isAdding) return;
    
    hapticFeedback.light(); // Light feedback on button press
    setIsAdding(true);
    
    try {
      await addTransaction({
        amount: Number(quickAmount),
        category,
        description: description.trim(),
        date: new Date().toISOString(),
      });
      
      // Success haptic feedback
      hapticFeedback.success();
      
      setQuickAmount("");
      setDescription("");
      setSelectedPreset(null);
      refreshTotals();
      setIsAdding(false);
      
    } catch (error) {
      hapticFeedback.error();
      setIsAdding(false);
      console.error("Error adding transaction:", error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && quickAmount && !isNaN(quickAmount)) {
      handleQuickAdd();
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex flex-col">
      <Tabs
        value={activeTab}
        onValueChange={(value) => {
          hapticFeedback.light();
          setActiveTab(value);
        }}
        className="flex flex-col h-full"
      >
        {/* Header */}
        <div className="flex-shrink-0 px-6 pt-6 pb-4">
          <div className="max-w-md mx-auto">
            <h1 className="text-2xl font-bold text-gray-900">
              {activeTab === 'dashboard' ? 'My Expenses' : 'Transactions'}
            </h1>
            <p className="text-sm text-gray-600">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'short', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>

        {/* Main content - fills remaining space */}
        <div className="flex-1 min-h-0">
          <TabsContent value="dashboard" className="h-full flex flex-col m-0 p-0">
            <div className="flex-1 flex flex-col px-6 max-w-md mx-auto w-full min-h-0">
              
              {/* Stats Row - Top */}
              <div className="flex-shrink-0 mb-4">
                <div className="flex gap-3">
                  <div className="flex-1 bg-white/60 backdrop-blur-sm rounded-2xl p-3 text-center">
                    <Calendar className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                    <p className="text-lg font-bold text-gray-900">${todayTotal.toFixed(0)}</p>
                    <p className="text-xs text-gray-600">Today</p>
                  </div>
                  
                  <div className="flex-1 bg-white/60 backdrop-blur-sm rounded-2xl p-3 text-center">
                    <TrendingUp className="w-4 h-4 text-green-600 mx-auto mb-1" />
                    <p className="text-lg font-bold text-gray-900">${weeklyTotal.toFixed(0)}</p>
                    <p className="text-xs text-gray-600">Week</p>
                  </div>
                  
                  <div className="flex-1 bg-white/60 backdrop-blur-sm rounded-2xl p-3 text-center">
                    <div className="w-4 h-4 bg-purple-600 rounded mx-auto mb-1"></div>
                    <p className="text-lg font-bold text-gray-900">${monthlyTotal.toFixed(0)}</p>
                    <p className="text-xs text-gray-600">Month</p>
                  </div>
                </div>
              </div>

              {/* Quick Add - Center Position for Natural Thumb Access */}
              <div className="flex-shrink-0 mb-4">
                <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-4 shadow-lg border border-white/20">
                  <CategoryPicker category={category} setCategory={setCategory} />
                  
                  {/* Quick Amount Buttons */}
                  <div className="mt-4 mb-3">
                    <div className="flex gap-2">
                      {presetAmounts.map((amount) => (
                        <Button
                          key={amount}
                          onClick={() => handlePresetSelect(amount)}
                          variant="ghost"
                          className={`flex-1 h-10 rounded-xl border-2 transition-all duration-200 active:scale-95 ${
                            selectedPreset === amount
                              ? 'bg-blue-100 border-blue-500 text-blue-700 font-semibold'
                              : 'border-gray-200'
                          }`}
                        >
                          ${amount}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Amount Input and Add Button */}
                  <div className="flex gap-3">
                    <div className="flex-1 relative">
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-xl font-semibold text-gray-400 pointer-events-none">
                        $
                      </span>
                      <Input
                        ref={inputRef}
                        type="text"
                        inputMode="decimal"
                        placeholder="0.00"
                        value={quickAmount}
                        onChange={handleAmountChange}
                        onFocus={handleInputFocus}
                        onKeyPress={handleKeyPress}
                        className="w-full text-xl font-semibold h-12 text-center border-2 border-gray-200 focus:border-blue-500 rounded-2xl transition-all duration-200 pl-8"
                      />
                    </div>
                    <Button
                      data-add-button
                      onClick={handleQuickAdd}
                      disabled={!quickAmount || isNaN(quickAmount) || isAdding}
                      className="h-12 px-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-95"
                    >
                      Add
                    </Button>
                  </div>

                  {description.length > 0 || quickAmount ? (
                    <Input
                      type="text"
                      placeholder="Description (optional)"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="mt-3 border-gray-200 focus:border-blue-500 rounded-xl"
                    />
                  ) : null}
                </div>
              </div>

              {/* Chart - Takes remaining space */}
              <div className="flex-1 min-h-0">
                <WeeklyChart transactions={allTransactions} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="transactions" className="h-full m-0 p-0">
            <div className="h-full px-6 max-w-md mx-auto flex flex-col">
              <div className="flex-1 min-h-0 overflow-auto">
                <TransactionsList />
              </div>
            </div>
          </TabsContent>
        </div>

        {/* Bottom Navigation - Fixed */}
        <div className="flex-shrink-0 bg-white/90 backdrop-blur-lg border-t border-gray-200">
          <TabsList className="w-full h-14 bg-transparent max-w-md mx-auto">
            <TabsTrigger 
              value="dashboard" 
              className="flex-1 flex flex-col items-center gap-1 h-full data-[state=active]:bg-blue-100 data-[state=active]:text-blue-600 rounded-xl transition-all duration-200"
            >
              <Home className="w-4 h-4" />
              <span className="text-xs font-medium">Home</span>
            </TabsTrigger>
            <TabsTrigger 
              value="transactions"
              className="flex-1 flex flex-col items-center gap-1 h-full data-[state=active]:bg-blue-100 data-[state=active]:text-blue-600 rounded-xl transition-all duration-200"
            >
              <List className="w-4 h-4" />
              <span className="text-xs font-medium">Transactions</span>
            </TabsTrigger>
          </TabsList>
        </div>
      </Tabs>
    </div>
  );
}
