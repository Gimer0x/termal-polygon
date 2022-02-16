const Termal = artifacts.require("./Termal");
const TermalToken = artifacts.require("./TermalToken");
const DaiToken = artifacts.require("./DaiToken");
const InvestorsHandler = artifacts.require("./InvestorsHandler");
const StartupsHandler = artifacts.require("./StartupsHandler");

require('dotenv').config({path: '../.env'});

module.exports = async function (deployer, network, accounts) {
  let addr = await web3.eth.getAccounts();

  console.log("Deployer's account: ", addr[0]);
  if (network == "local"){
    let daiInstance = await deployer.deploy(DaiToken, process.env.INITIAL_TOKENS, {from: addr[0]}); 
    let termalToken = await deployer.deploy(TermalToken, process.env.INITIAL_TOKENS, {from: addr[0]});
    let investorsHandler = await deployer.deploy(InvestorsHandler, {from: addr[0]});
    let startupsHandler = await deployer.deploy(StartupsHandler, {from: addr[0]});

    await deployer.deploy(Termal, daiInstance.address, termalToken.address, investorsHandler.address, startupsHandler.address, {from: addr[0], value: 1000000000000000000});

    let termal = await Termal.deployed();
    await termalToken.transfer(termal.address, process.env.TOKENS_TO_CONTRACT, {from:addr[0]});
    
    await daiInstance.transfer(process.env.INVESTOR_ACCOUNT_1, process.env.DAI_TO_INVESTOR, {from:addr[0]});

    await daiInstance.transfer(process.env.INVESTOR_ACCOUNT_2, process.env.DAI_TO_INVESTOR, {from:addr[0]});
  }
  else if (network == "kovan") {
    let termalToken = await deployer.deploy(TermalToken, process.env.INITIAL_TOKENS, {from: addr[0]});
    let investorsHandler = await deployer.deploy(InvestorsHandler, {from: addr[0]});
    let startupsHandler = await deployer.deploy(StartupsHandler, {from: addr[0]});

    await deployer.deploy(Termal, "0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa", termalToken.address, investorsHandler.address, startupsHandler.address, {from: addr[0]});
    let termal = await Termal.deployed();
    await termalToken.transfer(termal.address, process.env.TOKENS_TO_CONTRACT, {from:addr[0]});

  }
  else if (network == "mumbai"){
    let daiInstance = await deployer.deploy(DaiToken, process.env.INITIAL_TOKENS, {from: addr[0]});
    let termalToken = await deployer.deploy(TermalToken, process.env.INITIAL_TOKENS, {from: addr[0]});
    let investorsHandler = await deployer.deploy(InvestorsHandler, {from: addr[0]});
    let startupsHandler = await deployer.deploy(StartupsHandler, {from: addr[0]});

    await deployer.deploy(Termal, daiInstance.address, termalToken.address, investorsHandler.address, startupsHandler.address, {from: addr[0]});

    let termal = await Termal.deployed();
    
    await termalToken.transfer(termal.address, process.env.TOKENS_TO_CONTRACT, {from:addr[0]});
    await daiInstance.transfer(process.env.INVESTOR_ACCOUNT_MATIC, process.env.DAI_TO_INVESTOR, {from:addr[0]});
  }
};