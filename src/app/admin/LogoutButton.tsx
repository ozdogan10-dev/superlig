'use client';

import { logoutAdmin } from './actions';

export default function LogoutButton() {
  return (
    <button 
      onClick={() => logoutAdmin()}
      className="bg-red-500/20 text-red-400 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-500/30 transition-colors"
    >
      Çıkış Yap
    </button>
  );
}
