import { ReactNode } from 'react';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { CONFIG } from '../src/config';

export function TonConnectProvider({ children }: { children: ReactNode }) {
  return (
    <TonConnectUIProvider manifestUrl={CONFIG.TON_CONNECT_MANIFEST_URL}>
      {children}
    </TonConnectUIProvider>
  );
}

