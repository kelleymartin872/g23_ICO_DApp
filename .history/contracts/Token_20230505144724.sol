pragma solidity ^0.8.10;
import "./ERC20/ERC20.sol"

contract MyToken is ERC20 {
    constructor(string memory name, string memory symbol) 
        ERC20(name, symbol) {
        // ERC20 tokens have 18 decimals 
        // number of tokens minted = n * 10^18
        uint256 n = 1000;
        _mint(msg.sender, n * 10**uint(decimals()));
    }
}