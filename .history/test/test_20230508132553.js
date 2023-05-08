const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("ICO and ICOToken", function () {
  let token;
  let ico;
  const owner = ethers.constants.AddressZero;
  const investor1 = ethers.Wallet.createRandom().address;

  beforeEach(async () => {
    // Deploy token contract
    const ICOToken = await ethers.getContractFactory("ICOToken");
    token = await ICOToken.deploy("MyToken", "MT", 18, ethers.utils.parseEther("1000"));
    await token.deployed();

    // Deploy ICO contract, starting in 1 minute and ending in 10 minutes
    const now = Math.floor(Date.now() / 1000);
    const startTime = now + 60;
    const endTime = now + 600;
    const ICO = await ethers.getContractFactory("ICO");
    ico = await ICO.deploy(
      token.address
    );
    await ico.deployed();

    // Mint some tokens to the owner
    await token.mint(owner, ethers.utils.parseEther("500"));
  });

  it("should correctly deposit and withdraw during ICO", async () => {
    // Investor 1 deposits 2 Ether
    await ico.connect(ethers.provider.getSigner(investor1)).deposit({ value: ethers.utils.parseEther("2") });
    expect(await ico.deposits(investor1)).to.equal(ethers.utils.parseEther("2"));

    // Investor 1 withdraws the deposit because ICO hasn't ended yet
    await ico.connect(ethers.provider.getSigner(investor1)).withdraw();
    expect(await ico.deposits(investor1)).to.equal(ethers.constants.Zero);

    // Wait for the ICO to end
    await ethers.provider.send("evm_increaseTime", [10 * 60]); // Increase time by 10 minutes
    await ethers.provider.send("evm_mine", []); // Mine a new block to update the current block timestamp

    // Investor 1 deposits 2 Ether again
    await ico.connect(ethers.provider.getSigner(investor1)).deposit({ value: ethers.utils.parseEther("2") });
    expect(await ico.deposits(investor1)).to.equal(ethers.utils.parseEther("2"));

    // Wait for the ICO to end again
    await ethers.provider.send("evm_increaseTime", [10 * 60]); // Increase time by 10 minutes
    await ethers.provider.send("evm_mine", []); // Mine a new block to update the current block timestamp

    // Investor 1 withdraws the deposit because ICO failed
    await ico.connect(ethers.provider.getSigner(investor1)).withdraw();
    expect(await ico.deposits(investor1)).to.equal(ethers.constants.Zero);
  });

  it("should correctly claim tokens after ICO succeeds", async () => {
    // Investor 1 deposits 5 Ether
    await ico.connect(ethers.provider.getSigner(investor1)).deposit({ value: ethers.utils.parseEther("5") });
    expect(await ico.deposits(investor1)).to.equal(ethers.utils.parseEther("5"));

    // Wait for the ICO to end
    await ethers.provider.send("evm_increaseTime", [10 * 60]); // Increase time by 10 minutes
    await ethers.provider.send("evm_mine", []); // Mine a new block to update the current block timestamp

    // End the ICO, which succeeds because soft cap is reached
    await ico.endICO();

    // Investor 1 claims tokens
    const balanceBefore = await token.balanceOf(investor1);
    await ico.connect(ethers.provider.getSigner(investor1)).claimTokens();
    const balanceAfter = await token.balanceOf(investor1);
    expect(balanceAfter.sub(balanceBefore)).to.equal(ethers.utils.parseEther("500")); // Investor 1 deposited 5 Ether, which is 50% of the total Ether raised, so they get 50% of the total token supply
  });
});