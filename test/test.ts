import { expect } from "chai";
import { ethers } from "hardhat";
import { TokenSale, ERC20, MyERC20Token, MyERC721 } from "../typechain-types";
import {loadFixture} from "@nomicfoundation/hardhat-network-helpers";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
const RATIO: bigint = 10n;

describe("NFT Shop", async () => {
  let tokenSaleContract: TokenSale;
  let paymentTokenContract: ERC20;
  let accounts: HardhatEthersSigner[];
  let deployer: HardhatEthersSigner;
  let account1: HardhatEthersSigner;
  let account2: HardhatEthersSigner;
  let nftContract: MyERC721;

  async function deployContracts() {
    const myTokenContractFactory = await ethers.getContractFactory("MyERC20Token");
    const paymentTokenContract_ = await myTokenContractFactory.deploy();
    await paymentTokenContract_.waitForDeployment();

    const paymentTokenContractAddress = await paymentTokenContract_.getAddress();

    const nftContractFactory = await ethers.getContractFactory("MyERC721");
    const nftTokenContract_ = await nftContractFactory.deploy();
    await nftTokenContract_.waitForDeployment();

    const nftTokenContractAddress = await nftTokenContract_.getAddress();

    const tokenSalecontractFactory = await ethers.getContractFactory("TokenSale");
    const tokenSaleContract_ = await tokenSalecontractFactory.deploy(RATIO, paymentTokenContractAddress, nftTokenContractAddress);
    await tokenSaleContract_.waitForDeployment();

    const tokenSaleContractAddress = await tokenSaleContract_.getAddress();
    const MINTER_ROLE = await paymentTokenContract_.MINTER_ROLE();
    const giveRoleTx = await paymentTokenContract_.grantRole(MINTER_ROLE, tokenSaleContractAddress);
    await giveRoleTx.wait();
    
    return { tokenSaleContract_, paymentTokenContract_, nftTokenContract_ }
  }
  beforeEach(async () => {
    accounts = await ethers.getSigners();
    [deployer, account1, account2] = await ethers.getSigners();
    const { tokenSaleContract_, paymentTokenContract_, nftTokenContract_ } = await loadFixture(deployContracts);
    tokenSaleContract = tokenSaleContract_;
    paymentTokenContract = paymentTokenContract_;
    nftContract = nftTokenContract_;
  });

  describe("When the Shop contract is deployed", async () => {
    it("defines the ratio as provided in parameters", async () => {
      const ratio = await tokenSaleContract.ratio();
      expect(RATIO).to.eq(ratio);
    });

    it("uses a valid ERC20 as payment token", async () => {
      const paymentTokenAddress = await tokenSaleContract.paymentToken();
      const tokenContractFactory = await ethers.getContractFactory("ERC20");
      const paymentToken: ERC20 = tokenContractFactory.attach(paymentTokenAddress) as ERC20;
      await expect(paymentToken.balanceOf(ethers.ZeroAddress)).not.to.be.reverted;
      await expect(paymentToken.totalSupply()).not.to.be.reverted;
    });
  });

  describe("When a user buys an ERC20 from the Token contract", async () => {
    const TEST_ETH_VALUE = ethers.parseUnits("1");

    let ETH_BALANCE_BEFORE_TX: bigint;
    let ETH_BALANCE_AFTER_TX: bigint;
    let TOKEN_BALANCE_BEFORE_TX: bigint;
    let TOKEN_BALANCE_AFTER_TX: bigint;
    let TX_FEES: bigint;

    beforeEach(async () => {
      ETH_BALANCE_BEFORE_TX = await ethers.provider.getBalance(account1.address);
      TOKEN_BALANCE_BEFORE_TX = await paymentTokenContract.balanceOf(account1.address);
      const buyTokensTx = await tokenSaleContract.connect(account1).buyTokens({value: TEST_ETH_VALUE});
      const receipt = await buyTokensTx.wait();
      const gasUsed = receipt?.gasUsed ?? 0n;
      const gasPrice = receipt?.gasPrice ?? 0n;
      TX_FEES = gasUsed * gasPrice;
      ETH_BALANCE_AFTER_TX = await ethers.provider.getBalance(account1.address);
      TOKEN_BALANCE_AFTER_TX = await paymentTokenContract.balanceOf(account1.address);
    });  
    it("gives the correct amount of tokens", async () => {
      const diff = TOKEN_BALANCE_AFTER_TX - TOKEN_BALANCE_BEFORE_TX;
      const expectedDiff = TEST_ETH_VALUE * RATIO;
      expect(diff).to.eq(expectedDiff);
    });

    it("charges the correct amount of ETH", async () => {
      const diff = ETH_BALANCE_BEFORE_TX - ETH_BALANCE_AFTER_TX;
      const expectedDiff = TEST_ETH_VALUE + TX_FEES;
      expect(diff).to.eq(expectedDiff);
    });
  });

  describe("When a user burns an ERC20 at the Shop contract", async () => {
    it("gives the correct amount of ETH", async () => {
      throw new Error("Not implemented");
    });

    it("burns the correct amount of tokens", async () => {
      throw new Error("Not implemented");
    });
  });

  describe("When a user buys an NFT from the Shop contract", async () => {
    it("charges the correct amount of ERC20 tokens", async () => {
      throw new Error("Not implemented");
    });

    it("gives the correct NFT", async () => {
      throw new Error("Not implemented");
    });
  });

  describe("When a user burns their NFT at the Shop contract", async () => {
    it("gives the correct amount of ERC20 tokens", async () => {
      throw new Error("Not implemented");
    });
  });

  describe("When the owner withdraws from the Shop contract", async () => {
    it("recovers the right amount of ERC20 tokens", async () => {
      throw new Error("Not implemented");
    });

    it("updates the owner pool account correctly", async () => {
      throw new Error("Not implemented");
    });
  });
});