# Smart Contract Deployment Guide

## Step 1: Deploy the Move Contract

### Prerequisites
- Sui CLI installed and configured
- Testnet SUI tokens for gas fees
- Move compiler (included with Sui CLI)

### Deployment Commands

```bash
# 1. Build the Move contract
sui move build

# 2. Publish to Sui testnet
sui client publish --gas-budget 100000000

# 3. Note the Package ID from the output
# Look for: "Published package: 0x..."
```

### Expected Output
After successful deployment, you'll see:
```
Published package: 0x1234567890abcdef...
Created Objects:
- AuthRegistry: 0xabcdef1234567890...
- AdminCap: 0x9876543210fedcba...
```

## Step 2: Update Environment Configuration

### Update .env file
```env
# Replace with your actual package ID
VITE_PACKAGE_ID=0x1234567890abcdef...

# Replace with the AuthRegistry object ID
VITE_REGISTRY_OBJECT_ID=0xabcdef1234567890...
```

## Step 3: Verify Deployment

### Check Package on Sui Explorer
1. Go to [Sui Testnet Explorer](https://suiexplorer.com/?network=testnet)
2. Search for your Package ID
3. Verify the modules are deployed correctly

### Test Contract Functions
```bash
# Test user registration (replace with actual IDs)
sui client call \
  --package 0x1234567890abcdef... \
  --module auth \
  --function register_user \
  --args 0xabcdef1234567890... "google" "test@example.com" "Test User" "https://example.com/avatar.jpg" 0x6 \
  --gas-budget 10000000
```

## Step 4: Frontend Integration

### Automatic Detection
The frontend will automatically:
1. Detect the configured Package ID
2. Switch from mock to real contract calls
3. Use actual blockchain transactions

### Manual Verification
1. Start the development server: `npm run dev`
2. Check browser console for "Using real smart contract" messages
3. Test user registration and authentication
4. Verify transactions on Sui Explorer

## Troubleshooting

### Common Issues

#### 1. "Package ID not configured" Error
- Ensure `VITE_PACKAGE_ID` is set in `.env`
- Restart the development server after updating `.env`

#### 2. "Object not found" Error
- Verify the `VITE_REGISTRY_OBJECT_ID` is correct
- Check if the AuthRegistry object exists on-chain

#### 3. Transaction Failures
- Ensure sufficient SUI balance for gas fees
- Check gas budget (increase if needed)
- Verify function arguments are correct

#### 4. Network Connection Issues
- Try different RPC endpoints (configured in `suiClient.ts`)
- Check Sui network status

### Getting Help

#### Sui CLI Commands
```bash
# Check your address and balance
sui client active-address
sui client gas

# View object details
sui client object <OBJECT_ID>

# Check transaction status
sui client tx-block <TRANSACTION_DIGEST>
```

#### Useful Resources
- [Sui Documentation](https://docs.sui.io/)
- [Sui Discord](https://discord.gg/sui)
- [Sui Testnet Explorer](https://suiexplorer.com/?network=testnet)

## Next Steps

After successful deployment:
1. ✅ Contract deployed and Package ID configured
2. ✅ Frontend connected to real blockchain
3. ✅ User registration working on-chain
4. ✅ Authentication sessions stored on-chain
5. ✅ Events and profiles queryable from blockchain

Your zkLogin application is now fully integrated with the Sui blockchain using real Move smart contracts!
