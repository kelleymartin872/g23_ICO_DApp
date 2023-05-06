pragma solidity ^0.8.10;
import "./ERC20.sol";

contract Token is ERC20 {
    constructor(string memory name, string memory symbol) 
        ERC20(name, symbol) {
        // ERC20 tokens have 18 decimals 
        // number of tokens minted = n * 10^18
        uint256 n = 5000;
        _mint(msg.sender, n * 10**uint(decimals()));
    }

    function deposit() public payable{
        balanceOf(msg.sender) += msg.value;
    }

    function withdraw(uint amount) public {
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        (bool success,) = msg.sender.call{value:amount}("");
        require(success, "Failed to send ether");
        balanceOf(msg.sender) -= amount;
    }

    function getBalance() public view returns (uint) {
        return balanceOf(msg.sender);
    }
}