export default function LegalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="p-6 md:p-10">
        {children}
      </div>
    </div>
  );
}
