// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "./ICOToken.sol";

contract ICO {
    ICOToken public token;
    address payable public owner;
    uint256 public softCap = 0.1 ether;
    uint256 public hardCap = 0.5 ether;
    uint256 public totalEtherRaised = 0;
    uint256 public startTime = 1683507090; // May 8, 2023 - 00:00:00 (GMT)
    uint256 public endTime = 1683593490; // May 9, 2023 - 00:00:00 (GMT)
    uint public rate = 1000;

    uint256 public constant MIN_PURCHASE_AMOUNT = 0.01 ether;
    uint256 public constant MAX_PURCHASE_AMOUNT = 0.05 ether;

    event Deposit(address indexed invest, uint amount);
    event Withdraw(address indexed invest, uint amount);
    event Claim(address indexed invest, uint amount);

    // Deposits Mapping
    mapping(address => uint256) public deposits;

    constructor(address tokenAddress, uint starting, uint ending) {
        token = ICOToken(tokenAddress);
        owner = payable(msg.sender);
        startTime = starting;
        endTime = ending;
    }

    // purchase tokens from ICO contract = Deposit
    function deposit () external payable returns (bool) {
        require(msg.sender != address(0), "Invalid address");
        require(totalEtherRaised < hardCap, "Hard cap reached");
        // During ICO
        require(block.timestamp >= startTime, "ICO has not started yet");
        require(block.timestamp <= endTime, "ICO has ended");
        // MIN/MAX Purchase Amount
        require(msg.value >= MIN_PURCHASE_AMOUNT, "Purchase amount too small");
        require(msg.value <= MAX_PURCHASE_AMOUNT, "Purchase amount too large");

        uint256 etherAmount = msg.value;
        deposits[msg.sender] += etherAmount;
        totalEtherRaised += etherAmount;
        emit Deposit(msg.sender, etherAmount);
    }

    function withdraw() external returns (bool) {
        require(msg.sender != address(0), "Invalid address");
        require(block.timestamp > endTime, "ICO has not ended yet");
        require(totalEtherRaised < softCap, "Soft cap has been reached");

        uint256 depositAmount = deposits[msg.sender];
        deposits[msg.sender] = 0;
        payable(msg.sender).transfer(depositAmount);
        emit Withdraw(msg.sender, depositAmount);
    }

    function claim() external returns () {
        require(msg.sender != address(0), "Invalid address");
        require(totalEtherRaised >= softCap, "Soft cap has not been reached");
        if (block.timestamp <= endTime) {
           require(totalEtherRaised >= hardCap, "Hard cap has not been reached");
        }

        uint256 etherAmount = deposits[msg.sender];
        require(etherAmount > 0, "You don't have any tokens to claim");
        uint256 tokenAmount = etherAmount * 1000;
        deposits[msg.sender] = 0;
        
        token.transfer(msg.sender, tokenAmount);
        emit Claim(msg.sender, tokenAmount);
    }
}