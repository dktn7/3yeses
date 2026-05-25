const SuccessStoriesPage = () => {
  return (
    <div className="relative min-h-screen overflow-hidden landing-bg brand-true-red isolate">
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
        <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-4">Success Stories</h1>
        <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto mb-8">
          Discover the inspiring journeys of talented individuals who have found success on our platform.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Story 1 */}
          <div className="marketing-surface rounded-lg border shadow-md p-4">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Emma Thompson - Musician</h3>
            <p className="text-gray-600 dark:text-gray-400">
              As a rising guitarist, Emma struggled to get noticed in a crowded market. Using our platform's advanced search features, she connected with producers who loved her unique sound. This led to collaborations on two hit singles and a sold-out tour.
            </p>
          </div>

          {/* Story 2 */}
          <div className="marketing-surface rounded-lg border shadow-md p-4">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Liam Garcia - Actor</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Liam, a versatile actor with a passion for indie films, found his big break through our platform. Directors discovered his talent via targeted profiles, resulting in roles in three critically acclaimed movies and a nomination for Best Supporting Actor.
            </p>
          </div>

          {/* Story 3 */}
          <div className="marketing-surface rounded-lg border shadow-md p-4">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Sophia Patel - Dancer</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Sophia&apos;s contemporary dance style caught the eye of choreographers on our platform. She has since performed in Broadway productions, international festivals, and even choreographed for a major pop artist&apos;s world tour.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export async function generateStaticParams() {
  const locales = ['en-gb', 'es-ES', 'fr-FR', 'de-DE', 'it-IT', 'pt-PT', 'ru-RU', 'zh-CN', 'ja-JP', 'ar'];
  return locales.map((locale) => ({
    locale,
  }));
}

export default SuccessStoriesPage;
