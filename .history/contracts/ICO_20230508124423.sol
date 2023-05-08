// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface ICOContract {
    function balanceOf(address who) external view returns (uint256);
    function transfer(address to, uint256 value) external returns (bool);
}

contract ICO {
    ICOContract public token;
    address payable public owner;
    uint256 public softCap = 0.1 ether;
    uint256 public hardCap = 1 ether;
    uint256 public totalEtherRaised = 0;
    uint256 public startTime = 1654060800; // January 1, 2022 12:00:00 AM GMT
    uint256 public endTime = 1654464000; // January 5, 2022 12:00:00 AM GMT

    uint256 public constant MIN_PURCHASE_AMOUNT = 0.01 ether;
    uint256 public constant MAX_PURCHASE_AMOUNT = 0.05 ether;

    // Deposits Mapping
    mapping(address => uint256) public deposits;

    constructor(address tokenAddress) {
        token = ICOContract(tokenAddress);
        owner = payable(msg.sender);
    }

    // purchase tokens from ICO contract = Deposit
    receive() external payable {
        require(msg.sender != address(0), "Invalid address");
        require(totalEtherRaised < hardCap, "Hard cap reached");
        // During ICO
        require(block.timestamp >= startTime, "ICO has not started yet");
        require(block.timestamp <= endTime, "ICO has ended");
        // MIN/MAX Purchase Amount
        require(msg.value >= MIN_PURCHASE_AMOUNT, "Purchase amount too small");
        require(msg.value <= MAX_PURCHASE_AMOUNT, "Purchase amount too large");

        uint256 etherAmount = msg.value;
        uint256 tokenAmount = etherAmount * 1000; // 1 ETH = 1000 ICOT

        // Enough tokens?
        require(token.balanceOf(address(this)) >= tokenAmount, "Not enough tokens in ICO contract");

        // Transfer to sender
        token.transfer(msg.sender, tokenAmount);
        deposits[msg.sender] += etherAmount;
        totalEtherRaised += etherAmount;
    }

    function withdraw() external {
        require(block.timestamp > endTime, "ICO has not ended yet");
        require(totalEtherRaised < softCap, "Soft cap has been reached");

        uint256 depositAmount = deposits[msg.sender];
        deposits[msg.sender] = 0;
        payable(msg.sender).transfer(depositAmount);
    }

    function claim() external {
        require(block.timestamp > endTime, "ICO has not ended yet");
        require(totalEtherRaised >= softCap, "Soft cap has not been reached");

        uint256 tokenAmount = token.balanceOf(msg.sender);
        require(tokenAmount > 0, "You don't have any tokens to claim");
        
        token.transfer(msg.sender, tokenAmount);
        // emit TokensClaimed(msg.sender, tokenAmount);
    }
}