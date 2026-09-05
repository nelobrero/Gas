# GAZ

### Web3, minus the gas.

GAZ is a gasless dApp demo built on Ethereum's Sepolia testnet. Sign in with just your email — no wallet, no seed phrases, no crypto required — and write directly to a live smart contract. Every transaction is sponsored behind the scenes, so users get the full Web3 experience with none of the friction.

---

## What it does

1. A user logs in with their **email** (no MetaMask, no browser extension required)
2. Behind the scenes, an **embedded wallet** is automatically created for them
3. They click **"Say Hello On-Chain (Free!)"**
4. Their message is permanently written to a smart contract on the Sepolia blockchain
5. **They never pay a cent in gas** — the fee is automatically sponsored

---

## Why this matters

The single biggest barrier to normal people using Web3 apps is onboarding: installing a wallet, understanding seed phrases, and buying crypto just to pay transaction fees before ever experiencing the product. GAZ demonstrates the "invisible plumbing" that solves this — the same pattern real products (games, loyalty programs, social apps) use to onboard users who've never touched crypto before.

---

## How it works

```
User clicks "Save" / "Say Hello"
        │
        ▼
  React App (Vite + TypeScript)
        │
        ▼
  Privy (email login → embedded wallet, free signature)
        │
        ▼
  Alchemy Wallet APIs (smart account + transaction relay)
        │
        ▼
  Alchemy Gas Manager (Paymaster — pays the gas fee)
        │
        ▼
  Sepolia Blockchain (transaction confirmed, permanently recorded)
```

---

## Tech stack

- **Frontend:** React, Vite, TypeScript, Tailwind CSS
- **Smart contract:** Solidity (`HelloOnChain.sol`), deployed via Remix
- **Wallets & signing:** [Privy](https://privy.io) — email login with automatic embedded wallet creation
- **Blockchain infra & sponsorship:** [Alchemy](https://alchemy.com) — Wallet APIs (ERC-4337 account abstraction) + Gas Manager (Paymaster)
- **Network:** Ethereum Sepolia (testnet)

---

## Smart contract

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract HelloOnChain {
    mapping(address => string) public messages;

    function sayHello(string memory _msg) public {
        messages[msg.sender] = _msg;
    }
}
```

A minimal contract that stores one message per wallet address. Simple by design — the point of this project is the *gasless onboarding flow* around it, not contract complexity.

**Deployed contract (Sepolia):** `0x7FFF79EebC1a8ee57E1B9EC905B9c53B81523dbe`

---

## Getting started

### Prerequisites
- Node.js
- A free [Alchemy](https://alchemy.com) account (API key + a Gas Manager policy)
- A free [Privy](https://privy.io) account (App ID)

### Setup

```bash
git clone https://github.com/your-username/gaz.git
cd gaz
npm install
```

Create a `.env` file in the root:

```
VITE_ALCHEMY_API_KEY=your_alchemy_api_key
```

Add your Privy App ID and Alchemy Gas Manager Policy ID in `src/main.tsx` and `src/App.tsx` respectively.

```bash
npm run dev
```

---

## A note on the build process

This project originally used Alchemy's **Account Kit** for embedded login and smart accounts. Partway through development, it became clear that `@account-kit/react`'s UI components are deprecated in favor of Alchemy's newer **Wallet APIs**, paired with **Privy** as the recommended signer. The project was migrated mid-build to the currently supported stack — the contract and Gas Manager policy required no changes, only the login/signer layer was swapped out.

---

## License

MIT
