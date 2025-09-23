"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export const dynamic = "force-dynamic";

export default function AuthDebugPage() {
  const { data: session, status } = useSession();
  const [storageKeys, setStorageKeys] = useState<string[]>([]);

  const refresh = () => {
    try {
      const keys = Object.keys(localStorage).sort();
      setStorageKeys(keys);
    } catch {
      setStorageKeys([]);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  return (
    <div className="mx-auto max-w-3xl p-4">
      <h1 className="mb-4 text-xl font-semibold">Auth Debug (NextAuth)</h1>
      
      <div className="mb-4 rounded border bg-white p-3">
        <div className="mb-2 text-sm text-gray-600">Session Status</div>
        <pre className="whitespace-pre-wrap break-words text-sm">{status}</pre>
      </div>
      
      <div className="mb-4 rounded border bg-white p-3">
        <div className="mb-2 text-sm text-gray-600">NextAuth Session</div>
        <pre className="whitespace-pre-wrap break-words text-xs">{JSON.stringify(session, null, 2)}</pre>
      </div>
      
      <div className="mb-4 rounded border bg-white p-3">
        <div className="mb-2 text-sm text-gray-600">User Info</div>
        <pre className="whitespace-pre-wrap break-words text-xs">{JSON.stringify(session?.user || null, null, 2)}</pre>
      </div>
      
      <div className="mb-4 rounded border bg-white p-3">
        <div className="mb-2 text-sm text-gray-600">localStorage keys</div>
        <ul className="list-disc pl-5 text-xs">
          {storageKeys.map((k) => (
            <li key={k}>{k}</li>
          ))}
        </ul>
      </div>
      
      <button type="button" onClick={refresh} className="rounded border border-gray-300 bg-white px-3 py-1 text-sm hover:bg-gray-50">
        Refresh
      </button>
    </div>
  );
}



