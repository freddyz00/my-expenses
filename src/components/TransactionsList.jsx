import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { Trash2, Calendar, DollarSign, Edit3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getAllTransactions, deleteTransaction, updateTransaction } from "../db/indexedDB";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORIES_TO_COLOR } from "./CategoryPicker";
import CategoryPicker from "./CategoryPicker";


// Swipeable Transaction Component
const SwipeableTransaction = React.memo(function SwipeableTransaction({ transaction, onDelete, onEdit }) {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const cardRef = useRef(null);
  
  const categoryConfig = CATEGORIES_TO_COLOR[transaction.category];
  const Icon = categoryConfig?.icon;

  const handleTouchStart = (e) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    
    const currentX = e.touches[0].clientX;
    const diffX = startX - currentX;
    
    // Only allow left swipe (positive diffX)
    if (diffX > 0) {
      setSwipeOffset(Math.min(diffX, 120)); // Max swipe distance of 120px for two buttons
    } else {
      setSwipeOffset(0);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    
    // If swiped more than 60px, keep it open, otherwise close
    if (swipeOffset > 60) {
      setSwipeOffset(120);
    } else {
      setSwipeOffset(0);
    }
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.clientX);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const currentX = e.clientX;
    const diffX = startX - currentX;
    
    if (diffX > 0) {
      setSwipeOffset(Math.min(diffX, 120));
    } else {
      setSwipeOffset(0);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    
    if (swipeOffset > 60) {
      setSwipeOffset(120);
    } else {
      setSwipeOffset(0);
    }
  };

  const handleDelete = useCallback(() => {
    onDelete(transaction.id);
    setSwipeOffset(0);
  }, [onDelete, transaction.id]);

  const handleEdit = useCallback(() => {
    onEdit(transaction);
    setSwipeOffset(0);
  }, [onEdit, transaction]);

  return (
    <div className="relative rounded-2xl shadow-sm">
      {/* Action Buttons (behind the card) - Only visible when swiped */}
      {swipeOffset > 0 && (
        <div className="absolute right-0 top-0 h-full w-32 flex rounded-r-2xl overflow-hidden">
          {/* Edit Button */}
          <Button
            onClick={handleEdit}
            className="w-16 h-full bg-blue-500 active:bg-blue-700 text-white rounded-none border-0 p-0 flex items-center justify-center transition-all duration-150"
          >
            <Edit3 className="w-5 h-5" />
          </Button>
          {/* Delete Button */}
          <Button
            onClick={handleDelete}
            className="w-16 h-full bg-red-500 active:bg-red-700 text-white rounded-none border-0 p-0 flex items-center justify-center transition-all duration-150"
          >
            <Trash2 className="w-5 h-5" />
          </Button>
        </div>
      )}

      {/* Main Card Content - Fully Opaque */}
      <div
        ref={cardRef}
        className="bg-white transition-transform duration-200 ease-out cursor-grab active:cursor-grabbing rounded-2xl relative z-10 shadow-sm"
        style={{
          transform: `translateX(-${swipeOffset}px)`,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <CardContent className="p-3">
          <div className="flex items-center gap-3">
            {/* Category Icon */}
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${categoryConfig?.gradient || 'from-gray-400 to-gray-600'} flex items-center justify-center flex-shrink-0`}>
              {Icon && <Icon className="w-5 h-5 text-white" />}
            </div>

            {/* Transaction Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-lg font-bold text-gray-900">
                    ${Number(transaction.amount).toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {transaction.category}
                  </p>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(transaction.date).toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit',
                    hour12: true 
                  })}
                </span>
              </div>
              {transaction.description && (
                <p className="text-sm text-gray-600 mt-1 truncate">
                  {transaction.description}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </div>
    </div>
  );
});

export default function TransactionsList() {
  const [allTransactions, setAllTransactions] = useState([]);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  const [transactionToEdit, setTransactionToEdit] = useState(null);
  const [editForm, setEditForm] = useState({
    amount: '',
    category: '',
    description: ''
  });
  
  // Set defaults to current month and year
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth().toString());
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear().toString());

  useEffect(() => {
    getAllTransactions().then((transactions) => {
      const sorted = transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
      setAllTransactions(sorted);
    });
  }, []);

  // Memoize filtered transactions to prevent unnecessary recalculations
  const memoizedFilteredTransactions = useMemo(() => {
    if (selectedMonth === 'all' && selectedYear === 'all') {
      return allTransactions;
    }
    
    return allTransactions.filter(transaction => {
      const date = new Date(transaction.date);
      const matchesMonth = selectedMonth === 'all' || date.getMonth() === parseInt(selectedMonth);
      const matchesYear = selectedYear === 'all' || date.getFullYear() === parseInt(selectedYear);
      return matchesMonth && matchesYear;
    });
  }, [selectedMonth, selectedYear, allTransactions]);

  // Memoize available months and years to prevent recalculation
  const availableMonths = useMemo(() => {
    const months = new Set();
    allTransactions.forEach(transaction => {
      const date = new Date(transaction.date);
      months.add(date.getMonth());
    });
    
    return Array.from(months)
      .sort((a, b) => a - b)
      .map(month => ({
        value: month.toString(),
        label: new Date(2024, month).toLocaleDateString('en-US', { month: 'long' })
      }));
  }, [allTransactions]);

  const availableYears = useMemo(() => {
    const years = new Set();
    allTransactions.forEach(transaction => {
      const date = new Date(transaction.date);
      years.add(date.getFullYear());
    });
    
    return Array.from(years)
      .sort((a, b) => b - a) // Sort newest first
      .map(year => ({
        value: year.toString(),
        label: year.toString()
      }));
  }, [allTransactions]);

  const handleDelete = async (id) => {
    setTransactionToDelete(id);
  };

  const handleEdit = (transaction) => {
    setTransactionToEdit(transaction);
    setEditForm({
      amount: transaction.amount.toString(),
      category: transaction.category,
      description: transaction.description || ''
    });
  };

  const handleEditSave = async () => {
    if (!transactionToEdit || !editForm.amount || isNaN(editForm.amount)) return;
    
    try {
      const updatedTransaction = await updateTransaction(transactionToEdit.id, {
        amount: Number(editForm.amount),
        category: editForm.category,
        description: editForm.description.trim()
      });
      
      const updatedTransactions = allTransactions.map(t => 
        t.id === transactionToEdit.id ? updatedTransaction : t
      );
      setAllTransactions(updatedTransactions);
      setTransactionToEdit(null);
      setEditForm({ amount: '', category: '', description: '' });
    } catch (error) {
      console.error('Error updating transaction:', error);
    }
  };

  const handleEditCancel = () => {
    setTransactionToEdit(null);
    setEditForm({ amount: '', category: '', description: '' });
  };

  const confirmDelete = async () => {
    if (transactionToDelete) {
      await deleteTransaction(transactionToDelete);
      const updatedTransactions = allTransactions.filter(
        (transaction) => transaction.id !== transactionToDelete
      );
      setAllTransactions(updatedTransactions);
      setTransactionToDelete(null);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const groupTransactionsByDate = (transactions) => {
    const groups = {};
    transactions.forEach(transaction => {
      const date = new Date(transaction.date).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(transaction);
    });
    return groups;
  };

  const groupedTransactions = groupTransactionsByDate(memoizedFilteredTransactions);

  const isFiltered = selectedMonth !== 'all' || selectedYear !== 'all';

  return (
    <div className="space-y-4">
      {/* Month and Year Filters */}
      {allTransactions.length > 0 && (
        <div className="mb-6 flex gap-3">
          {/* Month Select */}
          <div className="flex-1">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-full bg-white/90 backdrop-blur-sm border-2 border-gray-200 rounded-2xl px-4 py-3 text-gray-900 font-medium focus:border-blue-500 shadow-sm">
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Months</SelectItem>
                {availableMonths.map(month => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Year Select */}
          <div className="flex-1">
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-full bg-white/90 backdrop-blur-sm border-2 border-gray-200 rounded-2xl px-4 py-3 text-gray-900 font-medium focus:border-blue-500 shadow-sm">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {availableYears.map(year => (
                  <SelectItem key={year.value} value={year.value}>
                    {year.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {memoizedFilteredTransactions.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <DollarSign className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 text-lg font-medium mb-2">
            {!isFiltered ? 'No transactions yet' : 'No transactions found'}
          </p>
          <p className="text-gray-400 text-sm">
            {!isFiltered 
              ? 'Add your first expense to get started' 
              : 'Try adjusting your filters or add new expenses'
            }
          </p>
        </div>
      ) : (
        Object.entries(groupedTransactions)
          .sort(([a], [b]) => new Date(b) - new Date(a))
          .map(([dateString, dayTransactions]) => {
            const dayTotal = dayTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
            
            return (
              <div key={dateString} className="space-y-3">
                {/* Date Header */}
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <h3 className="text-sm font-semibold text-gray-700">
                      {formatDate(dateString)}
                    </h3>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    ${dayTotal.toFixed(2)}
              </span>
                </div>

                {/* Transactions for this date */}
                <div className="space-y-2">
                  {dayTransactions.map((t) => (
                    <SwipeableTransaction 
                      key={t.id} 
                      transaction={t} 
                      onDelete={handleDelete}
                      onEdit={handleEdit}
                    />
                  ))}
                </div>
              </div>
            );
          })
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!transactionToDelete}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">Delete Transaction?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              This action cannot be undone. This will permanently remove the
              transaction from your records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3">
            <AlertDialogCancel 
              onClick={() => setTransactionToDelete(null)}
              className="rounded-2xl"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600 text-white rounded-2xl"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Transaction Dialog */}
      <AlertDialog open={!!transactionToEdit}>
        <AlertDialogContent className="rounded-3xl max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">Edit Transaction</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              Update the transaction details below.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Category Picker */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Category</label>
              <CategoryPicker 
                category={editForm.category} 
                setCategory={(cat) => setEditForm(prev => ({ ...prev, category: cat }))}
              />
            </div>

            {/* Amount Input */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-lg font-semibold text-gray-400">
                  $
                </span>
                <Input
                  type="text"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={editForm.amount}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9.]/g, '');
                    setEditForm(prev => ({ ...prev, amount: value }));
                  }}
                  className="pl-8 text-lg font-semibold border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                />
              </div>
            </div>

            {/* Description Input */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Description</label>
              <Input
                type="text"
                placeholder="Optional description"
                value={editForm.description}
                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                className="border-2 border-gray-200 focus:border-blue-500 rounded-xl"
              />
            </div>
          </div>

          <AlertDialogFooter className="gap-3">
            <AlertDialogCancel 
              onClick={handleEditCancel}
              className="rounded-2xl"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleEditSave}
              className="bg-blue-500 hover:bg-blue-600 text-white rounded-2xl"
              disabled={!editForm.amount || isNaN(editForm.amount)}
            >
              Save Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
