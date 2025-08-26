# TON Games

Fair blockchain gaming platform built on The Open Network (TON). Players participate in transparent rounds with guaranteed minimum payouts and verifiable fairness.

## Features

- **Fair Gaming**: Provably fair distribution using blockchain randomness
- **Guaranteed Payouts**: Minimum 50% return of stake (after platform fee)
- **Full Transparency**: All game mechanics are verifiable on-chain
- **Referral System**: Earn 2% from friends' games through platform fee sharing
- **Mobile-First**: Optimized for Telegram Mini Apps
- **Multi-Language**: Support for Russian and English

## How It Works

### Game Mechanics

1. **Round Creation**: Any user can create a new game round with custom stake amount
2. **Participation**: Players join by sending the exact stake amount to the smart contract
3. **Round Completion**: Rounds end either by time limit or participant limit
4. **Fair Distribution**: Random distribution based on verifiable blockchain data
5. **Instant Payouts**: Winners can withdraw immediately after distribution

### Fairness Guarantee

- **Minimum Payout**: Every participant receives at least 50% of their stake back
- **Platform Fee**: 5% fee is taken from the total pool before distribution
- **Provable Fairness**: Uses commit-reveal scheme with blockchain randomness
- **Transparent Algorithm**: All calculations are open source and verifiable

### Referral System

- **2% Commission**: Referrers earn 2% of platform fees from invited users
- **One-Time Setup**: Referral relationship is set permanently on first participation
- **Lifetime Earnings**: Earn from all future games of referred users

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- TON wallet (Tonkeeper, MyTonWallet, etc.)
- Testnet TON for development

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/ton-games.git
   cd ton-games
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   VITE_CONTRACT_ADDRESS=EQD_your_contract_address_here
   VITE_NETWORK=testnet
   VITE_TON_CONNECT_MANIFEST_URL=https://your-domain.com/tonconnect-manifest.json
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   - Navigate to `http://localhost:5173`
   - Connect your TON wallet
   - Switch to testnet if needed

### TON Connect Setup

1. **Create manifest file** at `public/tonconnect-manifest.json`:
   ```json
   {
     "url": "https://your-domain.com",
     "name": "TON Games",
     "iconUrl": "https://your-domain.com/icon.png",
     "termsOfUseUrl": "https://your-domain.com/terms",
     "privacyPolicyUrl": "https://your-domain.com/privacy"
   }
   ```

2. **Deploy contract** to TON testnet/mainnet
3. **Update contract address** in environment variables

## Usage Guide

### Creating a Game

1. Navigate to "Create" tab
2. Choose game mode:
   - **Time Locked**: Ends at specific time
   - **Capacity Locked**: Ends when target participants reached
3. Set stake amount (0.1 - 10,000 TON)
4. Configure end condition (time or participant count)
5. Review and create (requires stake amount + gas fees)

### Joining a Game

1. Browse active games on "Games" tab
2. Review game details:
   - Stake amount
   - Current participants
   - End condition
   - Payout range
3. Click "Join" and confirm transaction
4. Wait for round completion

### Verifying Fairness

1. Go to "History" tab after round completion
2. Click on completed round
3. Click "Verify Fairness" button
4. System will:
   - Regenerate random values using same seed + block hash
   - Recalculate distribution using same algorithm
   - Compare with actual on-chain payouts
   - Show detailed verification results

### Using Referrals

1. Go to "Profile" tab
2. Copy your referral link
3. Share with friends
4. Friends must use your link on first visit
5. Earn 2% of platform fees from their games

## Smart Contract Integration

### Contract Methods

- `createRound(mode, deadline/target)`: Create new game round
- `joinRound(roundId)`: Join existing round with exact stake
- `lockRound(roundId)`: Lock round when conditions met
- `revealSeed(roundId, seed)`: Reveal seed and trigger distribution
- `withdraw(roundId)`: Withdraw winnings
- `refund(roundId)`: Get refund if round fails
- `setReferrer(address)`: Set referrer (one-time only)

### Gas Fees

- Round creation: ~0.05 TON
- Joining round: ~0.02 TON
- Withdrawal: ~0.02 TON
- Distribution: ~0.1 TON (paid by round creator)

## Development

### Project Structure

```
src/
├── lib/
│   ├── tonConnect.ts      # TON Connect integration
│   ├── ton.ts            # Smart contract calls
│   ├── random.ts         # Fairness proof logic
│   └── ton-format.ts     # TON amount utilities
├── components/
│   ├── GameRound.tsx     # Game round card
│   ├── FairnessVerification.tsx  # Proof verification
│   ├── ReferralSystem.tsx        # Referral management
│   └── ui/               # Reusable UI components
├── config.ts             # App configuration
├── i18n.ts              # Internationalization
└── types/               # TypeScript definitions
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage

# Type checking
npm run typecheck
```

### Linting and Formatting

```bash
# Check code style
npm run lint

# Fix auto-fixable issues
npm run lint:fix
```

### Building for Production

```bash
# Build optimized bundle
npm run build

# Preview production build
npm run preview
```

## API Reference

### TON Connect Integration

```typescript
// Connect wallet
await connectWallet()

// Get wallet info
const wallet = getWalletInfo()

// Send transaction
const result = await sendTransaction({
  to: contractAddress,
  value: amount,
  data: callData
})
```

### Smart Contract Calls

```typescript
// Create round
const result = await createRound({
  mode: RoundMode.TIME_LOCKED,
  stakeNanoton: tonToNanoton(1),
  deadline: timestamp
})

// Join round
await joinRound(roundId, referrerAddress)

// Verify fairness
const verification = verifyFairnessProof(
  seed, blockHash, participants, stakes, payouts, feeBps
)
```

### Fairness Verification

```typescript
// Generate random values (same as contract)
const randomValues = generateRandomValues(seed, blockHash, addresses)

// Calculate distribution
const { payouts } = calculatePayoutDistribution(stakes, randomValues, feeBps)

// Verify results match on-chain data
const isValid = payouts.every((payout, i) => payout === actualPayouts[i])
```

## Troubleshooting

### Common Issues

1. **Wallet Connection Failed**
   - Ensure wallet supports TON Connect
   - Check network compatibility (testnet/mainnet)
   - Clear browser cache and retry

2. **Transaction Failed**
   - Verify sufficient balance for stake + gas fees
   - Check contract address in environment
   - Ensure round is still open for joining

3. **Fairness Verification Failed**
   - Check if round is fully distributed
   - Verify seed and block hash are revealed
   - Report if verification consistently fails

4. **Network Issues**
   - Switch wallet to correct network (testnet for development)
   - Wait for blockchain confirmation
   - Check TON Center API status

### Debug Mode

Enable debug logging by setting `VITE_DEBUG=true` in `.env`:

```env
VITE_DEBUG=true
```

This will log additional information to browser console.

## Security Considerations

### For Users

- **Never share private keys**: TON Connect doesn't require private key export
- **Verify contracts**: Always check contract address before transactions  
- **Start small**: Test with small amounts on testnet first
- **Understand risks**: Gambling involves risk of loss

### For Developers

- **Audit contracts**: Have smart contracts professionally audited
- **Validate inputs**: All user inputs must be validated client and server side
- **Rate limiting**: Implement appropriate rate limits for contract calls
- **Error handling**: Gracefully handle all error conditions

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Development Guidelines

- Follow TypeScript strict mode
- Write tests for new features
- Update documentation
- Ensure mobile compatibility
- Test on both testnet and mainnet

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- **Documentation**: Check this README and code comments
- **Issues**: Report bugs on GitHub Issues
- **Community**: Join our Telegram group
- **Email**: Contact team@ton-games.com

## Roadmap

- [ ] Advanced game modes (multiplayer tournaments)
- [ ] NFT integration for special rounds
- [ ] Cross-chain compatibility
- [ ] Advanced analytics dashboard
- [ ] Mobile app (iOS/Android)
- [ ] Governance token for platform decisions

---

**Disclaimer**: This platform involves financial risk. Users should only participate with funds they can afford to lose. The platform is provided "as is" without warranty of any kind.