# Move VM ZkLogin Authentication Application

A comprehensive authentication system that combines zkLogin (Zero-Knowledge Login) with Move smart contracts on the Sui blockchain. This application demonstrates how to build secure, privacy-preserving authentication using Move programming language and the Sui Move VM.

## 🚀 Features

### Core Authentication
- **zkLogin Integration**: Privacy-preserving OAuth authentication using zero-knowledge proofs
- **Move Smart Contracts**: On-chain user registry and authentication logic written in Move
- **Multi-Provider Support**: Google, Facebook, and Apple OAuth integration
- **Session Management**: Secure session handling with expiration and validation

### Move VM Integration
- **On-Chain User Registry**: User profiles stored securely on Sui blockchain
- **Move-based Validation**: Authentication logic implemented in Move smart contracts
- **Resource Safety**: Leverages Move's resource-oriented programming model
- **Formal Verification**: Benefits from Move's formal verification capabilities

### Security Features
- **Zero-Knowledge Proofs**: User identity remains private while proving authentication
- **Ephemeral Keypairs**: Temporary keys for enhanced security
- **Nonce-based Authentication**: Prevents replay attacks
- **On-Chain Verification**: All authentication verified through Move contracts

## 🏗️ Architecture

### Frontend (TypeScript/React)
- **React Application**: Modern UI built with React and TypeScript
- **Sui SDK Integration**: Direct interaction with Sui blockchain
- **zkLogin Utils**: Custom utilities for zkLogin proof generation
- **JWT Handling**: Browser-compatible JWT decoding and validation

### Smart Contracts (Move)
- **Authentication Module** (`zklogin_auth::auth`): Core authentication logic
- **Utilities Module** (`zklogin_auth::utils`): Helper functions for zkLogin
- **User Registry**: On-chain storage of user profiles and sessions
- **Event System**: Comprehensive event logging for authentication actions

### Blockchain Integration
- **Sui Testnet**: Deployed on Sui testnet for testing
- **Move VM**: Leverages Sui's Move virtual machine
- **Transaction Handling**: Secure transaction signing and execution
- **Event Monitoring**: Real-time monitoring of on-chain events

## 🛠️ Technology Stack

### Frontend
- **React 18**: Modern React with hooks and functional components
- **TypeScript**: Full type safety throughout the application
- **Vite**: Fast development server and build tool
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Beautiful icon library

### Blockchain
- **Sui Blockchain**: Layer 1 blockchain with Move smart contracts
- **Move Language**: Resource-oriented programming language
- **Sui SDK**: Official TypeScript SDK for Sui interaction
- **zkLogin**: Sui's zero-knowledge authentication system

### Development Tools
- **Move CLI**: Move compiler and testing tools
- **Sui CLI**: Sui network interaction tools
- **ESLint**: Code linting and formatting
- **TypeScript Compiler**: Type checking and compilation

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- Sui CLI installed and configured
- Move compiler (included with Sui CLI)

### Frontend Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Move Smart Contract Setup
```bash
# Build Move contracts
npm run move:build

# Run Move tests
npm run move:test

# Publish to Sui testnet
npm run move:publish
```

### Environment Configuration
Create a `.env` file with:
```env
VITE_SUI_NETWORK=testnet
VITE_PACKAGE_ID=0x... # Set after publishing Move contracts
```

## 🔧 Move Smart Contract Details

### Core Modules

#### `zklogin_auth::auth`
- **User Registration**: Register new users with zkLogin authentication
- **Authentication**: Validate zkLogin proofs and create sessions
- **Profile Management**: Update user profiles and manage account status
- **Admin Functions**: Administrative controls for user management

#### `zklogin_auth::utils`
- **Address Generation**: Generate zkLogin addresses from JWT and salt
- **Proof Verification**: Validate zkLogin proofs (simplified for demo)
- **JWT Utilities**: Helper functions for JWT processing
- **Cryptographic Functions**: Hash functions and address derivation

### Key Structs

```move
struct UserProfile has key, store {
    id: UID,
    zklogin_address: address,
    provider: String,
    email: String,
    name: String,
    created_at: u64,
    last_login: u64,
    login_count: u64,
    is_active: bool,
}

struct AuthSession has key {
    id: UID,
    user_address: address,
    provider: String,
    created_at: u64,
    expires_at: u64,
    nonce: String,
    is_valid: bool,
}
```

## 🧪 Testing

### Move Contract Tests
```bash
# Run all Move tests
sui move test

# Run specific test
sui move test --filter test_user_registration
```

### Frontend Tests
```bash
# Run frontend tests (when implemented)
npm test
```

## 🚀 Deployment

### Move Contract Deployment
1. Build contracts: `sui move build`
2. Publish to testnet: `sui client publish --gas-budget 100000000`
3. Update `VITE_PACKAGE_ID` in environment variables
4. Update frontend configuration with deployed package ID

### Frontend Deployment
1. Build application: `npm run build`
2. Deploy `dist/` folder to your hosting provider
3. Configure environment variables for production

## 🔐 Security Considerations

### zkLogin Security
- **Private Key Management**: Ephemeral keys are generated client-side
- **Proof Generation**: zkLogin proofs generated using official Sui SDK
- **JWT Validation**: Comprehensive JWT structure and signature validation
- **Nonce Protection**: Unique nonces prevent replay attacks

### Move Contract Security
- **Resource Safety**: Move's resource model prevents double-spending
- **Access Control**: Admin capabilities and user authorization checks
- **Input Validation**: Comprehensive validation of all inputs
- **Event Logging**: All actions logged for audit trails

### Best Practices
- **Never expose private keys**: All key management done client-side
- **Validate all inputs**: Both frontend and Move contract validation
- **Use secure randomness**: Cryptographically secure random generation
- **Monitor events**: Track all authentication events for security

## 📚 Learning Resources

### Move Programming
- [Move Language Book](https://move-language.github.io/move/)
- [Sui Move Documentation](https://docs.sui.io/concepts/sui-move-concepts)
- [Move Examples](https://github.com/MystenLabs/sui/tree/main/sui_programmability/examples)

### zkLogin
- [Sui zkLogin Documentation](https://docs.sui.io/concepts/cryptography/zklogin)
- [zkLogin Integration Guide](https://docs.sui.io/guides/developer/cryptography/zklogin-integration)

### Sui Development
- [Sui Developer Documentation](https://docs.sui.io/)
- [Sui TypeScript SDK](https://github.com/MystenLabs/sui/tree/main/sdk/typescript)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Sui Foundation**: For the amazing Sui blockchain and Move language
- **Mysten Labs**: For the comprehensive Sui SDK and zkLogin implementation
- **Move Community**: For the excellent Move programming resources and examples

---

**Built with ❤️ using Move VM and zkLogin on Sui**
