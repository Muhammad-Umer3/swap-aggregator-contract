import { ethers } from "hardhat";

async function main() {

  const swappingAggregator = await ethers.deployContract("SwappingAggregator");
  await swappingAggregator.waitForDeployment();
  console.log("Swapping Aggregator: " + await swappingAggregator.getAddress());

  const AMM = await ethers.deployContract("AMM");
  const AMM2 = await ethers.deployContract("AMM");

  await Promise.allSettled([AMM.waitForDeployment(), AMM2.waitForDeployment()])

  console.log("First AMM: " + await AMM.getAddress())
  console.log("Second AMM: " + await AMM2.getAddress());

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
