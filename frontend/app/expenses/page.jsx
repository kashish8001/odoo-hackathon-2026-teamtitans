"use client";
import { useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import ExpenseTable from "@/components/expenses/ExpenseTable";
import NewExpenseForm from "@/components/expenses/NewExpenseForm";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function ExpensePage() {
  const [showNewExpenseForm, setShowNewExpenseForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleExpenseCreated = () => {
    setShowNewExpenseForm(false);
    setRefreshKey(prev => prev + 1);
  };

  return (
    <ProtectedRoute>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');`}</style>
      <div className="flex h-screen bg-[#0d0d10] overflow-hidden font-[Outfit]">
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Topbar
            actions={[
              { label: "+ New Expense", variant: "primary", onClick: () => setShowNewExpenseForm(true) },
            ]}
          />
          <main className="flex-1 overflow-y-auto p-7 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-[26px] font-extrabold text-[#f0f0f5] tracking-tight">Expense & Fuel Logging</h1>
                <p className="text-sm text-[#6b7280] mt-1">Monitor, record, and dispatch logs for vehicle expenses</p>
              </div>
            </div>

            <div className="flex-1">
              <ExpenseTable key={refreshKey} />
            </div>

            {showNewExpenseForm && (
              <NewExpenseForm
                closeModal={() => setShowNewExpenseForm(false)}
                onSuccess={handleExpenseCreated}
              />
            )}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}

