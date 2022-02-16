import React, { useState, useEffect } from 'react';
//import talemLogo from './talem.jpg';
import termalLogo from './termal.png';
//import DaiToken from './contracts/Dai.json';

//Matic
import DaiToken from './contracts/DaiToken.json';
import Termal from './contracts/Termal.json';

import InvestorsHandler from './contracts/InvestorsHandler.json';
import StartupsHandler from './contracts/StartupsHandler.json';

import TermalToken from './contracts/TermalToken.json';

import StartupContract from './contracts/StartupContract.json';
import InvestorContract from './contracts/InvestorContract.json';

import { getWeb3 } from  './utils.js';

function App() {
  
  const [web3, setWeb3] = useState(undefined);
  const [accounts, setAccounts] = useState(undefined);
  const [termal, setContract] = useState(undefined);
  const [termalAddress, setTermalAddress] = useState(undefined);
  const [investorsHandler, setInvestorsHandler] = useState(undefined);
  const [startupsHandler, setStartupsHandler] = useState(undefined);

  const [termalTokenContract, setTermalTokenContract] = useState(undefined);
  const [daiContract, setDaiContract] = useState(undefined);
  const [owner, setOwner] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [daiContractBalance, setDaiContractBalance] = useState(undefined);
  const [termalContractBalance, setTermalContractBalance] = useState(undefined);
  const [totalInvestors, setTotalInvestors] = useState(undefined);
  const [totalStartups, setTotalStartups] = useState(undefined);
  const [daiInvested, setDaiInvested] = useState(undefined);
  const [termalReceived, setTermalReceived] = useState(undefined);
  const [termalBalance, setTermalBalance] = useState(undefined);
  const [validStartup, setValidStartup] = useState(undefined);

  const [startupContract, setStartupContract] = useState(undefined);
  const [investorContract, setInvestorContract] = useState(undefined);

  const [isSigned, setIsSigned] = useState(undefined);
  const [isInvestorContractSigned, setIsInvestorContractSigned] = useState(undefined);
  
  useEffect(() => {

      if(window.ethereum) {
        window.ethereum.on('chainChanged', () => {
          window.location.reload();
        })
        window.ethereum.on('accountsChanged', () => {
          window.location.reload();
        })
      }

      const init = async () => {
      const web3 = await getWeb3();
      const accounts = await web3.eth.getAccounts();

      const networkId = await web3.eth.net.getId();
      console.log(networkId);
      const termalDeployedNetwork = await Termal.networks[networkId];
      const investorsHandlerDeployedNetwork = await InvestorsHandler.networks[networkId];
      const startupsHandlerDeployedNetwork = await StartupsHandler.networks[networkId];
      const termalTokenDeployedNetwork = await TermalToken.networks[networkId];

      //local
      const daiDeployedNetwork = await DaiToken.networks[networkId];
            
      const termal = new web3.eth.Contract(
        Termal.abi,
        termalDeployedNetwork && termalDeployedNetwork.address
      );
      console.log("Termal Address:", termalDeployedNetwork.address);

      const investorsHandler = new web3.eth.Contract(
        InvestorsHandler.abi,
        investorsHandlerDeployedNetwork && investorsHandlerDeployedNetwork.address
      );

      console.log("InvestorsHandler Address:", investorsHandlerDeployedNetwork.address);

      const startupsHandler = new web3.eth.Contract(
        StartupsHandler.abi,
        startupsHandlerDeployedNetwork && startupsHandlerDeployedNetwork.address
      );

      console.log("StartupsHandler Address:", startupsHandlerDeployedNetwork.address);

      //HEroku: https://desolate-tundra-94662.herokuapp.com/

      const termalToken = new web3.eth.Contract(
        TermalToken.abi,
        termalTokenDeployedNetwork && termalTokenDeployedNetwork.address
      );

      console.log("Termal Token Address: ", termalTokenDeployedNetwork.address);

      //local deployment
      const daiContract = new web3.eth.Contract(
        DaiToken.abi,
        daiDeployedNetwork && daiDeployedNetwork.address
      );

      //kovan network: 0xb85f36f14144359a7599f19c90D7A95c8b775BCA
      /*const daiContract = new web3.eth.Contract(
        DaiToken.abi,
        DaiToken.address
      );*/

      console.log("Dai Token Address: ", daiDeployedNetwork.address)
      const ownerBalance = await daiContract.methods.balanceOf(accounts[0]).call();
      console.log("Dai Owner Balance", ownerBalance);

      const balance = await termal.methods.getTermalBalance(termalDeployedNetwork.address).call();
      const _balance = parseFloat(balance / (10 ** 18)).toFixed(2);
      setBalance(_balance);
      console.log("Termal Contract Balance", balance);

      setWeb3(web3);
      setContract(termal);
      setInvestorsHandler(investorsHandler);
      setStartupsHandler(startupsHandler);
      setDaiContract(daiContract);
      setAccounts(accounts);
      
      setTermalAddress(termalDeployedNetwork.address);
      setTermalTokenContract(termalToken);
                  
      const _owner = await termal.methods.owner().call();
      setOwner(_owner);
      
      const totalInvestors = await investorsHandler.methods.getTotalInvestors().call();
      console.log("Total investors: ", totalInvestors)
      setTotalInvestors(totalInvestors);

      const totalStartups = await startupsHandler.methods.getTotalStartups().call();
      setTotalStartups(totalStartups);
      
      
      const daiContractBalance = await termal.methods.getDaiContractBalance().call();
      const _daiContractBalance = parseFloat(daiContractBalance / (10 ** 18)).toFixed(2);
      setDaiContractBalance(_daiContractBalance);
      console.log("Dai Contract Balance", _daiContractBalance);
    }
    init();
    
  }, []);

  async function initInfo(e) {
    e.preventDefault();
    try{
      const _owner = await termal.methods.owner().call();
      console.log(_owner);
      setOwner(_owner);

      let _balance = await termal.methods.getTermalBalance(_owner).call();
      setBalance(_balance);
    } catch(e){
      console.error(e);
    }
  }

  async function getTermalBalance(e) {
    e.preventDefault();
    const _address = e.target.elements[0].value;
    
    try{
      const termalBalance = await termal.methods.getTermalBalance(_address).call();
      const _termalBalance = parseFloat(termalBalance / (10 ** 18)).toFixed(2);
      setTermalBalance(_termalBalance);
    } catch(e){
      console.error(e);
    }
  }

  async function createInvestor(e) {
    e.preventDefault();
    const _address = e.target.elements[0].value;
    const _name = e.target.elements[1].value;

    console.log(_address);
    console.log(_name);
    try{
      await investorsHandler.methods.createInvestor(_address, _name).send({from: accounts[0]});
    } catch(e){
      console.error(e);
    }

    window.location.reload();
  }

  async function getDaiInvested(e) {
    e.preventDefault();
    const _address = e.target.elements[0].value;
    try{
      let result = await investorsHandler.methods.investors(_address).call();
      const _result4 = parseFloat(result[4] / (10 ** 18)).toFixed(2);
      setDaiInvested(_result4);

      const _result5 = parseFloat(result[5] / (10 ** 18)).toFixed(2);
      setTermalReceived(_result5);
    } catch(e){
      console.error(e);
    }
  }

  async function isValidStartup(e) {
    e.preventDefault();
    const _address = e.target.elements[0].value;
    try{
      let result = await startupsHandler.methods.startups(_address).call();
      setValidStartup(result[2]);
    } catch(e){
      console.error(e);
    }
  }

  async function createStartup(e) {
    e.preventDefault();
    const _address = e.target.elements[0].value;
    const _name = e.target.elements[1].value;
    
    try{
      let tx = await startupsHandler.methods.createStartup(_address, _name).send({from: accounts[0]});
      const startupProfileAddress = tx.events.LogCreateStartup.returnValues._newStartupAddress;
      console.log("Startup Profile: ", startupProfileAddress);
    } catch(e){
      console.error(e);
    }

    window.location.reload();
  }

  async function sendDaiToStartup(e) {
    e.preventDefault();
    const _startup = e.target.elements[0].value;
    const _daiAmount = e.target.elements[1].value;
    const _DAI_AMOUNT_WEI = web3.utils.toWei(_daiAmount.toString());
    try{
      await termal.methods.transferDaiToStartup(
        _startup,
        _DAI_AMOUNT_WEI
      )
      .send({from: accounts[0], gas: 6485876});
    } catch(e){
      console.error(e);
    }
    window.location.reload();
  }

  async function sendTermal(e) {
    e.preventDefault();
    const _receiver = e.target.elements[0].value;
    const _termalAmount = e.target.elements[1].value;
    const _TERMAL_AMOUNT_WEI = web3.utils.toWei(_termalAmount.toString());
    
    try{
      await termal.methods.transferTermal(
        _receiver,
        _TERMAL_AMOUNT_WEI
        )
      .send({from: accounts[0], gas: 6485876});
    } catch(e){
      console.error(e);
    }
    window.location.reload();
  }

  async function depositDai(e) {
    e.preventDefault();
    const _daiAmount = e.target.elements[0].value;
    const _DAI_AMOUNT_WEI = web3.utils.toWei(_daiAmount.toString());
    console.log("Dai Address", _DAI_AMOUNT_WEI);
    
    try{
      await daiContract.methods.approve(termalAddress, _DAI_AMOUNT_WEI).send({from: accounts[0]});
      console.log("Selected address:", accounts[0]);
      await termal.methods.investorDepositDai(
        _DAI_AMOUNT_WEI
        )
      .send({from: accounts[0], gas: 6485876});
    } catch(e){
      console.error(e);
    }
    window.location.reload();
  }

  async function getStartupContractInfo(e) {
    e.preventDefault();
    const _wallet = e.target.elements[0].value;
    try{
      let results = await startupsHandler.methods.startups(_wallet).call();
      setStartupContract(results[4]);

      const startupContractAddress = results[4];
      const contractInstance = new web3.eth.Contract(
        StartupContract.abi,
        startupContractAddress
      );

      const _isSigned = await contractInstance.methods.signature().call();
      setIsSigned(_isSigned);
    } catch(e){
      console.error(e);
    }
    
  }

  async function getInvestorContractInfo(e) {
    e.preventDefault();
    const _wallet = e.target.elements[0].value;
    console.log(_wallet);
    try{
      let results = await investorsHandler.methods.investors(_wallet).call();
      setInvestorContract(results[7]);

      const investorContractAddress = results[7];
      console.log(investorContractAddress);

      const contractInstance = new web3.eth.Contract(
        InvestorContract.abi,
        investorContractAddress
      );

      const _isInvestorContractSigned = await contractInstance.methods.signature().call();
      setIsInvestorContractSigned(_isInvestorContractSigned);
    } catch(e){
      console.error(e);
    }
    
  }

  async function signInvestorContract(e) {
    e.preventDefault();
    try{
      let results = await investorsHandler.methods.investors(accounts[0]).call();

      
      console.log("Sender :", accounts[0]);
      console.log("has contract:", results[6]);
      console.log("contract:", results[7]);

      const netId = await web3.eth.net.getId();
      console.log("NetId", netId);
          
      if(results[6]){ 
          const investorContractAddress = results[7];
          const contractInstance = new web3.eth.Contract(
              InvestorContract.abi,
              investorContractAddress
          );

          const wallet = await contractInstance.methods.investorWallet().call();
          console.log("Instance:", wallet);

          const tx = await contractInstance.methods.investorSignature().send({from: accounts[0]});
          console.log(tx);
      }
    } catch(e){
      console.error(e);
    }
    window.location.reload();
  }

  async function signStartupContract(e) {
    e.preventDefault();
    try{
      let results = await startupsHandler.methods.startups(accounts[0]).call();

      
      console.log("Sender :", accounts[0]);
      console.log("has contract:", results[3]);
      console.log("contract:", results[4]);

      const netId = await web3.eth.net.getId();
      console.log("NetId", netId);
          
      if(results[3]){ 
          const startupContractAddress = results[4];
          const contractInstance = new web3.eth.Contract(
              StartupContract.abi,
              startupContractAddress
          );

          const wallet = await contractInstance.methods.startupWallet().call();
          console.log("Instance:", wallet);

          const tx = await contractInstance.methods.startupSignature().send({from: accounts[0]});
          console.log(tx);
      }
    } catch(e){
      console.error(e);
    }
    window.location.reload();
  }

  async function returnDai(e) {
    e.preventDefault();
    const _daiAmount = e.target.elements[0].value;
    const _DAI_AMOUNT_WEI = web3.utils.toWei(_daiAmount.toString());
    
    try{
      await daiContract.methods.approve(termalAddress, _DAI_AMOUNT_WEI).send({from: accounts[0]});
      await termal.methods.returnDaiStartup(
        _DAI_AMOUNT_WEI
        )
      .send({from: accounts[0], gas: 6485876});

      const newDaiContractBalance = await daiContract.methods.balanceOf(termalAddress).call();
      setDaiContractBalance(newDaiContractBalance);
    } catch(e){
      console.error(e);
    }
    window.location.reload();
  }

  async function returnTermal(e) {
    e.preventDefault();
    const _termalAmount = e.target.elements[0].value;
    const _TERMAL_AMOUNT_WEI = web3.utils.toWei(_termalAmount.toString());
    
    try{
      await termalTokenContract.methods.approve(termalAddress, _TERMAL_AMOUNT_WEI).send({from: accounts[0]});
      await termal.methods.returnTermalStartup(
        _TERMAL_AMOUNT_WEI
        )
      .send({from: accounts[0], gas: 6485876});

      const newTermalContractBalance = await termalTokenContract.methods.balanceOf(termalAddress).call();
      setTermalContractBalance(newTermalContractBalance);
    } catch(e){
      console.error(e);
    }
    window.location.reload();
  }

  async function createStartupContract(e) {
    e.preventDefault();
    const _startupAddress = e.target.elements[0].value;
    const _initialLoan = e.target.elements[1].value;
    const _interestRate = e.target.elements[2].value;
    const _maxConvertionRate = e.target.elements[3].value;
    const _minConvertionRate = e.target.elements[4].value;
    const _termalCoinPercentage = e.target.elements[5].value;
    const _stableCoinPercentage = e.target.elements[6].value;
    const _maxProjectime = e.target.elements[7].value;

    console.log(_startupAddress, _initialLoan, _interestRate, _maxConvertionRate, _minConvertionRate, _termalCoinPercentage, _stableCoinPercentage, _maxProjectime);

    try{
      const tx = await startupsHandler.methods.createStartupContract(
          _startupAddress,
          _initialLoan,
          _interestRate,
          _maxConvertionRate,
          _minConvertionRate,
          _termalCoinPercentage,
          _stableCoinPercentage,
          _maxProjectime
          )
        .send({from: accounts[0]});

        console.log("StartupContract:", tx);
    } catch(e){
      console.error(e);
    }
    window.location.reload();
  }

  async function createInvestorContract(e) {
    e.preventDefault();
    const _investorAddress = e.target.elements[0].value;
    const _initialInvestment = e.target.elements[1].value;
    const _managementFee = e.target.elements[2].value;
    const _termalCoinRatio = e.target.elements[3].value;
    const _duration = e.target.elements[4].value;
    const _interestRate = e.target.elements[5].value;

    console.log(_investorAddress, _initialInvestment, _managementFee, _termalCoinRatio, _duration, _interestRate);

    try{
      const tx = await investorsHandler.methods.createInvestorContract(
          _investorAddress,
          _initialInvestment,
          _managementFee,
          _termalCoinRatio,
          _duration,
          _interestRate
          )
        .send({from: accounts[0]});

        console.log("Investor Contract:", tx);
    } catch(e){
      console.error(e);
    }
    window.location.reload();
  }
  
  if(!web3) {
    return <div>Loading...</div>
  }


  return (
    <div className="container">
      <img src={termalLogo} alt="Talem" width="120" height="140" className="center"></img>
      <p></p><p></p>
      <div className="row">
        <div className="col-sm-7">
          <h2>Owner Info</h2>
          <form onSubmit= {e => initInfo(e)}>
            <button type="submit" className="btn btn-primary">Submit</button>
            <p></p>
            <p>{owner && `Owner: ${owner}`}</p>
            <p>{daiContractBalance && `Contract Dai Balance: ${daiContractBalance}`}</p>
            <p>{balance && `Contract Termal Token Balance: ${balance}`}</p>
          </form>
          <p></p>
          <h2>Create Investor</h2>
          <form onSubmit= {e => createInvestor(e)}>
            <div className="form-group">
              <label htmlFor="investor">Investor's Wallet: </label>
              <input type="text" className="form-control" id="investor" />

              <label htmlFor="investorName">Investor's Name: </label>
              <input type="text" className="form-control" id="investorName" />
              <p>{totalInvestors && `Total Investors: ${totalInvestors}`}</p>
              
            </div>
            <p></p>
            <button type="submit" className="btn btn-primary">Submit</button>
          </form>
          <p></p>
          <h2>Create Investors' Contract</h2>
          <form onSubmit= {e => createInvestorContract(e)}>
            <div className="form-group">
              <label htmlFor="investor">Investor Wallet: </label>
              <input type="text" className="form-control" id="investor" />

              <label htmlFor="initialLoan">Initial investment: </label>
              <input type="text" className="form-control" id="initialInvestment" />

              <label htmlFor="managementFee">Management Fee: </label>
              <input type="text" className="form-control" id="managementFee" />
              
              <label htmlFor="termalCoinRatio">Termal coin ratio: </label>
              <input type="text" className="form-control" id="termalCoinRatio" />

              <label htmlFor="duration">Duration: </label>
              <input type="text" className="form-control" id="duration" />

              <label htmlFor="interestRate">Interest rate: </label>
              <input type="text" className="form-control" id="interestRate" />
            </div>
            <p></p>
            <button type="submit" className="btn btn-primary">Submit</button>
          </form>
          <p></p>
          <h2>Get Investor's Contract Info</h2>
          <form onSubmit= {e => getInvestorContractInfo(e)}>
            <div className="form-group">
              <label htmlFor="startup">Investor Wallet: </label>
              <input type="text" className="form-control" id="startup" />
              <p>{investorContract && `Investor Contract: ${investorContract}`}</p>
              <p>{isInvestorContractSigned && `Contract Signed: ${isInvestorContractSigned}`}</p>
            </div>
            <p></p>
            <button type="submit" className="btn btn-primary">Submit</button>
          </form>
          <p></p>
          <h2>Sign Investor's Contract</h2>
          <form onSubmit= {e => signInvestorContract(e)}>
            <div className="form-group">
              <label htmlFor="investor">Investor's Wallet: </label>
            </div>
            <p></p>
            <button type="submit" className="btn btn-primary">Submit</button>
          </form>
          <p></p>
          <h2>Investor Deposit DAI to Termal</h2>
          <form onSubmit= {e => depositDai(e)}>
            <div className="form-group">
              <label htmlFor="amountDai">Amount: </label>
              <input type="text" className="form-control" id="amountDai" />
              <p>{daiContractBalance && `Dai Contract Balance: ${daiContractBalance}`}</p>
              
            </div>
            <p></p>
            <button type="submit" className="btn btn-primary">Submit</button>
          </form>
          <p></p>
          <h2>Get Dai Invested in Termal</h2>
          <form onSubmit= {e => getDaiInvested(e)}>
            <div className="form-group">
              <label htmlFor="invested">Dai Invested: </label>
              <input type="text" className="form-control" id="invested" />
                  <p>{daiInvested && `Investor Dai Invested: ${daiInvested}`}</p>
                  <p>{termalReceived && `Investor Termal Received: ${termalReceived}`}</p>
              
            </div>
            <p></p>
            <button type="submit" className="btn btn-primary">Submit</button>
          </form>
          <p></p>
          <h2>Get Termal Balance</h2>
          <form onSubmit= {e => getTermalBalance(e)}>
            <div className="form-group">
              <label htmlFor="termalBalance">Termal Token Balance: </label>
              <input type="text" className="form-control" id="termalBalance" />
                  <p>{termalBalance && `Termal Balance: ${termalBalance}`}</p>
              
            </div>
            <p></p>
            <button type="submit" className="btn btn-primary">Submit</button>
          </form>
          <p></p>
          <h2>Create Startup</h2>
          <form onSubmit= {e => createStartup(e)}>
            <div className="form-group">
              <label htmlFor="startup">Startup Wallet: </label>
              <input type="text" className="form-control" id="startup" />

              <label htmlFor="startupName">Startup Name: </label>
              <input type="text" className="form-control" id="startupName" />
              <p>{totalStartups && `Total Startups: ${totalStartups}`}</p>
              
            </div>
            <p></p>
            <button type="submit" className="btn btn-primary">Submit</button>
          </form>
          <p></p>
          <h2>Validate Startup</h2>
          <form onSubmit= {e => isValidStartup(e)}>
            <div className="form-group">
              <label htmlFor="startup">Startup Wallet: </label>
              <input type="text" className="form-control" id="startup" />
              <p>{validStartup && `Valid Startup: ${validStartup}`}</p>
            </div>
            <p></p>
            <button type="submit" className="btn btn-primary">Submit</button>
          </form>
          <p></p>
          <h2>Create Startup's Contract</h2>
          <form onSubmit= {e => createStartupContract(e)}>
            <div className="form-group">
              <label htmlFor="startup">Startup Wallet: </label>
              <input type="text" className="form-control" id="startup" />

              <label htmlFor="initialLoan">Initial Loan: </label>
              <input type="text" className="form-control" id="initialLoan" />

              <label htmlFor="interestRate">Interest Rate: </label>
              <input type="text" className="form-control" id="interestRate" />
              
              <label htmlFor="maxConvertionRate">Maximum Convertion Rate: </label>
              <input type="text" className="form-control" id="maxConvertionRate" />

              <label htmlFor="minConvertionRate">Minimum Convertion Rate: </label>
              <input type="text" className="form-control" id="minConvertionRate" />

              <label htmlFor="termalCoinPercentage">Termal Coin Percentage: </label>
              <input type="text" className="form-control" id="termalCoinPercentage" />

              <label htmlFor="stableCoinPercentage">Stable Coin Percentage: </label>
              <input type="text" className="form-control" id="stableCoinPercentage" />

              <label htmlFor="maxProjectTime">Max Project Time: </label>
              <input type="text" className="form-control" id="maxProjectTime" />
             
            </div>
            <p></p>
            <button type="submit" className="btn btn-primary">Submit</button>
          </form>
          <p></p>
          <h2>Get Startup Contract Info</h2>
          <form onSubmit= {e => getStartupContractInfo(e)}>
            <div className="form-group">
              <label htmlFor="startup">Startup Wallet: </label>
              <input type="text" className="form-control" id="startup" />
              <p>{startupContract && `Startup Contract: ${startupContract}`}</p>
              <p>{isSigned && `Contract Signed: ${isSigned}`}</p>
            </div>
            <p></p>
            <button type="submit" className="btn btn-primary">Submit</button>
          </form>
          <p></p>
          <h2>Sign Startup Contract</h2>
          <form onSubmit= {e => signStartupContract(e)}>
            <div className="form-group">
              <label htmlFor="startup">Startup Wallet: </label>
              
            </div>
            <p></p>
            <button type="submit" className="btn btn-primary">Submit</button>
          </form>
          <p></p>
          <h2>Send DAI to Startup</h2>
          <form onSubmit= {e => sendDaiToStartup(e)}>
            <div className="form-group">
              <label htmlFor="startup">Startup Wallet: </label>
              <input type="text" className="form-control" id="startup" />
              <label htmlFor="amountDai">Amount: </label>
              <input type="text" className="form-control" id="amountDai" />           
            </div>
            <p></p>
            <button type="submit" className="btn btn-primary">Submit</button>
          </form>
          <p></p>

          <h2>Send Termal Token to Startup</h2>
          <form onSubmit= {e => sendTermal(e)}>
            <div className="form-group">
              <label htmlFor="receiver">Startup Wallet: </label>
              <input type="text" className="form-control" id="receiver" />
              <label htmlFor="amountTermal">Amount: </label>
              <input type="text" className="form-control" id="amountTermal" />
            </div>
            <p></p>
            <button type="submit" className="btn btn-primary">Submit</button>
          </form>
          <p></p>
          <p></p>
          <h2>Startup Return DAI to Talem</h2>
          <form onSubmit= {e => returnDai(e)}>
            <div className="form-group">
              <label htmlFor="amountDai">Amount: </label>
              <input type="text" className="form-control" id="amountDai" />
              <p>{daiContractBalance && `Dai Contract Balance: ${daiContractBalance}`}</p>
            </div>
            <p></p>
            <button type="submit" className="btn btn-primary">Submit</button>
          </form>
          <p></p>
          <p></p>
          <h2>Startup Return TERMAL to Talem</h2>
          <form onSubmit= {e => returnTermal(e)}>
            <div className="form-group">
              <label htmlFor="amountTermal">Amount: </label>
              <input type="text" className="form-control" id="amountTermal" />
              <p>{termalContractBalance && `Termal Contract Balance: ${termalContractBalance}`}</p>
            </div>
            <p></p>
            <button type="submit" className="btn btn-primary">Submit</button>
          </form>
          <p></p>
        </div>
      </div>
    </div>
  );
}

export default App;
