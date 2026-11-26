import { useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-alert-dialog";
import { X, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogPortal, AlertDialogOverlay } from "@/components/ui/alert-dialog";
import CategoryChips from "@/components/CategoryChips";
import { categoryGroup } from "@/lib/categories";
import { sanitizeAmount, isValidAmount } from "@/lib/format";
import { toDateInput, toTimeInput, fromDateTimeInputs, localDayKey } from "@/lib/dates";

const fieldClass =
  "h-11 w-full rounded-xl border border-[#E3E6EB] bg-[#F6F7F9] px-3 text-[15px] text-[#0F172A] outline-none focus:border-[#2563EB]";

function EditForm({ transaction, onSave, onDelete, onClose }) {
  const [amount, setAmount] = useState(String(Number(transaction.amount) || ""));
  const [category, setCategory] = useState(categoryGroup(transaction.category));
  const [date, setDate] = useState(toDateInput(transaction.date));
  const [time, setTime] = useState(toTimeInput(transaction.date));
  const [note, setNote] = useState(transaction.description || "");
  const [confirming, setConfirming] = useState(false);

  const canSave = isValidAmount(amount) && date !== "";

  const save = () => {
    if (!canSave) return;
    onSave({
      amount: Number(amount),
      category,
      description: note.trim(),
      date: fromDateTimeInputs(date, time),
    });
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
      className="flex flex-col gap-[18px]"
    >
      <div className="h-1 w-10 self-center rounded-full bg-[#D5DAE1]" />
      <div className="flex items-center justify-between">
        <DialogPrimitive.Title className="text-lg font-semibold">Edit expense</DialogPrimitive.Title>
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="flex size-11 items-center justify-center rounded-xl text-[#5B6474]"
        >
          <X className="size-5" aria-hidden="true" />
        </button>
      </div>

      <label className="flex items-baseline gap-1 border-b border-[#E3E6EB] pb-3">
        <span className="text-[28px] font-semibold text-[#8A93A3]">$</span>
        <input
          inputMode="decimal"
          aria-label="Amount"
          value={amount}
          onChange={(e) => setAmount(sanitizeAmount(e.target.value))}
          className="w-full bg-transparent p-0 text-[40px] font-bold tracking-tight outline-none"
        />
      </label>

      <div className="flex flex-col gap-2">
        <span className="text-[13px] font-medium text-[#5B6474]">Category</span>
        <CategoryChips value={category} onChange={setCategory} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-medium text-[#5B6474]">Date</span>
          <input
            type="date"
            max={localDayKey(new Date())}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={fieldClass}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-medium text-[#5B6474]">Time</span>
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className={fieldClass} />
        </label>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-[13px] font-medium text-[#5B6474]">Note</span>
        <input value={note} onChange={(e) => setNote(e.target.value)} className={fieldClass} />
      </label>

      {confirming ? (
        <div className="flex flex-col gap-3 rounded-2xl bg-[#FEF2F2] p-4">
          <span className="text-[15px] font-semibold text-[#991B1B]">Delete this expense?</span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="h-11 rounded-xl border border-[#E3E6EB] bg-white text-[15px] font-semibold"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="h-11 rounded-xl bg-[#B91C1C] text-[15px] font-semibold text-white"
            >
              Delete
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-1.5 pt-1">
          <button
            type="submit"
            disabled={!canSave}
            className="h-[52px] rounded-[14px] bg-[#0F172A] text-base font-semibold text-white disabled:opacity-40"
          >
            Save changes
          </button>
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="flex h-12 items-center justify-center gap-2 rounded-[14px] text-[15px] font-semibold text-[#B91C1C]"
          >
            <Trash2 className="size-4" aria-hidden="true" />
            Delete expense
          </button>
        </div>
      )}
    </form>
  );
}

export default function EditSheet({ transaction, onSave, onDelete, onClose }) {
  return (
    <AlertDialog open={!!transaction} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogPortal>
        <AlertDialogOverlay onClick={onClose} />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className="fixed inset-x-0 bottom-0 z-50 mx-auto max-h-[92%] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white px-5 pt-2.5 pb-[max(28px,env(safe-area-inset-bottom))] text-[#0F172A] shadow-lg outline-none"
        >
          {transaction && (
            <EditForm
              key={transaction.id}
              transaction={transaction}
              onSave={onSave}
              onDelete={onDelete}
              onClose={onClose}
            />
          )}
        </DialogPrimitive.Content>
      </AlertDialogPortal>
    </AlertDialog>
  );
}
