import { ethers } from "hardhat";

async function main() {
  const Factory = await ethers.getContractFactory("ArticleRegistry");
  const contract = await Factory.deploy();

  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("✅ Contract deployed to:", address);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
