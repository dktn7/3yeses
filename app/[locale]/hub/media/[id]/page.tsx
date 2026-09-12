import { redirect } from 'next/navigation';
import { buildLocalizedPath } from '@/lib/locale-path';

export default async function MediaViewerPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const resolvedParams = await params;
  redirect(buildLocalizedPath(resolvedParams.locale, `/hub?mediaId=${resolvedParams.id}`));
}
