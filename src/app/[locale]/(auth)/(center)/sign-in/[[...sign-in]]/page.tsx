import { SignIn } from '@clerk/nextjs';
import { getTranslations } from 'next-intl/server';
import { use } from 'react';

import { getI18nPath } from '@/utils/Helpers';

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'SignIn',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

const SignInPage = (props: { params: Promise<{ locale: string }> }) => {
  const { locale } = use(props.params);
  return <SignIn path={getI18nPath('/sign-in', locale)} />;
};

export default SignInPage;
