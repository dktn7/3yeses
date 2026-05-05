'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FileText, Loader2 } from 'lucide-react';

interface CMSContentProps {
  slug: string;
  fallback?: React.ReactNode;
}

export default function CMSContent({ slug, fallback }: CMSContentProps) {
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = (params?.locale as string) || 'en-gb';
  const isPreview = searchParams?.get('preview') === 'true';

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    // Check for preview data in sessionStorage first
    if (isPreview) {
      try {
        const previewData = sessionStorage.getItem(`cms-preview-${slug}`);
        if (previewData) {
          const parsed = JSON.parse(previewData);
          setTitle(parsed.title || '');
          setContent(parsed.content || '');
          setLoading(false);
          return;
        }
      } catch {
        // Fall through to API fetch
      }
    }

    // Fetch published content from public API
    const fetchContent = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/cms/${slug}?locale=${locale}`);
        if (res.ok) {
          const data = await res.json();
          setTitle(data.title);
          setContent(data.content);
          setNotFound(false);
        } else {
          setNotFound(true);
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [slug, locale, isPreview]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary-blue dark:text-accent-red animate-spin" />
      </div>
    );
  }

  if (notFound) {
    if (fallback) return <>{fallback}</>;

    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-4">
          <FileText className="w-8 h-8 text-gray-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Page Under Construction
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-md mb-6">
          This page is being prepared. Please check back soon.
        </p>
        <Link
          href={`/${locale}`}
          className="px-6 py-2.5 rounded-lg font-medium text-white bg-gradient-to-r from-primary-blue to-accent-blue dark:from-accent-red dark:to-primary-red hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-blue/35 dark:focus-visible:ring-accent-red/35 transition-colors"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh]">
      {isPreview && (
        <div className="bg-amber-500 text-black text-center text-sm font-bold py-2 px-4">
          PREVIEW MODE — This content has not been published yet
        </div>
      )}
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <li>
              <Link href={`/${locale}`} className="hover:text-primary-blue dark:hover:text-accent-red focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-blue/30 dark:focus-visible:ring-accent-red/35 rounded-sm transition-colors">
                Home
              </Link>
            </li>
            <li className="flex items-center">
              <span className="mx-2">/</span>
              <span className="text-gray-900 dark:text-gray-100 font-medium">{title}</span>
            </li>
          </ol>
        </nav>

        {/* CMS Content */}
        <article
          className="prose prose-lg dark:prose-invert max-w-none
            prose-headings:text-gray-900 dark:prose-headings:text-white
            prose-p:text-gray-700 dark:prose-p:text-gray-300
            prose-a:text-primary-blue dark:prose-a:text-accent-red
            prose-strong:text-gray-900 dark:prose-strong:text-white
            prose-ul:text-gray-700 dark:prose-ul:text-gray-300
            prose-ol:text-gray-700 dark:prose-ol:text-gray-300
            prose-li:text-gray-700 dark:prose-li:text-gray-300
            prose-blockquote:border-primary-blue dark:prose-blockquote:border-accent-red prose-blockquote:text-gray-600 dark:prose-blockquote:text-gray-400
            prose-img:rounded-xl prose-img:shadow-lg"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    </div>
  );
}
