// src/src/lib/tonConnect.ts
import { TonConnect } from '@tonconnect/sdk';
import { CONFIG } from '../config';

// Формируем manifestUrl (как и раньше)
const manifestUrl =
  CONFIG.TON_CONNECT_MANIFEST_URL ||
  `${window.location.origin}${
    (import.meta as any).env?.BASE_URL || '/'
  }tonconnect-manifest.json`;

// Единственный экземпляр SDK (без UI, значит НЕ создаёт <tc-root>)
export const tc = new TonConnect({ manifestUrl });

// Текущий адрес (если подключен)
export function getConnectedAddress(): string | null {
  return tc.account?.address ?? null;
}

// Унифицированная отправка транзакции через SDK
export async function sendTransaction(opts: { to: string; amount: string; payload?: string }) {
  const validUntil = Math.floor(Date.now() / 1000) + 300;

  await tc.sendTransaction({
    validUntil,
    messages: [
      {
        address: opts.to,
        amount: opts.amount,         // строка в nanoton
        payload: opts.payload,       // base64, если есть
      },
    ],
  });

  return { hash: undefined as string | undefined };
}
