"use client";
import { Suspense } from "react";
import LoginClient from "./LoginClient";

export default function LoginBoundary() {
  return (
    <Suspense fallback={<main style={{display:"grid",placeItems:"center",minHeight:"60vh"}}>Loading...</main>}>
      <LoginClient />
    </Suspense>
  );
}


