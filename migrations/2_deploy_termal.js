const Termal = artifacts.require("./Termal");
const TermalToken = artifacts.require("./TermalToken");
const DaiToken = artifacts.require("./DaiToken");

require('dotenv').config({path: '../.env'});

module.exports = async function (deployer) {
  let addr = await web3.eth.getAccounts();
  //local
  let daiInstance = await deployer.deploy(DaiToken, process.env.INITIAL_TOKENS, {from: addr[0]}); 
  let termalToken = await deployer.deploy(TermalToken, process.env.INITIAL_TOKENS, {from: addr[0]});
  await deployer.deploy(Termal, daiInstance.address, termalToken.address, {from: addr[0], value: 1000000000000000000});

  let termal = await Termal.deployed();
  await termalToken.transfer(termal.address, process.env.TOKENS_TO_CONTRACT, {from:addr[0]});
  await daiInstance.transfer(addr[1], process.env.TOKENS_TO_CONTRACT, {from:addr[0]});

  //kovan
  //let termalToken = await deployer.deploy(TermalToken, process.env.INITIAL_TOKENS, {from: addr[0]});
  //await deployer.deploy(Termal, "0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa", termalToken.address, {from: addr[0]});
  //let termal = await Termal.deployed();
  //await termalToken.transfer(termal.address, process.env.TOKENS_TO_CONTRACT, {from:addr[0]});

};