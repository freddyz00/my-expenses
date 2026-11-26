import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import EditSheet from "@/components/EditSheet";
import { CATEGORIES, getCategory, categoryGroup } from "@/lib/categories";
import { formatMoney } from "@/lib/format";
import { dayLabel, formatTime } from "@/lib/dates";
import { inMonth, totalsByCategory, groupByDay } from "@/lib/stats";

const chipBase = "h-11 flex-shrink-0 rounded-full border px-4 text-[13px] font-medium";

export default function Activity({ transactions, update, remove }) {
  const now = new Date();
  const [view, setView] = useState({ year: now.getFullYear(), month: now.getMonth() });
  const [filter, setFilter] = useState("All");
  const [editingId, setEditingId] = useState(null);

  const isCurrentMonth = view.year === now.getFullYear() && view.month === now.getMonth();
  const monthDate = new Date(view.year, view.month, 1);
  const monthName = monthDate.toLocaleDateString("en-US", { month: "long" });

  const { monthTxns, total, byCategory } = useMemo(() => {
    const list = inMonth(transactions, view.year, view.month);
    const cats = totalsByCategory(list);
    return { monthTxns: list, total: cats.reduce((s, c) => s + c.total, 0), byCategory: cats };
  }, [transactions, view]);

  const groups = useMemo(() => {
    const list =
      filter === "All" ? monthTxns : monthTxns.filter((t) => categoryGroup(t.category) === filter);
    return groupByDay(list);
  }, [monthTxns, filter]);

  const editing = transactions.find((t) => t.id === editingId) ?? null;

  const shiftMonth = (delta) =>
    setView(({ year, month }) => {
      const d = new Date(year, month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });

  const count = monthTxns.length;
  const barLabel = byCategory.map((c) => `${c.name} ${Math.round((c.total / total) * 100)}%`).join(", ");

  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex items-center justify-between">
        <button
          type="button"
          aria-label="Previous month"
          onClick={() => shiftMonth(-1)}
          className="flex size-11 items-center justify-center rounded-xl border border-[#E3E6EB] bg-white"
        >
          <ChevronLeft className="size-[18px]" aria-hidden="true" />
        </button>
        <h1 className="text-[17px] font-semibold">
          {monthName} {view.year}
        </h1>
        <button
          type="button"
          aria-label="Next month"
          onClick={() => shiftMonth(1)}
          disabled={isCurrentMonth}
          className="flex size-11 items-center justify-center rounded-xl border border-[#E3E6EB] bg-white disabled:text-[#B7BEC9]"
        >
          <ChevronRight className="size-[18px]" aria-hidden="true" />
        </button>
      </div>

      <section aria-label="Month summary" className="flex flex-col gap-3 rounded-[20px] border border-[#E3E6EB] bg-white p-4">
        <div className="flex items-baseline justify-between">
          <span className="text-[30px] font-bold tracking-tight">{formatMoney(total)}</span>
          <span className="text-[13px] text-[#5B6474]">
            {count} {count === 1 ? "expense" : "expenses"}
          </span>
        </div>
        {byCategory.length > 0 && (
          <>
            <div role="img" aria-label={barLabel} className="flex h-2.5 gap-0.5 overflow-hidden rounded-full">
              {byCategory.map((c) => (
                <div key={c.name} style={{ width: `${(c.total / total) * 100}%`, background: c.color }} />
              ))}
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[13px]">
              {byCategory.map((c) => (
                <div key={c.name} className="flex items-center gap-2">
                  <span className="size-2 rounded-full" style={{ background: c.color }} />
                  <span className="flex-1 text-[#5B6474]">{c.name}</span>
                  <strong className="font-semibold">{formatMoney(c.total)}</strong>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      <div role="radiogroup" aria-label="Filter by category" className="-mx-5 flex gap-2 overflow-x-auto px-5">
        {["All", ...CATEGORIES.map((c) => c.name)].map((name) => {
          const selected = filter === name;
          return (
            <button
              key={name}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => setFilter(name)}
              className={`${chipBase} ${selected ? "border-[#0F172A] bg-[#0F172A] text-white" : "border-[#E3E6EB] bg-white"}`}
            >
              {name}
            </button>
          );
        })}
      </div>

      {groups.length === 0 ? (
        <p className="py-12 text-center text-[15px] text-[#5B6474]">No expenses in {monthName}</p>
      ) : (
        <div className="flex flex-col gap-1">
          {groups.map((g) => (
            <div key={g.key} className="flex flex-col gap-1">
              <div className="flex justify-between px-1 pt-2 pb-1 text-[13px] font-semibold text-[#5B6474]">
                <span>{dayLabel(g.key, now)}</span>
                <span className="text-[#0F172A]">{formatMoney(g.total)}</span>
              </div>
              <ul className="overflow-hidden rounded-2xl border border-[#E3E6EB] bg-white">
                {g.items.map((t) => {
                  const c = getCategory(t.category);
                  return (
                    <li key={t.id} className="border-b border-[#EEF0F3] last:border-b-0">
                      <button
                        type="button"
                        onClick={() => setEditingId(t.id)}
                        className="flex w-full items-center gap-3 px-3.5 py-3 text-left"
                      >
                        <span
                          className="flex size-9 flex-shrink-0 items-center justify-center rounded-[10px]"
                          style={{ background: c.tint }}
                        >
                          <span className="size-2.5 rounded-full" style={{ background: c.color }} />
                        </span>
                        <span className="flex min-w-0 flex-1 flex-col">
                          <span className="truncate text-[15px] font-medium">{t.description || c.name}</span>
                          <span className="text-xs text-[#5B6474]">
                            {c.name} · {formatTime(t.date)}
                          </span>
                        </span>
                        <span className="text-[15px] font-semibold tabular-nums">{formatMoney(t.amount)}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}

      <EditSheet
        transaction={editing}
        onClose={() => setEditingId(null)}
        onSave={async (patch) => {
          await update(editingId, patch);
          setEditingId(null);
        }}
        onDelete={async () => {
          await remove(editingId);
          setEditingId(null);
        }}
      />
    </div>
  );
}
