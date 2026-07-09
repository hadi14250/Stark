import { SITE_URL } from "@/lib/seo";

/**
 * Organization / LocalBusiness structured data. Rendered once in the layout so
 * it appears on every page. Values are placeholders pending client confirmation
 * (canonical facts: address, phone, founding year — see master plan open items).
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
      addressLocality: "Jeddah",
      addressCountry: "SA",
    },
    email: "hello@stark-ksa.net",
    sameAs: [] as string[],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
