const hre = require('hardhat');
require('dotenv').config();

async function main() {
  // Get the deployer's account
  const [deployer] = await hre.ethers.getSigners();
  const myTokenAddress = process.env.MY_TOKEN_ADDRESS; // Get the deployed token address

  console.log('Deploying TokenSale with the account:', deployer.address);
  console.log(
    'Account balance:',
    (await hre.ethers.provider.getBalance(deployer.address)).toString()
  );
  console.log('Using MyToken address:', myTokenAddress);

  // Get the ContractFactory for TokenSale
  const TokenSale = await hre.ethers.getContractFactory('TokenSale');

  // Define the token price
  // 1ETH = 1e18 wei, so 0.0001 ETH = 0.0001 * 1e18 wei
  // 1MYT = 0.0001 ETH
  const tokenPriceInWei = hre.ethers.parseEther('0.0001');

  // Deploy the TokenSale contract
  // The constructor arguments for TokenSale are: _tokenAddress, _tokenPriceInWei
  const tokenSale = await TokenSale.deploy(myTokenAddress, tokenPriceInWei);

  // Wait for the deployment to be confirmed on the blockchain
  await tokenSale.waitForDeployment();

  console.log('TokenSale deployed to address:', tokenSale.target);
  console.log(
    'TokenSale is selling MYT at:',
    hre.ethers.formatUnits(tokenPriceInWei, 'ether'),
    'ETH per MYT'
  );
  console.log(
    'Remember to fund the TokenSale contract with MYT tokens after deployment!'
  );
}

// Pattern to handle errors and exit process
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
