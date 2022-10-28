const { expectRevert } = require('@openzeppelin/test-helpers');
const Termal = artifacts.require('Termal');

const TermalToken = artifacts.require('TermalToken');
const DaiToken = artifacts.require('DaiToken');
const StartupToken = artifacts.require('StartupToken');

const StartupContract = artifacts.require('StartupContract');
const InvestorContract = artifacts.require('InvestorContract');

const InvestorsHandler = artifacts.require('InvestorsHandler');
const StartupsHandler = artifacts.require('StartupsHandler');


require('dotenv').config({path: '../.env'});

contract('Termal', (accounts) => {
  let termal = null;
  let termalToken = null;
  let dai = null;
  let investorsHandler = null;
  let startupsHandler = null;
  const _owner = accounts[0];
  const _startup = accounts[2];
  const _investor1 = accounts[3];
  const _investor2 = accounts[4];
  const _notOwner = accounts[5];
  const _notStartup = accounts[6];
  const _first = 1;
  const _second = 2;
  const _nullAddress = "0x0000000000000000000000000000000000000000";
  const _initialSupply = process.env.INITIAL_TOKENS;
  

  const _initialLoan = 1000000;
  const _interestRate = 2; 
  const _maxConvertionRate = 15;
  const _minConvertionRate = 5;
  const _termalCoinPercentage = 20;
  const _stableCoinPercentage = 80;
  const _maxProjectTime = 22;
  const _managementFee = 3;
  const _termalCoinRatio = 1;
  const _duration = 10;
  const _activeFee = 30;
    
  before(async () => {
    termal = await Termal.deployed(); 
    termalToken = await TermalToken.deployed();
    startupToken = await StartupToken.deployed();
    dai = await DaiToken.deployed();
    investorsHandler = await InvestorsHandler.deployed();
    startupsHandler = await StartupsHandler.deployed();
  });

  it('should set accounts[0] as owner', async () => {
    const owner = await termal.owner();
    assert(owner === _owner);
  });

  it('should check Ether and token termal', async () => {
    const etherContractBalance = await web3.eth.getBalance(termal.address);

    const ONE_ETHER = web3.utils.toBN(web3.utils.toWei('1'));
    
    assert(etherContractBalance == ONE_ETHER, "should be the same token address!");

    const tokenContract = await termal.termalToken();
    assert(tokenContract == termalToken.address, "should be the same token address!");

    
    const totalSupply = await termalToken.totalSupply();
    assert(totalSupply == _initialSupply)

    const balance = await termalToken.balanceOf(_owner);
    assert(balance == process.env.TOKENS_TO_CONTRACT);
  });

  it('should verify startup token balance', async () => {
    const balance = await startupToken.balanceOf(_startup);
    assert(balance == process.env.STARTUP_TOKENS, "incorrect balance");
  })

  it ('should get Handlers addresses', async () => {
    const investorsHandlerDeployed = await termal.investorsHandler();
    assert(investorsHandler.address == investorsHandlerDeployed, "Should be the same investors handler's address!");

    const startupsHandlerDeployed = await termal.startupsHandler();
    assert(startupsHandler.address == startupsHandlerDeployed, "Should be the same starutps handler's address!");
  }) 

  it ('Should register a new Investor', async () => {
    let result0 = await investorsHandler.investors(_investor1, {from: _owner});
    assert(!result0[2], "Should not be registered yet!");

    await investorsHandler.createInvestor(_investor1, "Investor 1", {from: _owner});
    await investorsHandler.createInvestor(_investor2, "Investor 2", {from: _owner});
    
    let result1 = await investorsHandler.investors(_investor1, {from: _owner});
    assert(result1[2] == true, "Should be an active investor!");

    let result2 = await investorsHandler.investors(_investor2, {from: _owner});
    assert(result2[2] == true, "Should be an active investor!");

    let totalInvestors = await investorsHandler.getTotalInvestors();
    assert(totalInvestors.toNumber() == 2);
  });

  it('send DAI to initialize investors and Contract', async () => {
    //Let send some DAI to the Investors
    await dai.transfer(_investor1, 100, {from:_owner});
    await dai.transfer(_investor2, 200, {from:_owner});

    const balance1 = await dai.balanceOf(_investor1);
    assert(balance1 == 100, "Should have 100 dai");

    const balance2 = await dai.balanceOf(_investor2);
    assert(balance2 == 200, "Should have 200 dai");

    const initialDaiBalance = await dai.balanceOf(termal.address);
    assert(initialDaiBalance.toNumber() == 0, "Initial Dai balance must be zero!");

    await dai.transfer(termal.address, 150, {from:_owner});

    const newContractDaiBalance = await dai.balanceOf(termal.address);
    assert(newContractDaiBalance.toNumber() == 150, "New balance must be 150!");
  });

  it("should create an Investor's contract ", async () => {
    const _amountToInvest = 5;

    // Verify that investor has no contract
    await expectRevert(termal.investorDepositDai(_amountToInvest, {from: _investor1}), "Investor has no contract!");
    
    // Create investor's contract
    const tx = await investorsHandler.createInvestorContract(
      _investor1, 
      _amountToInvest,
      _managementFee,
      _termalCoinRatio,
      _duration,
      _interestRate,
      {from: _owner}
      );
    
    assert(tx.receipt.status, "Investor's contract has not been created!");

    let status = await investorsHandler.getSignatureStatus(_investor1);
    assert(!status, " Signature status should be false!");

    let investorStruct = await investorsHandler.investors(_investor1);
    
    const investorContract = await InvestorContract.at(investorStruct[7]);

    await investorContract.investorSignature({from: _investor1});

    status = await investorsHandler.getSignatureStatus(_investor1);
    assert(status, "Signature status should be true!");
    
  });

 
  
 it('should receive Dai tokens from investors', async () => {
    const contractTermalBalance = await termalToken.balanceOf(termal.address);
    //console.log("Contract Termal Token Balance: ", contractTermalBalance.toString());
    assert(contractTermalBalance == process.env.TOKENS_TO_CONTRACT, "Initial balance failed!");

    const _amount = 5;

    let initialDaiContractBalance = await dai.balanceOf(termal.address);
    //console.log(initialDaiContractBalance.toNumber());

    const investorInitialBalance = await dai.balanceOf(_investor1);
    //console.log(investorInitialBalance.toString());
    await dai.approve(termal.address, _amount, {from:_investor1});
    
    await termal.investorDepositDai(_amount, {from: _investor1});

    let invested = await investorsHandler.investors(_investor1);
    //console.log(invested[4].toNumber());

    //const investorFinalBalance = await dai.balanceOf(_investor1);
    //console.log(investorFinalBalance.toString());

    //let daiContractBalance = await dai.balanceOf(termal.address);
    //console.log(daiContractBalance.toNumber());
    assert(invested[4].toNumber() == _amount, "Investor1 balance is wrong!");
    
    // Verify termal token balance
    const investorTermalBalance = await termalToken.balanceOf(_investor1);
    assert(investorTermalBalance.toNumber() == _amount, "Investor1 balance is wrong!");
    
    const investorFinalBalance = await dai.balanceOf(_investor1);
    assert(investorFinalBalance == (investorInitialBalance - _amount), "Desposit Dai has failed!");

    const contractDaiBalance = await dai.balanceOf(termal.address);
    //console.log("dai balance: ", contractDaiBalance.toNumber());
    //console.log("sum: ", initialDaiContractBalance.toNumber() + _amount);
    assert(contractDaiBalance.toNumber() == (initialDaiContractBalance.toNumber() + _amount), "Desposit Dai has failed!");
  
  });
  
  it('should register a startup', async () => {
    await startupsHandler.createStartup(_startup, "Startup 1", startupToken.address, {from: _owner});

    let newStartup = await startupsHandler.startups(_startup);
    assert(newStartup[2] == true, "Startup was not created!");

    let totalStartups = await startupsHandler.getTotalStartups();
    assert(totalStartups.toNumber() == 1);
  });

  it('should be able to create a contract', async () => {
    const tx = await startupsHandler.createStartupContract(
      _startup, 
      _initialLoan,
      _interestRate, 
      _maxConvertionRate, 
      _minConvertionRate, 
      _termalCoinPercentage, 
      _stableCoinPercentage,
      _maxProjectTime,
      _activeFee,
      {from: _owner}
      );
    
    assert(tx.receipt.status, "Contract has not been created!");
  });

  it('startup should sign a contract', async () => {
    const _startupData = await startupsHandler.startups(_startup);
    
    const contractInstance = await StartupContract.at(_startupData[4]);
    const startupWallet = await contractInstance.startupWallet();
    assert(startupWallet == _startup, "Startup wallet is incorrect!");

    const _signature = await contractInstance.signature();
    assert(!_signature, "Contract's signature should be false!");

    await expectRevert(contractInstance.startupSignature({from:_investor1}),"Only startup should accept!");
    await contractInstance.startupSignature({from: _startup});

    const _newSignature = await contractInstance.signature();
    assert(_newSignature, "Contract's signature should be true!");

    await expectRevert(contractInstance.startupSignature({from:_startup}),"Contract has been signed!");
  });

  it('should send DAI to a valid startup', async () => {
    const contractDaiBalance = await termal.getDaiContractBalance();

    const initialDaiStartupBalance = web3.utils.toBN(await dai.balanceOf(_startup));
    
    assert(initialDaiStartupBalance.toNumber() == 0, "Initial Dai balance must be zero!");
    
    const _transfer = 70;

    await termal.transferDaiToStartup(_startup, _transfer, {from: _owner});

    const newDaiBalance = await dai.balanceOf(_startup);
    assert(newDaiBalance.toNumber() == _transfer, "Startup has no DAI!");
    
    const newContractDaiBalance = await termal.getDaiContractBalance();
    assert(newContractDaiBalance.toNumber() == (contractDaiBalance - _transfer), "Termal Dai balance is wrong!");
  });

  it('should deposit tokens to contract from startup', async () => {
    const tokenAmount = 100;

    const contractInitialTokenBalance = await startupToken.balanceOf(termal.address);
    const startupInitialTokenBalance = await startupToken.balanceOf(_startup);
    
    console.log("contractInitialTokenBalance: ", contractInitialTokenBalance.toNumber());
    console.log("startupInitialTokenBalance", startupInitialTokenBalance.toNumber());
    
    //console.log("startupInitialTokenBalance: ", startupInitialTokenBalance.toNumber());

    //await expectRevert(termal.returnDaiStartup(daiAmount, {from:_notStartup}), "Startup should be valid!");

    await startupToken.approve(termal.address, tokenAmount, {from:_startup});
    await termal.depositStartupToken(tokenAmount, {from: _startup});

    //console.log(deposit);

    const contractNewTokenBalance = await startupToken.balanceOf(termal.address);
    const startupNewTokenBalance = await startupToken.balanceOf(_startup);

    await startupToken.approve(termal.address, 75, {from:_startup});
    await termal.depositStartupToken(75, {from: _startup});

    let balance = await termal.startupTokenBalance(_startup);
    console.log(balance.toNumber());

    assert(contractNewTokenBalance.toNumber() == (contractInitialTokenBalance.toNumber() + tokenAmount), "Contract Startup Token balance is wrong!");
    assert(startupNewTokenBalance.toNumber() == (startupInitialTokenBalance.toNumber() - tokenAmount), "Startup Startup balance is wrong!");

    //console.log("contractNewDaiBalance: ", contractNewDaiBalance.toNumber());
    //console.log("startupNewDaiBalance: ", startupNewDaiBalance.toNumber());

    //let startupInfo = await startupsHandler.startups(_startup);
    //assert(startupInfo[7] == daiAmount, "Dai was not returned!");
  });

  it('should return Dai to contracts from startup', async () => {
    const daiAmount = 5;

    const contractInitialDaiBalance = await dai.balanceOf(termal.address);
    const startupInitialDaiBalance = await dai.balanceOf(_startup);
    
    //console.log("contractInitialDaiBalance: ", contractInitialDaiBalance.toNumber());
    //console.log("startupInitialDaiBalance: ", startupInitialDaiBalance.toNumber());

    await expectRevert(termal.returnDaiStartup(daiAmount, {from:_notStartup}), "Startup should be valid!");

    await dai.approve(termal.address, daiAmount, {from:_startup});
    await termal.returnDaiStartup(daiAmount, {from: _startup});

    const contractNewDaiBalance = await dai.balanceOf(termal.address);
    const startupNewDaiBalance = await dai.balanceOf(_startup);

    assert(contractNewDaiBalance.toNumber() == (contractInitialDaiBalance.toNumber() + daiAmount), "Contract Dai balance is wrong!");
    assert(startupNewDaiBalance.toNumber() == (startupInitialDaiBalance.toNumber() - daiAmount), "Startup Dai balance is wrong!");

    //console.log("contractNewDaiBalance: ", contractNewDaiBalance.toNumber());
    //console.log("startupNewDaiBalance: ", startupNewDaiBalance.toNumber());

    let startupInfo = await startupsHandler.startups(_startup);
    assert(startupInfo[7] == daiAmount, "Dai was not returned!");
  });
});

