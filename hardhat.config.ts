import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";
import * as dotenv from "dotenv";
dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    desci: {
      url: process.env.RPC_URL || "",
      accounts: [process.env.PRIVATE_KEY || ""]
    }
  },
};

export default config;
