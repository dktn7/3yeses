import Link from 'next/link';

export default function SuccessStoriesPage() {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary-blue dark:bg-accent-red flex items-center justify-center">
              <span className="text-white font-bold text-sm">3Y</span>
            </div>
            <span className="text-xl font-bold text-primary-blue dark:text-accent-red">3YESES</span>
          </Link>
        </div>
      </header>

      <div className="p-8">
        <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-primary-blue dark:text-accent-red mb-8 text-center">
          Success Stories
        </h1>
        
        <div className="space-y-8">
          {/* Story 1 */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 bg-primary-blue dark:bg-accent-red rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">JS</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
                  Jessica Stone - Actor
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  `Through 3YESES, I landed my first major commercial role. The casting director found me using their advanced search filters and was impressed by my portfolio. The platform made the entire process seamless!`
                </p>
                <div className="text-sm text-primary-blue dark:text-accent-red font-medium">
                  Booked: National TV Commercial • Rate: $5,000
                </div>
              </div>
            </div>
          </div>

          {/* Story 2 */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 bg-accent-red dark:bg-primary-blue rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">MR</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
                  Mike Rodriguez - Dancer
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {`As a professional dancer, I was struggling to find consistent work. 3YESES connected me with choreographers who were specifically looking for my style. I've booked 3 music videos this month alone!`}
                </p>
                <div className="text-sm text-primary-blue dark:text-accent-red font-medium">
                  Booked: 3 Music Videos • Total Earnings: $8,500
                </div>
              </div>
            </div>
          </div>

          {/* Story 3 */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 bg-primary-blue dark:bg-accent-red rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">SL</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
                  Sarah Lee - Casting Director
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {`3YESES has revolutionized how I find talent. The advanced filtering system helps me find exactly what I need quickly. I found the perfect lead actor for our indie film in just 2 days!`}
                </p>
                <div className="text-sm text-primary-blue dark:text-accent-red font-medium">
                  Successfully Cast: Independent Film • Budget: $2M
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
