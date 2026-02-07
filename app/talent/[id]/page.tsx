import { redirect } from 'next/navigation';

export default function TalentPageRedirect({ params }: { params: { id: string } }) {
  // Redirect to the localized version with default locale
  redirect(`/en-gb/talent/${params.id}`);
}
