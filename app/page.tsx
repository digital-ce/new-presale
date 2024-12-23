// app/page.tsx

'use client'

import MintSBT from "@/components/MintSBT";
import { TonConnectUIProvider } from "@tonconnect/ui-react";

const MANIFEST_URL = 'https://gray-accused-harrier-397.mypinata.cloud/ipfs/bafkreigcw6dmtntan4rn2eorbyencyeg6mjd7nrz7ioxpvurel26zcwgjy';

export default function Home() {
  return (
    <TonConnectUIProvider manifestUrl={MANIFEST_URL}>
      <MintSBT />
    </TonConnectUIProvider>
  );
}
