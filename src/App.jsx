import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Home as HomeIcon, List, Settings as SettingsIcon } from "lucide-react";
import { useTransactions } from "@/hooks/useTransactions";
import Home from "@/components/Home";
import Activity from "@/components/Activity";
import Settings from "@/components/Settings";

const NAV = [
  { value: "home", label: "Home", icon: HomeIcon },
  { value: "activity", label: "Activity", icon: List },
  { value: "settings", label: "Settings", icon: SettingsIcon },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("home");
  const { transactions, add, update, remove, replaceAll } = useTransactions();

  return (
    <div className="viewport-height flex flex-col overflow-hidden bg-[#F6F7F9] text-[#0F172A]">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex h-full flex-col gap-0">
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto flex h-full w-full max-w-md flex-col px-5 pt-7">
            <TabsContent value="home" className="flex min-h-0 flex-col pb-4">
              <Home
                transactions={transactions}
                add={add}
                remove={remove}
                onSeeAll={() => setActiveTab("activity")}
              />
            </TabsContent>
            <TabsContent value="activity" className="flex-none pb-6">
              <Activity transactions={transactions} update={update} remove={remove} />
            </TabsContent>
            <TabsContent value="settings" className="flex-none pb-6">
              <Settings transactions={transactions} replaceAll={replaceAll} />
            </TabsContent>
          </div>
        </div>

        <nav className="flex-shrink-0 border-t border-[#E3E6EB] bg-white pb-[env(safe-area-inset-bottom)]">
          <TabsList className="mx-auto grid h-[68px] w-full max-w-md grid-cols-3 gap-1 rounded-none bg-transparent px-3 py-1.5">
            {NAV.map(({ value, label, icon }) => {
              const Icon = icon;
              return (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="flex h-full flex-col items-center justify-center gap-1 rounded-xl border-0 text-[11px] font-medium text-[#5B6474] shadow-none data-[state=active]:bg-transparent data-[state=active]:font-semibold data-[state=active]:text-[#2563EB] data-[state=active]:shadow-none"
                >
                  <Icon className="size-[22px]" aria-hidden="true" />
                  {label}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </nav>
      </Tabs>
    </div>
  );
}
