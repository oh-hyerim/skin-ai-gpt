import Script from "next/script"
import Providers from "../components/Providers"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link rel="stylesheet" href="/index.css" />
      </head>
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <Providers>
          {children}
        </Providers>
        <Script src="https://cdn.jsdelivr.net/npm/sortablejs@1.15.2/Sortable.min.js" strategy="afterInteractive" />
        <Script src="/index.js" strategy="afterInteractive" />
      </body>
    </html>
  )
}


