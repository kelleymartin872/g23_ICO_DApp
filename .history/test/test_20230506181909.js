const { ethers } = require('hardhat');
const { expect } = require('chai');

describe('ICOToken', function () {
  let token;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async () => {
    [owner, addr1, addr2] = await ethers.getSigners();

    const Token = await ethers.getContractFactory('ICOToken');
    token = await Token.connect(owner).deploy();

    await token.deployed();
  });

  it('should have the correct name, symbol, decimals and total supply', async function () {
    expect(await token.name()).to.equal("ICO Token");
    expect(await token.symbol()).to.equal("ICOT");
    expect(await token.decimals()).to.equal(18);
    expect(await token.totalSupply()).to.equal(5000 * 10 ** 18);
  });

  it('should allow the owner to mint new tokens', async function () {
    const amount = 1000 * 10 ** 18;

    await token.connect(owner).mint(amount);

    expect(await token.balanceOf(owner.address)).to.equal(
      6000 * 10 ** 18
    );
  });

  it('should allow a user to transfer tokens to another user', async function () {
    await token.transfer(addr1.address, 100 * 10 ** 18);

    expect(await token.balanceOf(addr1.address)).to.equal(100 * 10 ** 18);
  });

  it('should allow a user to approve another user to spend tokens on their behalf', async function () {
    await token.approve(addr1.address, 100 * 10 ** 18);

    expect(await token.allowance(owner.address, addr1.address)).to.equal(
      100 * 10 ** 18
    );
  });

  it('should allow a user to transfer tokens on behalf of another user', async function () {
    await token.connect(addr1).transferFrom(owner.address, addr2.address, 50 * 10 ** 18);

    expect(await token.balanceOf(addr2.address)).to.equal(50 * 10 ** 18);
  });
});

describe('ICO', function () {
  let token;
  let owner;
  let addr1;
  let addr2;
  let ico;

  beforeEach(async () => {
    [owner, addr1, addr2] = await ethers.getSigners();

    const Token = await ethers.getContractFactory('ICOToken');
    token = await Token.connect(owner).deploy();
    await token.deployed();

    const ICO = await ethers.getContractFactory('ICO');
    ico = await ICO.connect(owner).deploy(token.address);
    await ico.deployed();
  });

  it('should have the correct soft cap, hard cap, minimum and maximum purchase amounts and time limits', async function () {
    expect(await ico.softCap()).to.equal(100 * 10 ** 18);
    expect(await ico.hardCap()).to.equal(1000 * 10 ** 18);
    expect(await ico.MIN_PURCHASE_AMOUNT()).to.equal(0.1 * 10 ** 18);
    expect(await ico.MAX_PURCHASE_AMOUNT()).to.equal(1 * 10 ** 18);
    expect(await ico.startTime()).to.equal(1654060800);
    expect(await ico.endTime()).to.equal(1654464000);
  });

  it('should allow users to deposit ether and receive tokens', async function () {
    const amount = ethers.utils.parseEther('0.5');

    await ico.connect(addr1).sendTransaction({ value: amount });

    expect(await token.balanceOf(addr1.address)).to.equal(500 * 10 ** 18);
    expect(await ico.deposits(addr1.address)).to.equal(amount);
  });

  it('should not allow users to deposit ether outside the time limits', async function () {
    await expect(
      ico.connect(addr1).sendTransaction({ value: ethers.utils.parseEther('1') })
    ).to.be.revertedWith('ICO has not started yet');

    await ethers.provider.send('evm_increaseTime', [100000]);

    await expect(
      ico.connect(addr1).sendTransaction({ value: ethers.utils.parseEther('1') })
    ).to.be.revertedWith('ICO has ended');
  });

  it('should not allow users to deposit ether below the minimum purchase amount', async function () {
    await expect(
      ico.connect(addr1).sendTransaction({ value: ethers.utils.parseEther('0.05') })
    ).to.be.revertedWith('Purchase amount too small');
  });

  it('should not allow users to deposit ether above the maximum purchase amount', async function () {
    await expect(
      ico.connect(addr1).sendTransaction({ value: ethers.utils.parseEther('1.5') })
    ).to.be.revertedWith('Purchase amount too large');
  });

  it('should not allow users to deposit ether if the hard cap has been reached', async function () {
    await ico.connect(addr1).sendTransaction({ value: ethers.utils.parseEther('0.5') });
    await ico.connect(addr2).sendTransaction({ value: ethers.utils.parseEther('0.5') });

    await expect(
      ico.connect(addr1).sendTransaction({ value: ethers.utils.parseEther('0.5') })
    ).to.be.revertedWith('Hard cap reached');
  });

  it('should allow users to withdraw their deposits if the soft cap has not been reached', async function () {
    await ico.connect(addr1).sendTransaction({ value: ethers.utils.parseEther('0.5') });

    await ethers.provider.send('evm_increaseTime', [86400 * 7]);

    const balanceBefore = await ethers.provider.getBalance(addr1.address);

    await ico.connect(addr1).withdraw();

    const balanceAfter = await ethers.provider.getBalance(addr1.address);

    expect(balanceAfter).to.equal(balanceBefore.add(ethers.utils.parseEther('0.5')));
    expect(await ico.deposits(addr1.address)).to.equal(0);
  });

  it('should not allow users to withdraw their deposits if the soft cap has been reached', async function () {
    const amount = ethers.utils.parseEther('0.5');

    await ico.connect(addr1).sendTransaction({ value: amount });
    await ico.connect(addr2).sendTransaction({ value: amount });

    await expect(ico.connect(addr1).withdraw()).to.be.revertedWith(
      'Soft cap has been reached'
    );
  });

  it('should allow users to claim their tokens if the soft cap has been reached', async function () {
    const amount = ethers.utils.parseEther('0.5');

    await ico.connect(addr1).sendTransaction({ value: amount });
    await ico.connect(addr2).sendTransaction({ value: amount });

    await ethers.provider.send('evm_increaseTime', [86400 * 7]);

    await ico.claim({ from: addr1.address });

    expect(await token.balanceOf(addr1.address)).to.equal(500 * 10 ** 18);
  });

  it('should not allow users to claim their tokens if the soft cap has not been reached', async function () {
    await ico.connect(addr1).sendTransaction({ value: ethers.utils.parseEther('0.5') });

    await expect(ico.connect(addr1).claim()).to.be.revertedWith(
      'Soft cap has not been reached'
    );
  });
});