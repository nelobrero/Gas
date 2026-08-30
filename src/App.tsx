import { usePrivy, useWallets, toViemAccount } from '@privy-io/react-auth';
import { createSmartWalletClient, alchemyWalletTransport } from '@alchemy/wallet-apis';
import { sepolia } from 'viem/chains';
import { encodeFunctionData } from 'viem';
import { useEffect, useMemo, useState } from 'react';
import type { LocalAccount } from 'viem';

const contractAddress = "0x7FFF79EebC1a8ee57E1B9EC905B9c53B81523dbe";
const contractAbi = [
  {
    "inputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "name": "messages",
    "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "string", "name": "_msg", "type": "string" }],
    "name": "sayHello",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// Turns Privy's embedded wallet into a signer Alchemy's Wallet APIs can use
function usePrivySigner() {
  const { wallets: [wallet] } = useWallets();
  const [signer, setSigner] = useState<any>();
  useEffect(() => {
    if (!wallet || signer) return;
    toViemAccount({ wallet }).then(setSigner);
  }, [wallet, signer]);
  return signer;
}

function App() {
  const { ready, authenticated, login, logout } = usePrivy();
  const signer = usePrivySigner();
  const [sending, setSending] = useState(false);

  const client = useMemo(() => {
    if (!signer) return null;
    return createSmartWalletClient({
      signer,
      transport: alchemyWalletTransport({ apiKey: import.meta.env.VITE_ALCHEMY_API_KEY }),
      chain: sepolia,
      paymaster: { policyId: "7744f36c-1734-4b3e-b50c-b6b3fa445546" },
    });
  }, [signer]);

  const handleSayHello = async () => {
    if (!client) return;
    setSending(true);
    try {
      const { id } = await client.sendCalls({
        calls: [{
          to: contractAddress,
          data: encodeFunctionData({
            abi: contractAbi,
            functionName: "sayHello",
            args: ["Hello from my gasless app!"],
          }),
        }],
      });
      await client.waitForCallsStatus({ id });
    } finally {
      setSending(false);
    }
  };

  if (!ready) return <p>Loading...</p>;

  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      {authenticated ? (
        <>
          <p>Logged in! {signer ? `Wallet: ${signer.address}` : "Setting up wallet..."}</p>
          <button onClick={handleSayHello} disabled={sending || !client}>
            {sending ? "Sending..." : "Say Hello On-Chain (Free!)"}
          </button>
          <br /><br />
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <button onClick={() => login()}>Connect / Sign In</button>
      )}
    </div>
  );
}

export default App;