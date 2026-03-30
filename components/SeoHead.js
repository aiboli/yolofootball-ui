import Head from "next/head";

const SITE_NAME = "yolofootball";
const SITE_URL = "https://www.yolofootball.com";
const DEFAULT_IMAGE = `${SITE_URL}/assets/logo/logo.png`;

function SeoHead({
  title,
  description,
  path = "/",
  image = DEFAULT_IMAGE,
  noindex = false,
  schema,
}) {
  const canonicalUrl = `${SITE_URL}${path}`;
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const robots = noindex ? "noindex, nofollow" : "index, follow";

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={robots} />
      <link rel="canonical" href={canonicalUrl} />

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={image} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      <meta name="google-adsense-account" content="ca-pub-8073958171092439"></meta>

      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" />
      <link
        href="https://fonts.googleapis.com/css2?family=Roboto"
        rel="stylesheet"
      />
      <link rel="icon" type="image/x-icon" href="/assets/logo/favicon.ico" />

      {schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      )}
    </Head>
  );
}

export default SeoHead;
