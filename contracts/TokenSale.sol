// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol"; // For owner-only functions

contract TokenSale is Ownable {
    ERC20 public myToken; // Instance of the deployed ERC-20 token
    uint256 public tokenPriceInWei; // Price of 1 MYT token in Wei (e.g., 1 MYT = 0.001 ETH)

    event TokensPurchased(
        address buyer,
        uint256 ethAmount,
        uint256 tokenAmount
    );
    event EthWithdrawn(address recipient, uint256 amount);

    // Constructor: Takes the address of the deployed ERC-20 token and its price
    constructor(
        address _tokenAddress,
        uint256 _tokenPriceInWei
    ) Ownable(msg.sender) {
        // Explicitly set the owner
        myToken = ERC20(_tokenAddress); // Connect to your deployed MyToken contract
        tokenPriceInWei = _tokenPriceInWei; // Set price of token
    }

    // Function to allow users to buy tokens
    function buyTokens() public payable {
        require(msg.value > 0, "Value of ETH cannot be zero");
        require(tokenPriceInWei > 0, "Token price must be greater than zero");

        uint256 tokensToBuy = msg.value / tokenPriceInWei;
        require(tokensToBuy > 0, "Not enough ETH to buy any tokens");

        // Check if the TokenSale contract has enough MYT tokens to sell
        require(
            myToken.balanceOf(address(this)) >= tokensToBuy,
            "TokenSale: not enough tokens in contract"
        );

        // Transfer MYT tokens from THIS TokenSale contract's balance to the buyer
        myToken.transfer(msg.sender, tokensToBuy);

        emit TokensPurchased(msg.sender, msg.value, tokensToBuy);
    }

    // Owner can withdraw ETH from the contract
    function withdrawEth(uint256 amount) public onlyOwner {
        require(amount > 0, "Amount must be greater than 0");
        require(address(this).balance >= amount, "Not enough ETH in contract");
        // Transfer ETH from this contract to the owner
        payable(owner()).transfer(amount);
        emit EthWithdrawn(owner(), amount);
    }

    // Fallback function to receive ETH if someone sends it directly without calling buyTokens
    receive() external payable {
        // Optional: make it automatically buy tokens:
        buyTokens();
        // Or just allow it to receive ETH for later purchase/withdrawal.
    }
}
