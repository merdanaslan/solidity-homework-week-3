import * as dotenv from 'dotenv';
import { deployContract } from "./common";
dotenv.config();

async function main() {
  console.log("Deploying Ballot contract");

  const ballotContract = await deployContract();
  
  const address = await ballotContract.getAddress();
  console.log(`Contract deployed at address ${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});