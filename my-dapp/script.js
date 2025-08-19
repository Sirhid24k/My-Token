// === MyToken DApp - Web3Modal Version ===
// Enhanced wallet connection with Web3Modal for multi-wallet support

// --- Configuration ---
const CONFIG = {
  // Contract Addresses - Update these with your deployed contract addresses
  MY_TOKEN_ADDRESS: '0x0D57F96d8d9bDeE635DA05D46bafa39ea64a85b0',
  TOKEN_SALE_ADDRESS: '0xB0C28560DAC0f33E1f3C4a4BDBA54a9B5F0d9dD5',
  
  // WalletConnect Project ID - Get your own at https://cloud.walletconnect.com
  WALLETCONNECT_PROJECT_ID: 'YOUR_PROJECT_ID_HERE',
  
  // Network Configuration
  SUPPORTED_NETWORKS: {
    1: 'Ethereum Mainnet',
    5: 'Goerli Testnet',
    11155111: 'Sepolia Testnet',
    1337: 'Localhost',
    31337: 'Hardhat Network'
  },
  
  // Default network (change as needed)
  DEFAULT_NETWORK: 31337,
  
  // Wallet connection timeout
  CONNECTION_TIMEOUT: 10000,
  
  // Transaction confirmation blocks
  CONFIRMATION_BLOCKS: 1
};

// --- Enhanced Contract ABIs ---
const MY_TOKEN_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address account) view returns (uint256)',
  'function transfer(address recipient, uint256 amount) returns (bool)',
  'function owner() view returns (address)',
  'event Transfer(address indexed from, address indexed to, uint256 value)'
];

const TOKEN_SALE_ABI = [
  'function myToken() view returns (address)',
  'function tokenPriceInWei() view returns (uint256)',
  'function owner() view returns (address)',
  'function buyTokens() payable',
  'function withdrawEth(uint256 amount)',
  'event TokensPurchased(address buyer, uint256 ethAmount, uint256 tokenAmount)',
  'event EthWithdrawn(address recipient, uint256 amount)'
];

// --- Application State ---
class AppState {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.currentAccount = null;
    this.networkId = null;
    this.myTokenContract = null;
    this.tokenSaleContract = null;
    this.isConnecting = false;
    this.isOwner = false;
  }
  
  reset() {
    this.provider = null;
    this.signer = null;
    this.currentAccount = null;
    this.networkId = null;
    this.myTokenContract = null;
    this.tokenSaleContract = null;
    this.isConnecting = false;
    this.isOwner = false;
  }
}

const appState = new AppState();

// --- DOM Elements Cache ---
const DOM = {
  // Connection elements
  connectStatus: document.getElementById('connectStatus'),
  accountAddress: document.getElementById('accountAddress'),
  ethBalance: document.getElementById('ethBalance'),
  connectWalletBtn: document.getElementById('connectWalletBtn'),
  networkInfo: document.getElementById('networkInfo'),
  
  // Token info elements
  myTokenContractAddress: document.getElementById('myTokenContractAddress'),
  myTokenBalance: document.getElementById('myTokenBalance'),
  tokenSaleMyTBalance: document.getElementById('tokenSaleMyTBalance'),
  
  // Buy tokens elements
  tokenPrice: document.getElementById('tokenPrice'),
  ethAmountToBuyInput: document.getElementById('ethAmountToBuy'),
  buyTokensBtn: document.getElementById('buyTokensBtn'),
  buyMessage: document.getElementById('buyMessage'),
  
  // Withdraw elements
  ethAmountToWithdrawInput: document.getElementById('ethAmountToWithdraw'),
  withdrawEthBtn: document.getElementById('withdrawEthBtn'),
  withdrawMessage: document.getElementById('withdrawMessage'),
  
  // Loading elements
  loadingOverlay: document.getElementById('loadingOverlay'),
  loadingText: document.getElementById('loadingText')
};

// --- Utility Functions ---

// Show loading state
function showLoading(text = 'Loading...') {
  if (DOM.loadingOverlay) {
    DOM.loadingOverlay.style.display = 'flex';
    if (DOM.loadingText) DOM.loadingText.textContent = text;
  }
}

// Hide loading state
function hideLoading() {
  if (DOM.loadingOverlay) {
    DOM.loadingOverlay.style.display = 'none';
  }
}

// Format address for display
function formatAddress(address) {
  if (!address) return 'N/A';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Detect wallet type
function detectWalletType() {
  if (typeof window.ethereum !== 'undefined') {
    if (window.ethereum.isMetaMask) return 'MetaMask';
    if (window.ethereum.isImToken) return 'imToken';
    if (window.ethereum.isTrust) return 'Trust Wallet';
    return 'Unknown Wallet';
  }
  return null;
}

// --- Web3Modal Configuration and Setup ---
let web3Modal;

// Initialize Web3Modal
function initWeb3Modal() {
  try {
    // Check if Web3Modal is available
    if (typeof Web3Modal === 'undefined') {
      console.error('Web3Modal not loaded. Falling back to direct wallet connection.');
      return false;
    }

    // Provider options for multi-wallet support
    const providerOptions = {
      walletconnect: {
        package: WalletConnectProvider,
        options: {
          infuraId: "27e484dcd9e3efcfd25a83a78777cdf1", // Public Infura ID for demo
          rpc: {
            1: "https://mainnet.infura.io/v3/27e484dcd9e3efcfd25a83a78777cdf1",
            5: "https://goerli.infura.io/v3/27e484dcd9e3efcfd25a83a78777cdf1", 
            11155111: "https://sepolia.infura.io/v3/27e484dcd9e3efcfd25a83a78777cdf1",
            1337: "http://localhost:8545",
            31337: "http://localhost:8545"
          },
          chainId: CONFIG.DEFAULT_NETWORK,
          bridge: "https://bridge.walletconnect.org",
          qrcode: true
        }
      }
    };

    // Initialize Web3Modal
    web3Modal = new Web3Modal({
      network: "mainnet",
      cacheProvider: true,
      providerOptions,
      disableInjectedProvider: false,
      theme: {
        background: "rgb(39, 49, 56)",
        main: "rgb(199, 199, 199)",
        secondary: "rgb(136, 136, 136)",
        border: "rgba(195, 195, 195, 0.14)",
        hover: "rgb(16, 26, 32)"
      }
    });

    console.log('Web3Modal initialized successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize Web3Modal:', error);
    return false;
  }
}

// Enhanced Wallet Connection Functions with Web3Modal
async function connectWallet() {
  if (appState.isConnecting) {
    console.log('Connection already in progress');
    return;
  }

  appState.isConnecting = true;
  showLoading('Opening wallet selector...');
  updateConnectionStatus('Connecting...', 'orange');
  updateStatusDot('connecting');
  
  try {
    let provider;
    
    // Try Web3Modal first, fallback to direct connection
    if (web3Modal) {
      try {
        const instance = await web3Modal.connect();
        provider = new ethers.providers.Web3Provider(instance);
        console.log('Connected via Web3Modal');
      } catch (web3ModalError) {
        console.log('Web3Modal connection failed, trying direct connection:', web3ModalError);
        
        // Fallback to direct wallet connection
        if (typeof window.ethereum !== 'undefined') {
          const accounts = await window.ethereum.request({
            method: 'eth_requestAccounts',
          });
          
          if (!accounts || accounts.length === 0) {
            throw new Error('No accounts found');
          }
          
          provider = new ethers.providers.Web3Provider(window.ethereum);
          console.log('Connected via direct wallet connection');
        } else {
          throw new Error('No Web3 provider found');
        }
      }
    } else {
      // Direct wallet connection as fallback
      if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });
        
        if (!accounts || accounts.length === 0) {
          throw new Error('No accounts found');
        }
        
        provider = new ethers.providers.Web3Provider(window.ethereum);
        console.log('Connected via direct wallet connection (Web3Modal not available)');
      } else {
        showWalletNotFoundError();
        return;
      }
    }

    // Initialize provider and signer
    appState.provider = provider;
    appState.signer = provider.getSigner();
    appState.currentAccount = await appState.signer.getAddress();
    
    // Get network information
    const network = await appState.provider.getNetwork();
    appState.networkId = network.chainId;
    
    // Check if network is supported
    if (!CONFIG.SUPPORTED_NETWORKS[appState.networkId]) {
      console.warn(`Unsupported network: ${appState.networkId}`);
    }
    
    // Initialize contracts
    await initializeContracts();
    
    // Set up event listeners
    setupWalletEventListeners();
    
    // Update UI
    updateConnectionStatus('Connected', 'green');
    updateStatusDot('connected');
    updateWalletDisplay();
    
    await updateUI();
    
    const walletType = detectWalletType() || 'Unknown Wallet';
    console.log(`Connected to ${walletType}:`, appState.currentAccount);
    
  } catch (error) {
    console.error('Wallet connection failed:', error);
    handleConnectionError(error);
    appState.reset();
    updateStatusDot('disconnected');
  } finally {
    appState.isConnecting = false;
    hideLoading();
  }
}

// Disconnect wallet function
async function disconnectWallet() {
  try {
    if (web3Modal) {
      await web3Modal.clearCachedProvider();
    }
    
    appState.reset();
    resetUI();
    updateStatusDot('disconnected');
    
    console.log('Wallet disconnected');
  } catch (error) {
    console.error('Error disconnecting wallet:', error);
  }
}

// Initialize contracts
async function initializeContracts() {
  try {
    appState.myTokenContract = new ethers.Contract(
      CONFIG.MY_TOKEN_ADDRESS,
      MY_TOKEN_ABI,
      appState.signer
    );
    
    appState.tokenSaleContract = new ethers.Contract(
      CONFIG.TOKEN_SALE_ADDRESS,
      TOKEN_SALE_ABI,
      appState.signer
    );
    
    // Test contract connectivity
    await appState.myTokenContract.symbol();
    await appState.tokenSaleContract.tokenPriceInWei();
    
    console.log('Contracts initialized successfully');
  } catch (error) {
    console.error('Failed to initialize contracts:', error);
    throw new Error('Contract initialization failed. Please check contract addresses.');
  }
}

// Setup wallet event listeners
function setupWalletEventListeners() {
  if (window.ethereum) {
    window.ethereum.removeAllListeners('accountsChanged');
    window.ethereum.removeAllListeners('chainChanged');
    window.ethereum.removeAllListeners('disconnect');
    
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);
    window.ethereum.on('disconnect', handleDisconnect);
  }
}

// Handle wallet account changes
async function handleAccountsChanged(accounts) {
  console.log('Accounts changed:', accounts);
  
  if (accounts.length === 0) {
    console.log('Wallet disconnected');
    resetUI();
    appState.reset();
  } else if (accounts[0] !== appState.currentAccount) {
    console.log('Account switched from', appState.currentAccount, 'to', accounts[0]);
    
    showLoading('Switching account...');
    
    try {
      appState.currentAccount = accounts[0];
      appState.signer = appState.provider.getSigner();
      
      // Reinitialize contracts with new signer
      await initializeContracts();
      
      updateWalletDisplay();
      await updateUI();
      
    } catch (error) {
      console.error('Error switching account:', error);
      showMessage('Failed to switch account', 'error');
    } finally {
      hideLoading();
    }
  }
}

// Handle network changes
function handleChainChanged(chainId) {
  console.log('Network changed to:', chainId);
  
  const networkId = parseInt(chainId, 16);
  const networkName = CONFIG.SUPPORTED_NETWORKS[networkId] || 'Unknown Network';
  
  console.log(`Switched to ${networkName} (${networkId})`);
  
  // Reload the page to ensure all connections are reset properly
  window.location.reload();
}

// Handle wallet disconnect
function handleDisconnect(error) {
  console.log('Wallet disconnected:', error);
  resetUI();
  appState.reset();
}

// Update connection status display
function updateConnectionStatus(status, color) {
  if (DOM.connectStatus) {
    DOM.connectStatus.textContent = status;
    DOM.connectStatus.style.color = color;
  }
}

// Update wallet display elements
function updateWalletDisplay() {
  if (DOM.accountAddress) {
    DOM.accountAddress.textContent = formatAddress(appState.currentAccount);
    DOM.accountAddress.title = appState.currentAccount; // Show full address on hover
  }
  
  if (DOM.connectWalletBtn) {
    DOM.connectWalletBtn.textContent = 'Connected';
    DOM.connectWalletBtn.disabled = true;
    DOM.connectWalletBtn.classList.add('connected');
  }
  
  if (DOM.networkInfo && appState.networkId) {
    const networkName = CONFIG.SUPPORTED_NETWORKS[appState.networkId] || 'Unknown Network';
    DOM.networkInfo.textContent = `Network: ${networkName}`;
  }
}

// Show wallet not found error
function showWalletNotFoundError() {
  const message = 'No Web3 wallet detected. Please install MetaMask or another Web3 wallet.';
  
  updateConnectionStatus('No Wallet Found', 'red');
  showMessage(message, 'error');
  
  // Show install link if available
  if (confirm(message + '\n\nWould you like to install MetaMask?')) {
    window.open('https://metamask.io/download/', '_blank');
  }
}

// Handle connection errors
function handleConnectionError(error) {
  let message = 'Failed to connect wallet';
  let status = 'Connection Failed';
  
  if (error.message.includes('User rejected')) {
    message = 'Connection cancelled by user';
    status = 'Connection Cancelled';
  } else if (error.message.includes('timeout')) {
    message = 'Connection timed out. Please try again.';
    status = 'Connection Timeout';
  } else if (error.message.includes('No accounts')) {
    message = 'No accounts found. Please unlock your wallet.';
    status = 'No Accounts';
  }
  
  updateConnectionStatus(status, 'red');
  showMessage(message, 'error');
  
  // Reset button state
  if (DOM.connectWalletBtn) {
    DOM.connectWalletBtn.textContent = 'Connect Wallet';
    DOM.connectWalletBtn.disabled = false;
    DOM.connectWalletBtn.classList.remove('connected');
  }
}

// Generic message display function
function showMessage(text, type = 'info', duration = 5000) {
  // You can implement a toast notification system here
  console.log(`[${type.toUpperCase()}] ${text}`);
  
  // For now, use alert for critical errors
  if (type === 'error') {
    alert(text);
  }
}

// --- Enhanced UI Update Functions ---

async function updateUI() {
  if (!appState.provider || !appState.currentAccount) {
    resetUI();
    return;
  }

  try {
    showLoading('Updating balances...');
    
    // Update ETH Balance
    const balanceWei = await appState.provider.getBalance(appState.currentAccount);
    if (DOM.ethBalance) {
      DOM.ethBalance.textContent = `${parseFloat(ethers.utils.formatEther(balanceWei)).toFixed(4)} ETH`;
    }

    // Update MyToken Contract Address display
    if (DOM.myTokenContractAddress) {
      DOM.myTokenContractAddress.textContent = CONFIG.MY_TOKEN_ADDRESS;
      DOM.myTokenContractAddress.title = CONFIG.MY_TOKEN_ADDRESS; // Full address on hover
    }

    // Update token information if contracts are available
    if (appState.myTokenContract && appState.tokenSaleContract) {
      await updateTokenInfo();
      await updateOwnershipInfo();
    }
    
  } catch (error) {
    console.error('Error updating UI:', error);
    showMessage('Failed to update balances', 'error');
  } finally {
    hideLoading();
  }
}

// Update token-specific information
async function updateTokenInfo() {
  try {
    // Get token details
    const [decimals, symbol, userBalance, saleBalance, tokenPrice] = await Promise.all([
      appState.myTokenContract.decimals(),
      appState.myTokenContract.symbol(),
      appState.myTokenContract.balanceOf(appState.currentAccount),
      appState.myTokenContract.balanceOf(CONFIG.TOKEN_SALE_ADDRESS),
      appState.tokenSaleContract.tokenPriceInWei()
    ]);
    
    // Update user token balance
    if (DOM.myTokenBalance) {
      const formattedBalance = parseFloat(ethers.utils.formatUnits(userBalance, decimals)).toFixed(4);
      DOM.myTokenBalance.textContent = `${formattedBalance} ${symbol}`;
    }
    
    // Update token sale balance
    if (DOM.tokenSaleMyTBalance) {
      const formattedSaleBalance = parseFloat(ethers.utils.formatUnits(saleBalance, decimals)).toFixed(4);
      DOM.tokenSaleMyTBalance.textContent = `${formattedSaleBalance} ${symbol}`;
    }
    
    // Update token price
    if (DOM.tokenPrice) {
      const formattedPrice = parseFloat(ethers.utils.formatEther(tokenPrice)).toFixed(6);
      DOM.tokenPrice.textContent = formattedPrice;
    }
    
  } catch (error) {
    console.error('Error updating token info:', error);
    throw error;
  }
}

// Update ownership and permission information
async function updateOwnershipInfo() {
  try {
    const tokenSaleOwner = await appState.tokenSaleContract.owner();
    appState.isOwner = appState.currentAccount.toLowerCase() === tokenSaleOwner.toLowerCase();
    
    // Update withdraw button availability
    if (DOM.withdrawEthBtn && DOM.ethAmountToWithdrawInput) {
      DOM.withdrawEthBtn.disabled = !appState.isOwner;
      DOM.ethAmountToWithdrawInput.disabled = !appState.isOwner;
      
      if (appState.isOwner) {
        DOM.withdrawEthBtn.title = 'You are the contract owner';
      } else {
        DOM.withdrawEthBtn.title = 'Only the contract owner can withdraw';
      }
    }
    
  } catch (error) {
    console.error('Error updating ownership info:', error);
    throw error;
  }
}

// Reset UI to disconnected state
function resetUI() {
  // Reset connection display
  if (DOM.accountAddress) DOM.accountAddress.textContent = 'N/A';
  if (DOM.ethBalance) DOM.ethBalance.textContent = 'N/A';
  if (DOM.networkInfo) DOM.networkInfo.textContent = 'Network: Not Connected';
  
  updateConnectionStatus('Not Connected', '#333');
  
  if (DOM.connectWalletBtn) {
    DOM.connectWalletBtn.textContent = 'Connect Wallet';
    DOM.connectWalletBtn.disabled = false;
    DOM.connectWalletBtn.classList.remove('connected');
  }

  // Reset token information
  if (DOM.myTokenBalance) DOM.myTokenBalance.textContent = 'N/A';
  if (DOM.tokenSaleMyTBalance) DOM.tokenSaleMyTBalance.textContent = 'N/A';
  if (DOM.tokenPrice) DOM.tokenPrice.textContent = 'N/A';
  if (DOM.myTokenContractAddress) DOM.myTokenContractAddress.textContent = 'N/A';
  
  // Clear messages
  if (DOM.buyMessage) DOM.buyMessage.textContent = '';
  if (DOM.withdrawMessage) DOM.withdrawMessage.textContent = '';
  
  // Disable transaction buttons
  if (DOM.buyTokensBtn) DOM.buyTokensBtn.disabled = true;
  if (DOM.withdrawEthBtn) {
    DOM.withdrawEthBtn.disabled = true;
    DOM.withdrawEthBtn.title = 'Connect wallet to enable';
  }
  if (DOM.ethAmountToWithdrawInput) DOM.ethAmountToWithdrawInput.disabled = true;
  
  // Clear input values
  if (DOM.ethAmountToBuyInput) DOM.ethAmountToBuyInput.value = '';
  if (DOM.ethAmountToWithdrawInput) DOM.ethAmountToWithdrawInput.value = '';
  
  hideLoading();
}

// --- Enhanced Transaction Functions ---

async function buyTokens() {
  if (!appState.signer || !appState.tokenSaleContract) {
    showMessage('Please connect your wallet first.', 'error');
    return;
  }

  const ethAmount = DOM.ethAmountToBuyInput?.value;
  if (!ethAmount || parseFloat(ethAmount) <= 0) {
    showMessage('Please enter a valid amount of ETH to pay.', 'error');
    return;
  }

  // Disable buy button during transaction
  if (DOM.buyTokensBtn) DOM.buyTokensBtn.disabled = true;
  
  updateTransactionMessage(DOM.buyMessage, 'Preparing transaction...', 'info');

  try {
    const valueToSend = ethers.utils.parseEther(ethAmount);
    
    // Estimate gas before sending transaction
    updateTransactionMessage(DOM.buyMessage, 'Estimating gas...', 'info');
    const gasEstimate = await appState.tokenSaleContract.estimateGas.buyTokens({ value: valueToSend });
    
    // Get current gas price
    const gasPrice = await appState.provider.getGasPrice();
    const estimatedCost = gasEstimate.mul(gasPrice);
    
    console.log(`Estimated gas: ${gasEstimate.toString()}, Cost: ${ethers.utils.formatEther(estimatedCost)} ETH`);
    
    updateTransactionMessage(DOM.buyMessage, 'Waiting for transaction confirmation...', 'info');
    
    // Send transaction with estimated gas + 10% buffer
    const tx = await appState.tokenSaleContract.buyTokens({ 
      value: valueToSend,
      gasLimit: gasEstimate.mul(110).div(100) // 10% buffer
    });
    
    updateTransactionMessage(DOM.buyMessage, 'Transaction submitted. Waiting for confirmation...', 'info');
    
    // Wait for transaction confirmation
    const receipt = await tx.wait(CONFIG.CONFIRMATION_BLOCKS);
    
    console.log('Transaction confirmed:', receipt);
    
    const shortHash = `${tx.hash.slice(0, 10)}...${tx.hash.slice(-8)}`;
    updateTransactionMessage(DOM.buyMessage, `Successfully bought tokens! Tx: ${shortHash}`, 'success');
    
    // Clear input and refresh UI
    if (DOM.ethAmountToBuyInput) DOM.ethAmountToBuyInput.value = '';
    await updateUI();
    
  } catch (error) {
    console.error('Error buying tokens:', error);
    
    let errorMessage = 'Failed to buy tokens';
    
    if (error.code === 4001) {
      errorMessage = 'Transaction cancelled by user';
    } else if (error.message.includes('insufficient funds')) {
      errorMessage = 'Insufficient funds for transaction';
    } else if (error.message.includes('gas')) {
      errorMessage = 'Gas estimation failed. Please try again.';
    } else if (error.reason) {
      errorMessage = `Transaction failed: ${error.reason}`;
    }
    
    updateTransactionMessage(DOM.buyMessage, errorMessage, 'error');
  } finally {
    // Re-enable buy button
    if (DOM.buyTokensBtn) DOM.buyTokensBtn.disabled = false;
  }
}

async function withdrawEth() {
  if (!appState.signer || !appState.tokenSaleContract) {
    showMessage('Please connect your wallet first.', 'error');
    return;
  }
  
  if (!appState.isOwner) {
    showMessage('Only the contract owner can withdraw funds.', 'error');
    return;
  }

  const ethAmount = DOM.ethAmountToWithdrawInput?.value;
  if (!ethAmount || parseFloat(ethAmount) <= 0) {
    showMessage('Please enter a valid amount of ETH to withdraw.', 'error');
    return;
  }

  // Disable withdraw button during transaction
  if (DOM.withdrawEthBtn) DOM.withdrawEthBtn.disabled = true;
  
  updateTransactionMessage(DOM.withdrawMessage, 'Preparing withdrawal...', 'info');

  try {
    const valueToWithdraw = ethers.utils.parseEther(ethAmount);
    
    // Check contract balance before attempting withdrawal
    const contractBalance = await appState.provider.getBalance(CONFIG.TOKEN_SALE_ADDRESS);
    if (contractBalance.lt(valueToWithdraw)) {
      throw new Error('Insufficient contract balance');
    }
    
    // Estimate gas
    updateTransactionMessage(DOM.withdrawMessage, 'Estimating gas...', 'info');
    const gasEstimate = await appState.tokenSaleContract.estimateGas.withdrawEth(valueToWithdraw);
    
    updateTransactionMessage(DOM.withdrawMessage, 'Waiting for transaction confirmation...', 'info');
    
    // Send withdrawal transaction
    const tx = await appState.tokenSaleContract.withdrawEth(valueToWithdraw, {
      gasLimit: gasEstimate.mul(110).div(100) // 10% buffer
    });
    
    updateTransactionMessage(DOM.withdrawMessage, 'Transaction submitted. Waiting for confirmation...', 'info');
    
    // Wait for confirmation
    const receipt = await tx.wait(CONFIG.CONFIRMATION_BLOCKS);
    
    console.log('Withdrawal confirmed:', receipt);
    
    const shortHash = `${tx.hash.slice(0, 10)}...${tx.hash.slice(-8)}`;
    updateTransactionMessage(DOM.withdrawMessage, `Successfully withdrew ${ethAmount} ETH! Tx: ${shortHash}`, 'success');
    
    // Clear input and refresh UI
    if (DOM.ethAmountToWithdrawInput) DOM.ethAmountToWithdrawInput.value = '';
    await updateUI();
    
  } catch (error) {
    console.error('Error withdrawing ETH:', error);
    
    let errorMessage = 'Failed to withdraw ETH';
    
    if (error.code === 4001) {
      errorMessage = 'Transaction cancelled by user';
    } else if (error.message.includes('Insufficient contract balance')) {
      errorMessage = 'Contract does not have enough ETH to withdraw';
    } else if (error.message.includes('Only owner')) {
      errorMessage = 'Only the contract owner can withdraw funds';
    } else if (error.reason) {
      errorMessage = `Withdrawal failed: ${error.reason}`;
    }
    
    updateTransactionMessage(DOM.withdrawMessage, errorMessage, 'error');
  } finally {
    // Re-enable withdraw button
    if (DOM.withdrawEthBtn && appState.isOwner) {
      DOM.withdrawEthBtn.disabled = false;
    }
  }
}

// Helper function to update transaction messages
function updateTransactionMessage(element, message, type) {
  if (!element) return;
  
  element.textContent = message;
  element.className = `message ${type}`;
  
  // Auto-clear success messages after 10 seconds
  if (type === 'success') {
    setTimeout(() => {
      element.textContent = '';
      element.className = 'message';
    }, 10000);
  }
}

// --- Event Listeners Setup ---
function setupEventListeners() {
  if (DOM.connectWalletBtn) {
    DOM.connectWalletBtn.addEventListener('click', connectWallet);
  }
  
  if (DOM.buyTokensBtn) {
    DOM.buyTokensBtn.addEventListener('click', buyTokens);
  }
  
  if (DOM.withdrawEthBtn) {
    DOM.withdrawEthBtn.addEventListener('click', withdrawEth);
  }
  
  // Add input validation
  if (DOM.ethAmountToBuyInput) {
    DOM.ethAmountToBuyInput.addEventListener('input', validateBuyInput);
  }
  
  if (DOM.ethAmountToWithdrawInput) {
    DOM.ethAmountToWithdrawInput.addEventListener('input', validateWithdrawInput);
  }
}

// Input validation functions
function validateBuyInput() {
  const value = parseFloat(DOM.ethAmountToBuyInput?.value || '0');
  const isValid = value > 0 && appState.provider && appState.currentAccount;
  
  if (DOM.buyTokensBtn) {
    DOM.buyTokensBtn.disabled = !isValid;
  }
}

function validateWithdrawInput() {
  const value = parseFloat(DOM.ethAmountToWithdrawInput?.value || '0');
  const isValid = value > 0 && appState.isOwner && appState.provider;
  
  if (DOM.withdrawEthBtn) {
    DOM.withdrawEthBtn.disabled = !isValid;
  }
}

// Update status dot visual indicator
function updateStatusDot(status) {
  const statusDot = document.getElementById('statusDot');
  if (!statusDot) return;
  
  statusDot.className = 'status-dot';
  
  switch(status) {
    case 'connected':
      statusDot.classList.add('connected');
      break;
    case 'connecting':
      statusDot.classList.add('connecting');
      break;
    default:
      // default gray dot
      break;
  }
}

// Initialize application
function initializeApp() {
  console.log('Initializing MyToken DApp with Web3Modal support...');
  
  // Initialize Web3Modal first
  const web3ModalInitialized = initWeb3Modal();
  
  if (web3ModalInitialized) {
    console.log('Web3Modal ready - Multi-wallet support enabled');
  } else {
    console.log('Falling back to direct wallet connection');
  }
  
  // Setup event listeners
  setupEventListeners();
  
  // Reset UI to initial state
  resetUI();
  
  // Attempt auto-connect if cached provider exists or wallet was previously connected
  setTimeout(() => {
    if (web3Modal && web3Modal.cachedProvider) {
      console.log('Cached provider found, attempting auto-connect...');
      connectWallet();
    } else if (typeof window.ethereum !== 'undefined' && window.ethereum.selectedAddress) {
      console.log('Previous wallet connection detected, attempting auto-connect...');
      connectWallet();
    }
  }, 1000);
  
  console.log('DApp initialization complete');
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}
