import Link from 'next/link';

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 p-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 dark:from-red-500 dark:to-pink-500 flex items-center justify-center transform group-hover:scale-105 transition-transform">
              <span className="text-white font-bold text-lg">3Y</span>
            </div>
            <span className="text-2xl font-bold text-blue-600 dark:text-red-500 group-hover:text-purple-600 dark:group-hover:text-pink-500 transition-colors">3YESES</span>
          </Link>
          
          <Link 
            href="/" 
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-red-500 transition-colors flex items-center gap-1"
          >
            ← Back to Home
          </Link>
        </div>
      </header>
      
      {/* Auth Content */}
      <div className="flex items-center justify-center py-8 px-4 min-h-[calc(100vh-80px)]">
        <div className="max-w-2xl w-full">
          {children}
        </div>
      </div>
    </div>
  );
}
