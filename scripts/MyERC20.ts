import { ethers } from 'hardhat';

async function main() {
    const accounts = await ethers.getSigners();

    const tokenContractFactory = await ethers.getContractFactory("MyERC20Token");
    const tokenContract = await tokenContractFactory.deploy();
    await tokenContract.waitForDeployment();

    // Fetching the balances from some accounts
    const myBalance = await tokenContract.balanceOf(accounts[0].address);

    console.log(`My Balance is ${myBalance.toString()} decimals units`);
  
    const otherBalance = await tokenContract.balanceOf(accounts[1].address);
  
    console.log(
  
      `The Balance of Acc1 is ${otherBalance.toString()} decimals units`
  
    );

    const code = await tokenContract.MINTER_ROLE();
    console.log(`The code is ${code}`);

    const minTx = await tokenContract.connect(accounts[0]).mint(accounts[0].address, 2);
    await minTx.wait();

}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });