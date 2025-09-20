export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link rel="stylesheet" href="/index.css" />
      </head>
      <body className="min-h-screen bg-gray-50 text-gray-900">
        {children}
        <script src="https://cdn.jsdelivr.net/npm/sortablejs@1.15.2/Sortable.min.js"></script>
        <script src="/index.js"></script>
      </body>
    </html>
  )
}


