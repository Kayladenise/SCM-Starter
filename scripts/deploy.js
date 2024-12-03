const hre = require("hardhat");

async function main() {
  const initBalance = hre.ethers.utils.parseEther("1.0"); //converted to 1 ETH to wei
  const Assessment = await hre.ethers.getContractFactory("Assessment");
  const assessment = await Assessment.deploy(initBalance, { value: initBalance }); 

  await assessment.deployed();

  console.log(`Contract deployed with initial balance of 1 ETH to: ${assessment.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
  