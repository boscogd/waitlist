'use client';

import { useState, useEffect } from 'react';

export default function WaitlistCounter() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    async function fetchCount() {
      try {
        const res = await fetch('/api/profiles/count', {
          cache: 'no-store',
        });
        const data = await res.json();
        if (typeof data.count === 'number') {
          setCount(data.count);
        }
      } catch (error) {
        console.error('Error fetching waitlist count:', error);
      }
    }

    fetchCount();
  }, []);

  const display = count === null ? '...' : `+${count}`;

  return (
    <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-full font-medium">
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
      </svg>
      <span>{display} usuarios</span>
    </div>
  );
}
