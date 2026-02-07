import PageContent from '@/components/PageContent';

const SuccessStoriesPage = () => {
  return (
    <PageContent title="Success Stories">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100 mb-4">Success Stories</h1>
        <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto mb-8">
          Discover the inspiring journeys of talented individuals who have found success on our platform.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Story 1 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Emma Thompson - Musician</h3>
            <p className="text-gray-600 dark:text-gray-400">
              As a rising guitarist, Emma struggled to get noticed in a crowded market. Using our platform's advanced search features, she connected with producers who loved her unique sound. This led to collaborations on two hit singles and a sold-out tour.
            </p>
          </div>

          {/* Story 2 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Liam Garcia - Actor</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Liam, a versatile actor with a passion for indie films, found his big break through our platform. Directors discovered his talent via targeted profiles, resulting in roles in three critically acclaimed movies and a nomination for Best Supporting Actor.
            </p>
          </div>

          {/* Story 3 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Sophia Patel - Dancer</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Sophia&apos;s contemporary dance style caught the eye of choreographers on our platform. She has since performed in Broadway productions, international festivals, and even choreographed for a major pop artist&apos;s world tour.
            </p>
          </div>
        </div>
      </div>
    </PageContent>
  );
};

export async function generateStaticParams() {
  const locales = ['en-gb', 'es-ES', 'fr-FR', 'de-DE', 'it-IT', 'pt-PT', 'ru-RU', 'zh-CN', 'ja-JP', 'ar'];
  return locales.map((locale) => ({
    locale,
  }));
}

export default SuccessStoriesPage;