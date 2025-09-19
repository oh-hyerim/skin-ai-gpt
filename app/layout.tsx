import AuthHeader from "../components/AuthHeader";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <AuthHeader />
        {children}
      </body>
    </html>
  )
}


