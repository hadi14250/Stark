import { SITE_URL } from "@/lib/seo";
import { CONTACT_COUNTRY, CONTACT_EMAIL, CONTACT_LOCALITY } from "@/content/facts";

/**
 * Organization structured data. Rendered once in the layout so it appears on
 * every page.
 *
 * THIS IS COPY, even though it looks like configuration. Whatever is in here is
 * what a search engine indexes and what an assistant reads back to someone who
 * asks how to contact STARK — so it is held to the same sourcing rule as the
 * visible text, and it reads the same constants.
 *
 * It was not. This block published `hello@stark-ksa.net` while every visible
 * surface said `info@stark.com.sa`: one page, two addresses, and the one no
 * human had confirmed was the machine-readable one. See `content/facts.ts`.
 *
 * ⚠ NO FOUNDING YEAR HERE ON PURPOSE. `foundingDate` would be a precise,
 * machine-readable assertion about STARK, and 1967 belongs to SLIC — one of
 * the two factories the brand sits over. Stating it here would claim it for
 * the wrong legal entity in the one format that gets parsed literally.
 */
export function JsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "STARK",
    url: SITE_URL,
    logo: `${SITE_URL}/brand/logo-icon-green.png`,
    description:
      "A Saudi manufacturer of integrated woodworks, mattresses and turnkey hospitality environments.",
    address: {
      "@type": "PostalAddress",
      addressLocality: CONTACT_LOCALITY,
      addressCountry: CONTACT_COUNTRY,
    },
    email: CONTACT_EMAIL,
    // TODO(F-content): real handles pending from the client. An empty array is
    // correct until then; a guessed profile URL is a false claim of identity.
    sameAs: [] as string[],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
