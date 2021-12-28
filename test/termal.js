const { expectRevert } = require('@openzeppelin/test-helpers');
const Termal = artifacts.require('Termal');
const TermalToken = artifacts.require('TermalToken');
const DaiToken = artifacts.require('DaiToken');
const StartupContract = artifacts.require('StartupContract');

require('dotenv').config({path: '../.env'});

contract('Termal', (accounts) => {
  let termal = null;
  let termalToken = null;
  let dai = null;
  const _owner = accounts[0];
  const _startup = accounts[5];
  const _investor1 = accounts[2];
  const _investor2 = accounts[3];
  const _notOwner = accounts[4];
  const _notStartup = accounts[6];
  const _first = 1;
  const _second = 2;
  const _nullAddress = "0x0000000000000000000000000000000000000000";
  const _initialSupply = process.env.INITIAL_TOKENS;

  const _initialLoan = 100;
  const _interestRate = 2; 
  const _maxConvertionRate = 15;
  const _minConvertionRate = 5;
  const _termalCoinPercentage = 20;
  const _stableCoinPercentage = 80;
  const _maxProjectTime = 18;
    
  before(async () => {
    termal = await Termal.deployed(); 
    termalToken = await TermalToken.deployed();
    dai = await DaiToken.deployed();
  });

  it('Should set accounts[0] as owner', async () => {
    const owner = await termal.owner();
    assert(owner === _owner);
  });

  it('Should check Ether and token termal', async () => {
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

  it ('Should register a new Investor', async () => {
    let result0 = await termal.investors(_investor1, {from: _owner});
    assert(!result0[2], "Should not be registered yet!");

    await termal.createInvestor(_investor1, "Investor 1", {from: _owner});
    await termal.createInvestor(_investor2, "Investor 2", {from: _owner});
    
    let result1 = await termal.investors(_investor1, {from: _owner});
    assert(result1[2] == true, "Should be an active investor!");

    let result2 = await termal.investors(_investor2, {from: _owner});
    assert(result2[2] == true, "Should be an active investor!");

    let totalInvestors = await termal.getTotalInvestors();
    assert(totalInvestors.toNumber() == 2);
  });

  it('Send DAI to initialize investors and Contract', async () => {
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

  it('Contract should receive Dai tokens from investors', async () => {
    const contractTermalBalance = await termalToken.balanceOf(termal.address);
    //console.log("Contract Termal Token Balance: ", contractTermalBalance.toString());
    assert(contractTermalBalance == process.env.TOKENS_TO_CONTRACT, "Initial balance failed!");

    const amount = 5;

    const investorInitialBalance = await dai.balanceOf(_investor1);
    await dai.approve(termal.address, amount, {from:_investor1});
    await termal.depositDai(amount, {from: _investor1});
    let invested = await termal.investors(_investor1);
    assert(invested[4].toNumber() == amount, "Investor1 balance is wrong!");
    
    const investorTermalBalance = await termalToken.balanceOf(_investor1);
    assert(investorTermalBalance.toNumber() == amount, "Investor1 balance is wrong!");
    
    const investorFinalBalance = await dai.balanceOf(_investor1);
    assert(investorFinalBalance == (investorInitialBalance - amount), "Desposit Dai has failed!");

    const contractDaiBalance = await dai.balanceOf(termal.address);
    assert(contractDaiBalance.toNumber() == 155, "Desposit Dai has failed!");

    await dai.approve(termal.address, 2 * amount, {from:_investor2});
    await termal.depositDai(2 * amount, {from: _investor2});

    await dai.approve(termal.address, amount, {from:_investor1});
    await termal.depositDai(amount, {from: _investor1});

    const newDaiBalance = await termal.getDaiContractBalance();
    assert(newDaiBalance.toNumber() == (150 + (4 * amount)), "Balance is wrong!");
  
  });

  it('Should register a startup', async () => {
    await termal.createStartup(_startup, "Startup 1", {from: _owner});

    let newStartup = await termal.startups(_startup);
    assert(newStartup[2] == true, "Startup was not created!");

    let totalStartups = await termal.getTotalStartups();
    assert(totalStartups.toNumber() == 1);
  });

  it('Should be able to create a contract', async () => {
    const tx = await termal.createStartupContract(
      _startup, 
      _initialLoan,
      _interestRate, 
      _maxConvertionRate, 
      _minConvertionRate, 
      _termalCoinPercentage, 
      _stableCoinPercentage,
      _maxProjectTime,
      {from: _owner}
      );
    
    //console.log
    assert(tx.receipt.status, "Contract has not been created!");
  });

  it('Startup should sign a contract', async () => {
    const _startupData = await termal.startups(_startup);
    
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

  it('Contract should send DAI to a valid startup', async () => {
    const contractDaiBalance = await termal.getDaiContractBalance();

    const initialDaiStartupBalance = web3.utils.toBN(await dai.balanceOf(_startup));
    
    assert(initialDaiStartupBalance.toNumber() == 0, "Initial Dai balance must be zero!");
    
    const _transfer = 70;

    await termal.transferDai(_startup, _transfer, {from: _owner});

    const newDaiBalance = await dai.balanceOf(_startup);
    assert(newDaiBalance.toNumber() == _transfer, "Startup has no DAI!");
    
    const newContractDaiBalance = await termal.getDaiContractBalance();
    assert(newContractDaiBalance.toNumber() == (contractDaiBalance - _transfer), "Termal Dai balance is wrong!");
  });

  it('Startup can return Dai to contracts', async () => {
    const daiAmount = 5;

    const contractInitialDaiBalance = await dai.balanceOf(termal.address);
    const startupInitialDaiBalance = await dai.balanceOf(_startup);
    
    //console.log("contractInitialDaiBalance: ", contractInitialDaiBalance.toNumber());
    //console.log("startupInitialDaiBalance: ", startupInitialDaiBalance.toNumber());

    await expectRevert(termal.returnDaiStartup(daiAmount, {from:_notStartup}), "Startup is not registered!");

    await dai.approve(termal.address, daiAmount, {from:_startup});
    await termal.returnDaiStartup(daiAmount, {from: _startup});

    const contractNewDaiBalance = await dai.balanceOf(termal.address);
    const startupNewDaiBalance = await dai.balanceOf(_startup);

    assert(contractNewDaiBalance.toNumber() == (contractInitialDaiBalance.toNumber() + daiAmount), "Contract Dai balance is wrong!");
    assert(startupNewDaiBalance.toNumber() == (startupInitialDaiBalance.toNumber() - daiAmount), "Startup Dai balance is wrong!");

    //console.log("contractNewDaiBalance: ", contractNewDaiBalance.toNumber());
    //console.log("startupNewDaiBalance: ", startupNewDaiBalance.toNumber());

    let startupInfo = await termal.startups(_startup);
    assert(startupInfo[7] == daiAmount, "Dai was not returned!");
  });
});

