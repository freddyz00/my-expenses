import { useEffect } from "react";

export default function Toast({ message, actionLabel, onAction, onDone }) {
  useEffect(() => {
    const timer = setTimeout(onDone, 4000);
    return () => clearTimeout(timer);
  }, [message, onDone]);

  return (
    <div
      role="status"
      className="fixed inset-x-4 bottom-[92px] z-40 mx-auto flex max-w-md items-center gap-3 rounded-2xl bg-[#0F172A] py-2 pr-2 pl-4 text-white shadow-lg"
    >
      <span className="flex-1 text-sm">{message}</span>
      {actionLabel && (
        <button
          type="button"
          onClick={onAction}
          className="h-11 rounded-xl px-3 text-sm font-semibold text-[#93B4FB]"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
