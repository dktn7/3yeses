import { useTranslations } from 'next-intl';
import React from 'react';

const ContactDetails = () => {
  const t = useTranslations('Contact');

  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('placeholder')}</p>
    </div>
  );
};

export default ContactDetails;