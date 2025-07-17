const hre = require('hardhat');

async function main() {
  // Get the deployer's account
  const [deployer] = await hre.ethers.getSigners();

  console.log('Deploying contracts with the account:', deployer.address);
  console.log(
    'Account balance:',
    (await hre.ethers.provider.getBalance(deployer.address)).toString()
  );

  // Get the ContractFactory for MyToken
  const Token = await hre.ethers.getContractFactory('MyToken');

  // Deploy the contract
  const myToken = await Token.deploy();

  // Wait for the deployment to be confirmed on the blockchain
  await myToken.waitForDeployment();

  console.log('MyToken deployed to address:', myToken.target);
}

// Pattern to handle errors and exit process
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
