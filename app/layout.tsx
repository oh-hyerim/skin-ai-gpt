import Script from "next/script"
import RouteFade from "./_components/RouteFade"
import AuthHeader from "../components/AuthHeader"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link rel="stylesheet" href="/index.css" />
      </head>
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <AuthHeader />
        <RouteFade>
          {children}
        </RouteFade>
        <Script src="https://cdn.jsdelivr.net/npm/sortablejs@1.15.2/Sortable.min.js" strategy="afterInteractive" />
      </body>
    </html>
  )
}


