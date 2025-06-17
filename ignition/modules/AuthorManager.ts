// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";


const AuthorModule = buildModule("AuthorModule", (m) => {

  const sol = m.contract("AuthorManager");

  return { sol };
});

export default AuthorModule;
