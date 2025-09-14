import Link from 'next/link';

export default function HowItWorksPage() {
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
          How 3YESES Works
        </h1>
        
        <div className="space-y-12">
          {/* For Clients */}
          <section>
            <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-gray-100">
              For Clients & Casting Directors
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-blue dark:bg-accent-red rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">1</span>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">Search & Filter</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Use our advanced search to find professionals by age, experience, location, and skills.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-blue dark:bg-accent-red rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">2</span>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">Review Profiles</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Browse portfolios, watch demo reels, and read reviews from previous collaborations.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-blue dark:bg-accent-red rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">3</span>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">Connect & Hire</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Message talent directly, negotiate terms, and book your perfect professional.
                </p>
              </div>
            </div>
          </section>

          {/* For Talent */}
          <section>
            <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-gray-100">
              For Creative Professionals
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-accent-red dark:bg-primary-blue rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">1</span>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">Create Profile</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Build a comprehensive profile showcasing your skills, experience, and portfolio.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-accent-red dark:bg-primary-blue rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">2</span>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">Get Discovered</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Be found by casting directors and clients looking for your specific talents.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-accent-red dark:bg-primary-blue rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">3</span>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">Book Work</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Receive opportunities, negotiate rates, and build your professional network.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
    </div>
  );
}
