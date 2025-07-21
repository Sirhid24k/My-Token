const hre = require('hardhat');
require('dotenv').config();

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const myTokenAddress = process.env.MY_TOKEN_ADDRESS;
  const tokenSaleAddress = process.env.TOKEN_SALE_ADDRESS; // The address of your TokenSale contract

  console.log('Funding TokenSale contract from deployer:', deployer.address);

  // Get the ABI for MyToken
  const MyToken = await hre.ethers.getContractFactory('MyToken');
  const myToken = new hre.ethers.Contract(
    myTokenAddress,
    MyToken.interface,
    deployer
  );

  // Amount of MYT tokens to send to the TokenSale contract (e.g., 500,000 MYT)
  const amountToFund = hre.ethers.parseUnits(
    '500000',
    await myToken.decimals()
  );

  console.log(
    `\n--- Transferring ${hre.ethers.formatUnits(
      amountToFund,
      await myToken.decimals()
    )} ${await myToken.symbol()} to TokenSale contract (${tokenSaleAddress}) ---`
  );

  try {
    const tx = await myToken.transfer(tokenSaleAddress, amountToFund);
    await tx.wait(); // Wait for the transaction to be mined
    console.log('Funding successful! Transaction hash:', tx.hash);

    // Optional: Check balances after funding
    let deployerTokenBalance = await myToken.balanceOf(deployer.address);
    let tokenSaleTokenBalance = await myToken.balanceOf(tokenSaleAddress);
    console.log(
      'Deployer MYT balance:',
      hre.ethers.formatUnits(deployerTokenBalance, await myToken.decimals())
    );
    console.log(
      'TokenSale MYT balance:',
      hre.ethers.formatUnits(tokenSaleTokenBalance, await myToken.decimals())
    );
  } catch (error) {
    console.error('Funding failed:', error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
