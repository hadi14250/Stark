/**
 * ROOT not-found — renders for requests that don't match any [locale] route.
 * It sits OUTSIDE NextIntlClientProvider and there is no [locale] layout above
 * it, so it must supply its own <html>/<body> and cannot use translations.
 * Keep it minimal and offer both locales.
 */
export default function RootNotFound() {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "grid",
          placeItems: "center",
          background: "#1c3c2d",
          color: "#f3efe6",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
        }}
      >
        <div style={{ padding: 24 }}>
          <p
            style={{
              fontSize: 12,
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              color: "#c2a878",
            }}
          >
            404
          </p>
          <h1 style={{ margin: "12px 0", fontSize: 28 }}>
            Page not found · الصفحة غير موجودة
          </h1>
          {/* Plain <a> is intentional: this root not-found renders its own
              <html> outside the app/[locale] tree, where next/link is unavailable. */}
          {/* eslint-disable @next/next/no-html-link-for-pages */}
          <p style={{ display: "flex", gap: 16, justifyContent: "center" }}>
            <a href="/en" style={{ color: "#c2a878" }}>
              English
            </a>
            <a href="/ar" style={{ color: "#c2a878" }}>
              العربية
            </a>
          </p>
          {/* eslint-enable @next/next/no-html-link-for-pages */}
        </div>
      </body>
    </html>
  );
}
