import { redirect } from 'next/navigation';

type Props = {
  params: {
    locale: string;
  };
};

export default function SignupPage({ params }: Props) {
  // Redirect directly to step-1
  redirect(`/${params.locale}/auth/signup/step-1`);
}