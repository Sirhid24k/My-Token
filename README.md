# MyToken DApp - Decentralized Token Sale Platform

🪙 **MyToken (MYT)** is a modern decentralized application (DApp) built on Ethereum that provides a seamless token sale experience with optimized wallet connection and user interface.

## ✨ Features

### 🔗 Enhanced Wallet Connection
- **Multi-wallet Support**: Compatible with MetaMask, Trust Wallet, and other Web3 wallets
- **Auto-reconnection**: Automatically connects to previously used wallets
- **Connection Timeout**: Prevents hanging connections with configurable timeout
- **Network Detection**: Displays current network and supports multiple networks
- **Real-time Updates**: Instant updates when switching accounts or networks

### 🛒 Token Trading
- **Buy Tokens**: Purchase MYT tokens with ETH
- **Real-time Pricing**: Live token price display
- **Gas Estimation**: Automatic gas estimation for transactions
- **Transaction Tracking**: Real-time transaction status with hash display
- **Balance Updates**: Instant balance updates after transactions

### 🏦 Owner Controls
- **ETH Withdrawal**: Contract owners can withdraw accumulated ETH
- **Permission System**: Role-based access control
- **Contract Balance**: View contract ETH and token balances

### 🎨 Modern UI/UX
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Loading Indicators**: Smooth loading animations and progress feedback
- **Error Handling**: User-friendly error messages with actionable solutions
- **Visual Feedback**: Status indicators and transaction confirmations
- **Accessibility**: Semantic HTML and keyboard navigation support

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v14 or higher)
- **npm** or **yarn**
- **Hardhat** for development and deployment
- **MetaMask** or compatible Web3 wallet

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd My-Token
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Compile contracts**
   ```bash
   npx hardhat compile
   ```

### Development Setup

1. **Start local blockchain**
   ```bash
   npx hardhat node
   ```

2. **Deploy contracts**
   ```bash
   npx hardhat run scripts/deploy.js --network localhost
   ```

3. **Update contract addresses**
   - Open `my-dapp/script.js`
   - Update `CONFIG.MY_TOKEN_ADDRESS` and `CONFIG.TOKEN_SALE_ADDRESS`

4. **Start local server**
   ```bash
   cd my-dapp
   python -m http.server 8000
   # or
   npx serve .
   ```

5. **Open in browser**
   ```
   http://localhost:8000
   ```

## 🛠️ Configuration

### Contract Addresses
Update the contract addresses in `my-dapp/script.js`:

```javascript
const CONFIG = {
  MY_TOKEN_ADDRESS: 'YOUR_TOKEN_CONTRACT_ADDRESS',
  TOKEN_SALE_ADDRESS: 'YOUR_SALE_CONTRACT_ADDRESS',
  // ... other configuration
};
```

### Network Configuration
The DApp supports multiple networks:

- **Mainnet** (Chain ID: 1)
- **Goerli Testnet** (Chain ID: 5)
- **Sepolia Testnet** (Chain ID: 11155111)
- **Localhost** (Chain ID: 1337)
- **Hardhat Network** (Chain ID: 31337)

## 📱 Using the DApp

### 1. Connect Your Wallet
1. Click "Connect Wallet" button
2. Select your preferred wallet (MetaMask recommended)
3. Approve the connection request
4. Confirm you're on the correct network

### 2. Buy Tokens
1. Ensure wallet is connected
2. Enter ETH amount in the "Buy MYT Tokens" section
3. Click "Buy MYT Tokens"
4. Confirm transaction in your wallet
5. Wait for confirmation (progress shown in real-time)

### 3. View Balances
- **ETH Balance**: Your current ETH balance
- **MYT Balance**: Your MyToken balance
- **Contract Balance**: Available tokens for sale

### 4. Withdraw ETH (Owner Only)
1. Connect with the contract owner account
2. Enter ETH amount to withdraw
3. Click "Withdraw ETH"
4. Confirm transaction

## 🔧 Technical Details

### Smart Contracts

#### MyToken.sol
- **Standard**: ERC-20 compliant token
- **Symbol**: MYT
- **Decimals**: 18
- **Supply**: 1,000,000 MYT
- **Features**: Standard transfer, approval functions

#### TokenSale.sol
- **Functionality**: Token sale mechanism
- **Price**: Configurable price in Wei
- **Owner Controls**: ETH withdrawal
- **Events**: Purchase and withdrawal tracking

### Frontend Architecture

#### Technologies Used
- **HTML5**: Semantic markup
- **CSS3**: Modern styling with animations
- **JavaScript (ES6+)**: Application logic
- **Ethers.js**: Ethereum interaction
- **Web3 Provider**: Wallet integration

#### Key Components

1. **AppState Class**: Centralized state management
2. **DOM Cache**: Efficient element references
3. **Event Listeners**: User interaction handling
4. **Error Handling**: Comprehensive error management
5. **Loading States**: User feedback during operations

## 🚨 Troubleshooting

### Common Issues

#### Wallet Connection Issues
- **Problem**: "No wallet found" error
- **Solution**: Install MetaMask or compatible wallet
- **Prevention**: Check wallet availability before connecting

#### Transaction Failures
- **Problem**: "Insufficient funds" error
- **Solution**: Ensure sufficient ETH for gas fees
- **Prevention**: Display gas estimates before transactions

#### Network Issues
- **Problem**: "Unsupported network" warning
- **Solution**: Switch to supported network in wallet
- **Prevention**: Add network detection and switching prompts

#### Contract Interaction Issues
- **Problem**: "Contract not found" error
- **Solution**: Verify contract addresses and deployment
- **Prevention**: Test contract connectivity during initialization

### Debug Mode

Enable debug logging by opening browser console:
```javascript
// Check application state
console.log(appState);

// Check contract instances
console.log(appState.myTokenContract);
console.log(appState.tokenSaleContract);

// Monitor events
window.ethereum.on('debug', console.log);
```

## 🔒 Security Considerations

### Smart Contract Security
- **Access Control**: Owner-only functions protected
- **Input Validation**: All inputs validated
- **Reentrancy Protection**: Safe withdrawal patterns
- **Integer Overflow**: Using SafeMath principles

### Frontend Security
- **XSS Prevention**: All user inputs sanitized
- **CSRF Protection**: State validation
- **Wallet Security**: Secure connection handling
- **Error Information**: Limited error exposure

## 📊 Performance Optimizations

### Wallet Connection
- **Connection Pooling**: Reuse existing connections
- **Timeout Handling**: Prevent hanging connections
- **Event Cleanup**: Remove old event listeners
- **State Persistence**: Remember connection preferences

### UI/UX Improvements
- **Loading States**: Visual feedback for all operations
- **Error Recovery**: Graceful error handling and recovery
- **Input Validation**: Real-time validation feedback
- **Responsive Design**: Optimized for all screen sizes

### Transaction Optimization
- **Gas Estimation**: Automatic gas calculation with buffer
- **Transaction Queuing**: Handle multiple transactions
- **Confirmation Tracking**: Real-time status updates
- **Error Categorization**: Specific error messages

## 🚀 Deployment

### Local Deployment
1. Follow the development setup steps above
2. Test thoroughly on local network
3. Deploy to testnet for final testing

### Testnet Deployment
1. Configure testnet in Hardhat config
2. Deploy contracts to testnet
3. Update frontend configuration
4. Test with testnet ETH

### Mainnet Deployment
1. Security audit recommended
2. Deploy contracts to mainnet
3. Update production configuration
4. Monitor for issues

## 📈 Future Enhancements

- **Multi-token Support**: Support for multiple token types
- **Staking Mechanism**: Token staking for rewards
- **Governance Features**: DAO voting capabilities
- **Layer 2 Integration**: Support for L2 networks
- **Mobile App**: Native mobile application
- **Advanced Analytics**: Trading charts and statistics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenZeppelin**: Smart contract libraries
- **Ethereum Foundation**: Blockchain platform
- **Hardhat Team**: Development framework
- **Ethers.js Team**: Web3 library
- **MetaMask Team**: Wallet integration

---

**Built with ❤️ using Ethereum & Hardhat**

For support or questions, please open an issue on GitHub.
