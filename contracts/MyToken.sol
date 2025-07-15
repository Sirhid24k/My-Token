// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

// Uncomment this line to use console.log
// import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MyToken is ERC20 {
    address public owner;

    constructor() ERC20("My Token", "MYT") {
        // Set Owner of contract
        owner = msg.sender;
        // Mint an initial supply of 1,000,000 tokens
        _mint(msg.sender, 1_000_000 * (10 ** decimals()));
    }
}