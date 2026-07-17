import { Helmet } from "react-helmet-async";

const SITE_NAME = "One-Stop Utility Service";
const SITE_URL = "https://mossutech.com";

/**
 * Per-page title/description, layered on top of the site-wide defaults
 * and Open Graph tags already set in index.html.
 */
function Seo({ title, description, path }) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const canonical = `${SITE_URL}${path || ""}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      <link rel="canonical" href={canonical} />
      <meta property="og:title" content={fullTitle} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:url" content={canonical} />
    </Helmet>
  );
}

export default Seo;
