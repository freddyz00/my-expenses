import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Home as HomeIcon, List, Settings as SettingsIcon } from "lucide-react";
import { useTransactions } from "@/hooks/useTransactions";
import Home from "@/components/Home";
import Activity from "@/components/Activity";

const NAV = [
  { value: "home", label: "Home", icon: HomeIcon },
  { value: "activity", label: "Activity", icon: List },
  { value: "settings", label: "Settings", icon: SettingsIcon },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("home");
  const { transactions, add, update, remove } = useTransactions();

  return (
    <div className="viewport-height flex flex-col overflow-hidden bg-[#F6F7F9] text-[#0F172A]">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex h-full flex-col gap-0">
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-md px-5 pt-7 pb-6">
            <TabsContent value="home">
              <Home
                transactions={transactions}
                add={add}
                remove={remove}
                onSeeAll={() => setActiveTab("activity")}
              />
            </TabsContent>
            <TabsContent value="activity">
              <Activity transactions={transactions} update={update} remove={remove} />
            </TabsContent>
            <TabsContent value="settings">
              <p>Settings</p>
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
