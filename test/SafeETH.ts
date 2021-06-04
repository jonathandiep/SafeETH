import { ethers } from 'hardhat';
import { BigNumber, Contract, Signer, utils } from 'ethers';
import { assert, expect } from 'chai';

describe('SafeETH', function () {
  let contract: Contract;
  let account0: Signer;
  let account1: Signer;
  let account0Address: string;
  let account1Address: string;

  beforeEach(async () => {
    account0 = ethers.provider.getSigner(0);
    account0Address = await account0.getAddress();
    account1 = ethers.provider.getSigner(1);
    account1Address = await account1.getAddress();

    const SafeETH = await ethers.getContractFactory('SafeETH');
    contract = await SafeETH.deploy();
    await contract.deployed();
  });

  it('should have 0 tokens when deployed', async () => {
    const totalSupply: BigNumber = await contract.totalSupply();
    assert.equal(
      totalSupply.toString(),
      '0',
      'Expected 0 tokens upon deployment'
    );
  });

  it('SafeETH balance should increase after minting', async () => {
    await contract.connect(account0).mint({ value: utils.parseEther('6.9') });

    const dawgTokenCount: BigNumber = await contract.balanceOf(account0Address);
    assert.isTrue(
      dawgTokenCount.toString() === '690000000000000000000000',
      'Expected DAWG token balance to be 690000000000000000000000'
    );

    const contractBalance = await ethers.provider.getBalance(contract.address);
    assert.equal(
      utils.formatEther(contractBalance),
      '6.9',
      'Balance in smart contract should be 6.9'
    );
  });

  describe.only('SafeETH balance should decrease after burning', () => {
    it('should revert', async () => {
      let ex;
      try {
        await contract.connect(account0).burn('1000');
      } catch (_ex) {
        ex = _ex;
      }
      assert(
        ex,
        "Should not be able to burns tokens when user doesn't have any"
      );
    });

    it('SafeETH balance should decrease after burning', async () => {
      await contract.connect(account0).mint({ value: utils.parseEther('4.2') });
      const ethPreBurnBalance = await ethers.provider.getBalance(
        account0Address
      );
      const safeEthPreBurnBalance = await contract.balanceOf(account0Address);

      await contract.connect(account0).burn(utils.parseEther('120000'));
      const ethPostBurnBalance = await ethers.provider.getBalance(
        account0Address
      );
      const safeEthPostBurnBalance = await contract.balanceOf(account0Address);

      assert.isTrue(
        ethPreBurnBalance.lt(ethPostBurnBalance),
        'ETH balance should increase after burn'
      );
      assert.isTrue(
        safeEthPreBurnBalance.gt(safeEthPostBurnBalance),
        'SafeETH balance should decrease after burn'
      );
    });
  });
});
