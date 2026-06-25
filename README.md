# ⚡ NostrPay Store

A decentralized, single-page storefront that accepts **real** payments in two currencies:

- **Bitcoin / Lightning** — genuine BOLT11 invoices via [LNURL-pay](https://github.com/lnurl/luds) (LUD-16 Lightning Address + LUD-21 verify)
- **Ethereum** — real on-chain transactions through the buyer's browser wallet (MetaMask, Rabby, Coinbase Wallet, etc.)

No backend, no KYC, no custodians. It's one static `index.html` file you can host anywhere.

🔗 **Live:** https://ethpay-nostr.netlify.app

---

## How payments work

### ⚡ Lightning (Sats)

1. Buyer picks an item and clicks **Generate Lightning Invoice**.
2. The page resolves the Lightning Address (`erna@getalby.com`) via its LNURL-pay endpoint and requests a real invoice for the item's exact sats amount.
3. A scannable **QR code** + copyable BOLT11 string + "Open in wallet" link are shown.
4. The page polls the provider's LUD-21 `verify` URL and only shows **Payment Confirmed** once the invoice is actually **settled**. Invoices time out after ~5 minutes.

All client-side — no server required.

### ⟠ Ethereum

1. Buyer clicks **Connect Wallet & Pay**.
2. The page connects the injected wallet and runs a **network guardrail** (see below).
3. It sends an on-chain transaction of the item's exact ETH amount to the store address.
4. The real transaction hash is shown with a block-explorer link, and the page polls for the receipt — **Payment Confirmed** appears only after the tx is mined (and an error is shown if it reverts or is rejected).

---

## Network guardrail

To stop buyers from paying on the wrong chain, the store enforces a single active network before sending any ETH:

- If the wallet is on the wrong network, it prompts a switch (`wallet_switchEthereumChain`).
- If the wallet doesn't have the network yet, it **auto-adds** it (`wallet_addEthereumChain`) with the correct RPC + explorer details, then switches.
- The transaction is only sent after the chain is confirmed correct.

### Changing the active network

It's a **one-line change** in `index.html`:

```js
const REQUIRED_CHAIN = '0xaa36a7';   // current: Sepolia testnet
```

| Network          | chainId    |
| ---------------- | ---------- |
| Ethereum mainnet | `0x1`      |
| Base             | `0x2105`   |
| Sepolia testnet  | `0xaa36a7` |

Update `REQUIRED_NAME` to match. Mainnet, Base, and Sepolia all have add-chain support built in.

> **Currently set to Sepolia testnet** — uses test ETH (no real money). Get test funds from a [Sepolia faucet](https://sepoliafaucet.com/). Switch `REQUIRED_CHAIN` to `0x1` or `0x2105` to accept real value.

---

## Configuration

All settings live near the top of the `<script>` block in `index.html`:

| Constant         | Purpose                                 |
| ---------------- | --------------------------------------- |
| `LN`             | Lightning Address that receives sats    |
| `ETH_ADDR`       | Ethereum address that receives payments |
| `REQUIRED_CHAIN` | Active EVM network (chainId hex)        |
| `REQUIRED_NAME`  | Display name for the active network     |

Item names, prices (sats / ETH / USD), and icons are defined inline in the product card markup.

---

## Project structure

```
.
├── index.html   # Entire app: markup, styles, and payment logic
└── README.md
```

Dependencies are loaded from CDN at runtime:

- [qrcodejs](https://github.com/davidshimjs/qrcodejs) — renders the Lightning invoice QR
- Google Fonts (Space Grotesk, Space Mono)

No build step, no `npm install`.

---

## Local development

It's a static file — open it directly:

```bash
open index.html
```

Or serve it (recommended, so wallet/clipboard APIs behave like production):

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

> Lightning works in any browser. Ethereum payments need a wallet that injects `window.ethereum` (e.g. MetaMask).

---

## Deployment (Netlify)

The site is linked to this repo for continuous deployment, so:

```bash
git add index.html
git commit -m "Update store"
git push
```

Netlify auto-builds and publishes within ~1 minute. (Alternatively, drag the project folder onto the Netlify **Deploys** page for a manual deploy.)

---

## Tech notes

- Lightning invoices are uppercased before QR encoding so the QR uses the efficient alphanumeric mode (smaller, faster to scan); error-correction level `L` keeps long invoices readable.
- ETH amounts are converted to wei with `BigInt` to avoid floating-point rounding.
- Payment confirmation is verified against the network/provider — the UI never claims success without it.

---

## License

Released for personal/educational use. No warranty. Use real-money networks at your own risk and test thoroughly on Sepolia first.

Built with ⚡ on Nostr · No KYC · No Custodians
