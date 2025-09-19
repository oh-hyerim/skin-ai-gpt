'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient'; // 당신의 export 경로에 맞춰 수정

export default function AuthDebug() {
  const [sessionJSON, setSessionJSON] = useState<string>('(loading...)');
  const [userJSON, setUserJSON] = useState<string>('(loading...)');
  const [storageKeys, setStorageKeys] = useState<string[]>([]);

  async function refresh() {
    const { data } = await supabase.auth.getSession();
    setSessionJSON(JSON.stringify(data?.session ?? null, null, 2));
    const { data: userData } = await supabase.auth.getUser();
    setUserJSON(JSON.stringify(userData?.user ?? null, null, 2));
    try {
      const keys = Object.keys(window.localStorage);
      setStorageKeys(keys);
    } catch {
      setStorageKeys(['localStorage inaccessible']);
    }
  }

  useEffect(() => {
    refresh();
    const { data: sub } = supabase.auth.onAuthStateChange(() => refresh());
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <h1>Auth Debug</h1>
      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr' }}>
        <div>
          <h2>Session</h2>
          <pre style={{ background: '#f7f7f7', padding: 12, minHeight: 200 }}>{sessionJSON}</pre>
        </div>
        <div>
          <h2>User</h2>
          <pre style={{ background: '#f7f7f7', padding: 12, minHeight: 200 }}>{userJSON}</pre>
        </div>
      </div>
      <div>
        <h2>localStorage keys</h2>
        <pre style={{ background: '#f7f7f7', padding: 12 }}>{storageKeys.join('\n') || '(empty)'}</pre>
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button onClick={refresh}>Refresh</button>
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            refresh();
          }}
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
