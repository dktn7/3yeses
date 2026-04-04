import {getRequestConfig} from 'next-intl/server';


export default getRequestConfig(async ({locale}) => {
  // Guard against undefined, 'undefined' string, or invalid locale
  const resolvedLocale = (locale && locale !== 'undefined' && typeof locale === 'string') ? locale : 'en-gb';
  
  // Handle 'en' locale by using 'en.json' messages
  const messagesFile = resolvedLocale;
  try {
    const messages = (await import(`./messages/${messagesFile}.json`)).default;
    return {
      locale: resolvedLocale,
      messages,
      timeZone: 'UTC'
    };
  } catch {
    // Fallback to en-gb if locale file doesn't exist
    console.warn(`Messages file for locale '${messagesFile}' not found, falling back to 'en-gb'`);
    return {
      locale: resolvedLocale,
      messages: (await import(`./messages/en-gb.json`)).default,
      timeZone: 'UTC'
    };
  }
});
