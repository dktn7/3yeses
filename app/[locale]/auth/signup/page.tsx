import { redirect } from 'next/navigation';

type Props = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function SignupPage({ params }: Props) {
  const { locale } = await params;
  // Redirect directly to the multi-step signup flow
  redirect(`/${locale}/auth/signup/steps/step-1`);
}