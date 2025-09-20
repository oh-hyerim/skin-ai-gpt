"use client";

import { useEffect, useState } from "react";
import getSupabase from "../../lib/supabaseClient";

export default function AuthDebugPage() {
  const [event, setEvent] = useState<string>("init");
  const [sessionJson, setSessionJson] = useState<string>("null");
  const [userJson, setUserJson] = useState<string>("null");
  const [storageKeys, setStorageKeys] = useState<string[]>([]);

  const supabase = getSupabase();

  const refresh = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setSessionJson(JSON.stringify(session, null, 2));
    const { data: { user } } = await supabase.auth.getUser();
    setUserJson(JSON.stringify(user, null, 2));
    try {
      const keys = Object.keys(localStorage).sort();
      setStorageKeys(keys);
    } catch {
      setStorageKeys([]);
    }
  };

  useEffect(() => {
    refresh();
    const { data } = supabase.auth.onAuthStateChange((evt, session) => {
      setEvent(evt);
      setSessionJson(JSON.stringify(session, null, 2));
      supabase.auth.getUser().then(({ data }) => {
        setUserJson(JSON.stringify(data.user, null, 2));
      });
      try {
        const keys = Object.keys(localStorage).sort();
        setStorageKeys(keys);
      } catch {
        setStorageKeys([]);
      }
    });
    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="mx-auto max-w-3xl p-4">
      <h1 className="mb-4 text-xl font-semibold">Auth Debug</h1>
      <div className="mb-4 rounded border bg-white p-3">
        <div className="mb-2 text-sm text-gray-600">event</div>
        <pre className="whitespace-pre-wrap break-words text-sm">{event}</pre>
      </div>
      <div className="mb-4 rounded border bg-white p-3">
        <div className="mb-2 text-sm text-gray-600">supabase.auth.getSession()</div>
        <pre className="whitespace-pre-wrap break-words text-xs">{sessionJson}</pre>
      </div>
      <div className="mb-4 rounded border bg-white p-3">
        <div className="mb-2 text-sm text-gray-600">supabase.auth.getUser()</div>
        <pre className="whitespace-pre-wrap break-words text-xs">{userJson}</pre>
      </div>
      <div className="mb-4 rounded border bg-white p-3">
        <div className="mb-2 text-sm text-gray-600">localStorage keys</div>
        <ul className="list-disc pl-5 text-xs">
          {storageKeys.map((k) => (
            <li key={k}>{k}</li>
          ))}
        </ul>
      </div>
      <button type="button" onClick={refresh} className="rounded border border-gray-300 bg-white px-3 py-1 text-sm hover:bg-gray-50">Refresh</button>
    </div>
  );
}



