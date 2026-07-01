import type { Metadata } from "next";
import "./globals.css";
import { FinancialProvider } from "@/context/financial-context";

export const metadata: Metadata = {
  title: "mExpense - Premium Expense Management & Family Fintech Dashboard",
  description: "Manage personal balances, track shared family budgets, log peer debts, and audit financial statements with clean glassmorphic fintech analytics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <FinancialProvider>
          {children}
        </FinancialProvider>
      </body>
    </html>
  );
}
