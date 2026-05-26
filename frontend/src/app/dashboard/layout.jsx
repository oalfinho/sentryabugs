import { TopNav } from "@/components/layout/TopNav";

export default function DashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col bg-bg-primary">
      <TopNav />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
