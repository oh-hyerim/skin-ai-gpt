export { default } from "next-auth/middleware";

// 보호할 경로 지정: /app, /dashboard 등
export const config = {
  matcher: [
    "/app/:path*",
    "/dashboard/:path*",
  ],
};


