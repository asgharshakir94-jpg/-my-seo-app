export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col">
      <main className="flex-1">{children}</main>
    </div>
  );
}