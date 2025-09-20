import Script from "next/script"
import TopBarAuthSwitch from "./_components/TopBarAuthSwitch"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link rel="stylesheet" href="/index.css" />
      </head>
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <TopBarAuthSwitch />
        {children}
        <Script src="https://cdn.jsdelivr.net/npm/sortablejs@1.15.2/Sortable.min.js" strategy="afterInteractive" />
      </body>
    </html>
  )
}


