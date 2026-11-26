import { useRef, useState } from "react";
import { Download, Upload } from "lucide-react";
import { toCSV, toBackup, parseBackup } from "@/lib/exporters";
import { localDayKey } from "@/lib/dates";

function downloadFile(filename, text, mime) {
  const url = URL.createObjectURL(new Blob([text], { type: mime }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function Row({ icon, title, subtitle, onClick, disabled, last }) {
  const Icon = icon;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex w-full items-center gap-3 bg-white p-3.5 text-left disabled:opacity-50 ${
        last ? "" : "border-b border-[#EEF0F3]"
      }`}
    >
      <Icon className="size-5 text-[#2563EB]" aria-hidden="true" />
      <span className="flex flex-1 flex-col">
        <span className="text-[15px] font-medium">{title}</span>
        <span className="text-xs text-[#5B6474]">{subtitle}</span>
      </span>
    </button>
  );
}

export default function Settings({ transactions, replaceAll }) {
  const fileRef = useRef(null);
  const [message, setMessage] = useState(null);
  const empty = transactions.length === 0;
  const today = localDayKey(new Date());

  const exportCSV = () =>
    downloadFile(`expenses-${today}.csv`, toCSV(transactions), "text/csv;charset=utf-8");

  const backup = () =>
    downloadFile(`expenses-backup-${today}.json`, toBackup(transactions, new Date()), "application/json");

  const restore = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const result = parseBackup(await file.text());
    if (!result.ok) {
      setMessage({ error: true, text: result.error });
      return;
    }
    const n = transactions.length;
    const m = result.transactions.length;
    if (!window.confirm(`Replace all ${n} expenses with ${m} from this backup?`)) return;
    try {
      await replaceAll(result.transactions);
      setMessage({ error: false, text: `Restored ${m} ${m === 1 ? "expense" : "expenses"}.` });
    } catch (error) {
      console.error("Restore failed:", error);
      setMessage({ error: true, text: "Restore failed. Your expenses were not changed." });
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-[28px] font-bold tracking-tight">Settings</h1>

      <section aria-labelledby="data-h" className="flex flex-col gap-2">
        <h2 id="data-h" className="px-1 text-[13px] font-semibold tracking-wide text-[#5B6474] uppercase">
          Your data
        </h2>
        <div className="overflow-hidden rounded-2xl border border-[#E3E6EB]">
          <Row
            icon={Download}
            title="Export as CSV"
            subtitle="Opens in Excel, Numbers or Google Sheets"
            onClick={exportCSV}
            disabled={empty}
          />
          <Row
            icon={Download}
            title="Back up as JSON"
            subtitle="Full backup you can restore later"
            onClick={backup}
            disabled={empty}
          />
          <Row
            icon={Upload}
            title="Restore from backup"
            subtitle="Import a JSON backup file"
            onClick={() => fileRef.current?.click()}
            last
          />
        </div>
        {empty && <p className="px-1 text-xs text-[#5B6474]">No expenses yet</p>}
        {message && (
          <p role="status" className={`px-1 text-sm ${message.error ? "text-[#B91C1C]" : "text-[#0F766E]"}`}>
            {message.text}
          </p>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          onChange={restore}
          className="hidden"
          aria-hidden="true"
          tabIndex={-1}
        />
      </section>
    </div>
  );
}
