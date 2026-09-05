import { usePrivy, useWallets, toViemAccount } from '@privy-io/react-auth';
import { createSmartWalletClient, alchemyWalletTransport } from '@alchemy/wallet-apis';
import { sepolia } from 'viem/chains';
import { encodeFunctionData } from 'viem';
import { useEffect, useMemo, useState } from 'react';
import './App.css';
import logoImg from './assets/0.png';
import phoneImg from './assets/1.png';
import phoneImg2 from './assets/2.png';

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
    <div className="page">
      <div className="left-column">
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
          <div className="welcome">
            <div className="icon-badge">
              <img src={logoImg} alt="" />
            </div>
            <h1>Interact With Live Smart Contract</h1>
            <p>Every transaction is sponsored behind the scenes.</p>
            <button style={{ fontSize: '16px', fontWeight: 'bold', padding: '5px 50px', borderRadius: '100px', color: 'var(--text-h)', background: 'var(--accent)', transition: 'border-color 0.3s' }} onClick={() => login()}>
              Sign In
            </button>
          </div>
        )}
      </div>

      <div className="right-column">
        <img src={phoneImg} alt="" className="phone-image1" />
        <img src={phoneImg2} alt="" className="phone-image2" />
      </div>
    </div>
  );
}

export default App;