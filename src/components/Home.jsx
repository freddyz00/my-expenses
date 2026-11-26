import { useCallback, useMemo, useRef, useState } from "react";
import { Calendar } from "lucide-react";
import CategoryChips from "@/components/CategoryChips";
import Toast from "@/components/Toast";
import { CATEGORIES, getCategory, isKnownCategory } from "@/lib/categories";
import { formatMoney, sanitizeAmount, isValidAmount } from "@/lib/format";
import { localDayKey, dayLabel, formatTime, withCurrentTime } from "@/lib/dates";
import { monthTotal, last7Days } from "@/lib/stats";

const PRESETS = [5, 10, 20];

function readLastCategory() {
  try {
    const saved = localStorage.getItem("lastCategory");
    return isKnownCategory(saved) ? saved : CATEGORIES[0].name;
  } catch {
    return CATEGORIES[0].name;
  }
}

function saveLastCategory(name) {
  try {
    localStorage.setItem("lastCategory", name);
  } catch {
    // Private mode or storage blocked: the default is fine.
  }
}

export default function Home({ transactions, add, remove, onSeeAll }) {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [category, setCategory] = useState(readLastCategory);
  const [day, setDay] = useState(() => localDayKey(new Date()));
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);
  const amountRef = useRef(null);
  const dateRef = useRef(null);

  const now = new Date();
  const todayKey = localDayKey(now);

  const { month, today, week, bars, recent } = useMemo(() => {
    const at = new Date();
    const days = last7Days(transactions, at);
    const max = Math.max(...days.map((d) => d.total), 0);
    return {
      month: monthTotal(transactions, at.getFullYear(), at.getMonth()),
      today: days[6].total,
      week: days.reduce((s, d) => s + d.total, 0),
      bars: days.map((d) => ({ ...d, height: max > 0 ? Math.max(4, (d.total / max) * 44) : 4 })),
      recent: [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3),
    };
  }, [transactions]);

  const canAdd = isValidAmount(amount) && !saving;

  const submit = async () => {
    if (!canAdd) return;
    setSaving(true);
    try {
      const value = Number(amount);
      const id = await add({
        amount: value,
        category,
        description: note.trim(),
        date: withCurrentTime(day, new Date()),
      });
      saveLastCategory(category);
      setAmount("");
      setNote("");
      setDay(localDayKey(new Date()));
      setToast({ id, message: `Added ${formatMoney(value)} to ${category}` });
      amountRef.current?.focus();
    } catch (error) {
      console.error("Error adding expense:", error);
    } finally {
      setSaving(false);
    }
  };

  const onEnter = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submit();
    }
  };

  const openDatePicker = () => {
    const input = dateRef.current;
    if (!input) return;
    if (typeof input.showPicker === "function") {
      try {
        input.showPicker();
        return;
      } catch {
        // Fall through to focus/click.
      }
    }
    input.focus();
    input.click();
  };

  const undo = async () => {
    const id = toast?.id;
    setToast(null);
    if (id != null) await remove(id);
  };

  const hideToast = useCallback(() => setToast(null), []);

  const monthName = now.toLocaleDateString("en-US", { month: "long" });

  return (
    <div className="flex flex-col gap-4">
      <header className="flex items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-[13px] font-medium text-[#5B6474]">Spent in {monthName}</span>
          <span className="text-4xl leading-tight font-bold tracking-tight">{formatMoney(month)}</span>
          <div className="flex gap-3 text-[13px] text-[#5B6474]">
            <span>
              Today <strong className="font-semibold text-[#0F172A]">{formatMoney(today)}</strong>
            </span>
            <span>
              7 days <strong className="font-semibold text-[#0F172A]">{formatMoney(week)}</strong>
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <div role="img" aria-label="Spending over the last 7 days" className="flex h-11 items-end gap-[5px]">
            {bars.map((b, i) => (
              <div
                key={b.key}
                className="w-2 rounded-[3px]"
                style={{ height: `${b.height}px`, background: i === 6 ? "#2563EB" : "#C9D7F8" }}
              />
            ))}
          </div>
          <span className="text-[11px] text-[#5B6474]">Last 7 days</span>
        </div>
      </header>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="flex flex-col gap-3.5 rounded-[20px] border border-[#E3E6EB] bg-white p-4"
      >
        <div className="flex items-center justify-between gap-3">
          <label className="flex min-w-0 flex-1 items-baseline gap-1">
            <span className="text-[28px] font-semibold text-[#8A93A3]">$</span>
            <input
              ref={amountRef}
              autoFocus
              inputMode="decimal"
              placeholder="0.00"
              aria-label="Amount"
              value={amount}
              onChange={(e) => setAmount(sanitizeAmount(e.target.value))}
              onKeyDown={onEnter}
              className="w-full min-w-0 bg-transparent p-0 text-[40px] font-bold tracking-tight text-[#0F172A] outline-none placeholder:text-[#B7BEC9]"
            />
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={openDatePicker}
              className="flex h-11 items-center gap-1.5 rounded-full border border-[#E3E6EB] bg-[#F6F7F9] px-3 text-[13px] font-medium"
            >
              <Calendar className="size-3.5" aria-hidden="true" />
              {dayLabel(day, now)}
            </button>
            <input
              ref={dateRef}
              type="date"
              aria-label="Date"
              tabIndex={-1}
              max={todayKey}
              value={day}
              onChange={(e) => e.target.value && setDay(e.target.value)}
              className="pointer-events-none absolute inset-0 opacity-0"
            />
          </div>
        </div>

        <div className="flex gap-2">
          {PRESETS.map((p) => {
            const selected = amount === String(p);
            return (
              <button
                key={p}
                type="button"
                onClick={() => setAmount(String(p))}
                className={`h-11 flex-1 rounded-xl border text-[15px] font-semibold ${
                  selected ? "border-[#2563EB] bg-[#EAF1FE] text-[#1D4ED8]" : "border-[#E3E6EB] bg-white"
                }`}
              >
                ${p}
              </button>
            );
          })}
        </div>

        <CategoryChips value={category} onChange={setCategory} />

        <input
          placeholder="Add a note (optional)"
          aria-label="Note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onKeyDown={onEnter}
          className="h-11 rounded-xl border border-[#E3E6EB] bg-[#F6F7F9] px-3.5 text-[15px] outline-none placeholder:text-[#5B6474] focus:border-[#2563EB]"
        />

        <button
          type="submit"
          disabled={!canAdd}
          className="h-[52px] rounded-[14px] bg-[#0F172A] text-base font-semibold text-white disabled:opacity-40"
        >
          Add expense
        </button>
      </form>

      {recent.length > 0 && (
        <section aria-labelledby="recent-h" className="flex flex-col">
          <div className="flex items-center justify-between px-1 pb-1">
            <h2 id="recent-h" className="text-[15px] font-semibold">Recent</h2>
            <button type="button" onClick={onSeeAll} className="h-11 text-sm font-medium text-[#2563EB]">
              See all
            </button>
          </div>
          {recent.map((t) => {
            const c = getCategory(t.category);
            return (
              <div key={t.id} className="flex items-center gap-3 border-b border-[#E9ECF0] px-1 py-2.5">
                <span
                  className="flex size-9 flex-shrink-0 items-center justify-center rounded-[10px]"
                  style={{ background: c.tint }}
                >
                  <span className="size-2.5 rounded-full" style={{ background: c.color }} />
                </span>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-[15px] font-medium">{t.description || c.name}</span>
                  <span className="text-xs text-[#5B6474]">
                    {c.name} · {dayLabel(localDayKey(t.date), now)}, {formatTime(t.date)}
                  </span>
                </div>
                <span className="text-[15px] font-semibold tabular-nums">{formatMoney(t.amount)}</span>
              </div>
            );
          })}
        </section>
      )}

      {toast && (
        <Toast message={toast.message} actionLabel="Undo" onAction={undo} onDone={hideToast} />
      )}
    </div>
  );
}
