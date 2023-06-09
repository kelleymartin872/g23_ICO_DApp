const { ethers } = require('hardhat');
const { expect } = require('chai');

async function latestTime() {
  const block = await ethers.provider.getBlock("latest");
  return block.timestamp;
}

const duration = {
  seconds(val) {
    return val;
  },
  minutes(val) {
    return val * this.seconds(60);
  },
  hours(val) {
    return val * this.minutes(60);
  },
  days(val) {
    return val * this.hours(24);
  },
  weeks(val) {
    return val * this.days(7);
  },
  years(val) {
    return val * this.days(365);
  },
};

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
    expect(await token.totalSupply() - 1).to.equal(5000 * 10 ** 18 - 1);
  });

  it('should allow the owner to mint new tokens', async function () {
    await token.connect(owner).mint(ethers.BigNumber.from("1000000000000000000000"));

    expect(await token.balanceOf(owner.address)).to.equal(
      ethers.BigNumber.from("6000000000000000000000")
    );
  });

  it('should allow a user to transfer tokens to another user', async function () {
    await token.transfer(addr1.address, 1000);

    expect(await token.balanceOf(addr1.address)).to.equal(1000);
  });

  it('should allow a user to approve another user to spend tokens on their behalf', async function () {
    await token.approve(addr1.address, 1000);

    expect(await token.allowance(owner.address, addr1.address)).to.equal(
      1000
    );
  });
});

describe('ICO', function () {
  let token;
  let owner;
  let addr1;
  let addr2;
  let ico;
  let openingTime;
  let closeTime;

  beforeEach(async () => {
    [owner, addr1, addr2] = await ethers.getSigners();

    const Token = await ethers.getContractFactory('ICOToken');
    token = await Token.connect(owner).deploy();
    await token.deployed();

    const ICO = await ethers.getContractFactory('ICO');    
    const latestBlockTime = await latestTime();
    openingTime = latestBlockTime;
    closeTime = openingTime + duration.days(1); // 1 day
    ico = await ICO.connect(owner).deploy(token.address, openingTime, closeTime);
    await ico.deployed();
  });

  describe("Deposit", function () {
    it('should have the correct soft cap, hard cap, minimum and maximum purchase amounts and time limits', async function () {
      
      expect(await ico.softCap()).to.equal(ethers.BigNumber.from("100000000000000000"));
      expect(await ico.hardCap()).to.equal(ethers.BigNumber.from("500000000000000000"));
      expect(await ico.MIN_PURCHASE_AMOUNT()).to.equal(ethers.BigNumber.from("10000000000000000"));
      expect(await ico.MAX_PURCHASE_AMOUNT()).to.equal(ethers.BigNumber.from("50000000000000000"));
      expect(await ico.startTime()).to.equal(openingTime);
      expect(await ico.endTime()).to.equal(closeTime);
    });
  
    it('should allow users to deposit ether', async function () {

      await ico.connect(addr1).deposit({value: ethers.utils.parseEther('0.02')});
      expect(await ico.deposits(addr1.address)).to.equal(ethers.utils.parseEther('0.02'));
    });
  
    it('should not allow users to deposit ether outside the time limits', async function () {
      await ethers.provider.send('evm_increaseTime', [-86400]);
      expect(
        await ico.connect(addr1).deposit({value: ethers.utils.parseEther('0.02')})
      ).to.be.revertedWith("ICO has not started yet");

      await ethers.provider.send('evm_increaseTime', [86400]);
      await ethers.provider.send('evm_increaseTime', [86400]);
      expect(
        await ico.connect(addr1).deposit({value: ethers.utils.parseEther('0.02')})
      ).to.be.revertedWith('ICO has ended');
      await ethers.provider.send('evm_increaseTime', [-86400]);
    });
  
    it('should not allow users to deposit ether below the minimum purchase amount', async function () {
      expect(
        await ico.connect(addr1).deposit({ value: ethers.utils.parseEther('0.005') })
      ).to.be.revertedWith('Purchase amount too small');
    });
  
    it('should not allow users to deposit ether above the maximum purchase amount', async function () {
      expect(
        await ico.connect(addr1).deposit({value: ethers.utils.parseEther('0.1')})
      ).to.be.revertedWith('Purchase amount too large');
    });
  
    it('should not allow users to deposit ether if the hard cap has been reached', async function () {
      ico.totalEtherRaised = 1.5;
  
      expect(
         await ico.connect(addr1).deposit({value: ethers.utils.parseEther('0.02')})
      ).to.be.revertedWith('Hard cap reached');
    });
  });

  describe("Withdraw", function () {
    it('should allow users to withdraw their deposits if the soft cap has not been reached', async function () {
      ico.totalEtherRaised = 0.05;
      await ethers.provider.send('evm_increaseTime', [86400]);
  
      //const balanceBefore = await ethers.provider.getBalance(addr1.address);
      await ico.connect(addr1).withdraw();
      //const balanceAfter = await ethers.provider.getBalance(addr1.address);
  
      //expect(balanceAfter).to.equal(await balanceBefore.add(ethers.utils.parseEther('0.05')));
      expect(await ico.deposits(addr1.address)).to.equal(0);
      await ethers.provider.send('evm_increaseTime', [-86400]);
    });
  
    it('should not allow users to withdraw their deposits if the soft cap has been reached', async function () {
      const amount = ethers.utils.parseEther('0.5');
      ico.totalEtherRaised = amount;
      await ethers.provider.send('evm_increaseTime', [86400]);
      expect(await ico.connect(addr1).withdraw()).to.be.revertedWith(
        'Soft cap has been reached'
      );
      await ethers.provider.send('evm_increaseTime', [-86400]);
    });
  
    it('should not allow users to withdraw their deposits if ICO has not ended', async function () {
      const value = ethers.utils.parseEther('0.05');
      ico.totalEtherRaised = value;
      
      expect(await ico.connect(addr1).withdraw()).to.be.revertedWith(
        'ICO has not ended yet'
      );
    });
  })

  describe("Claim", function () {
    it('should allow users to claim their tokens if the soft cap has been reached', async function () {
      await ico.connect(addr1).deposit({value: ethers.utils.parseEther('0.05')});
      await ico.connect(addr1).deposit({value: ethers.utils.parseEther('0.05')});
      await ico.connect(addr1).deposit({value: ethers.utils.parseEther('0.05')});

      await ethers.provider.send('evm_increaseTime', [86400]);
      await ico.connect(addr1).claim();

      expect(await token.balanceOf(addr1.address)).to.equal(ethers.BigNumber.from("150000000000000000000"));
      await ethers.provider.send('evm_increaseTime', [-86400]);
    });
  
    it('should not allow users to claim their tokens if the soft cap has not been reached', async function () {
      ico.totalEtherRaised = 0.05;
      await ethers.provider.send('evm_increaseTime', [86400]);
      expect(await ico.connect(addr1).claim()).to.be.revertedWith(
        'Soft cap has not been reached'
      );
      await ethers.provider.send('evm_increaseTime', [-86400]);
    });
  
    it('should not allow users to claim their tokens if the hard cap has not been reached and ICO has not ended', async function () {
      ico.totalEtherRaised = 0.5;
      console.log(ico.totalEtherRaised());
      expect(await ico.connect(addr1).claim()).to.be.revertedWith(
        "Hard cap has not been reached"
      );
    });
  
    it('should allow users to claim their tokens if the hard cap has been reached', async function () {

      await ico.connect(addr1).deposit({value: ethers.utils.parseEther('0.05')});
      await ico.connect(addr1).deposit({value: ethers.utils.parseEther('0.05')});
      await ico.connect(addr1).deposit({value: ethers.utils.parseEther('0.05')});
      await ico.connect(addr1).deposit({value: ethers.utils.parseEther('0.05')});
      await ico.connect(addr1).deposit({value: ethers.utils.parseEther('0.05')});
      await ico.connect(addr1).deposit({value: ethers.utils.parseEther('0.05')});
      await ico.connect(addr1).deposit({value: ethers.utils.parseEther('0.05')});
      await ico.connect(addr2).deposit({value: ethers.utils.parseEther('0.05')});
      await ico.connect(addr2).deposit({value: ethers.utils.parseEther('0.05')});
      await ico.connect(addr2).deposit({value: ethers.utils.parseEther('0.05')});

      await ico.connect(addr1).claim();
      await ico.connect(addr2).claim();
  
      expect(await token.balanceOf(addr1.address)).to.equal(ethers.BigNumber.from("350000000000000000000"));
      expect(await token.balanceOf(addr2.address)).to.equal(ethers.BigNumber.from("150000000000000000000"));
    });
  })
});