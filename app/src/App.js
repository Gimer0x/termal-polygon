import React, { useState, useEffect } from 'react';
//import talemLogo from './talem.jpg';
import termalLogo from './termal.png';
//import DaiToken from './contracts/Dai.json';
//local
import DaiToken from './contracts/DaiToken.json';
import Termal from './contracts/Termal.json';
import TermalToken from './contracts/TermalToken.json';
import StartupContract from './contracts/StartupContract.json';
import { getWeb3 } from  './utils.js';

//Heroku: https://desolate-tundra-94662.herokuapp.com/

function App() {
  
  const [web3, setWeb3] = useState(undefined);
  const [accounts, setAccounts] = useState(undefined);
  const [contract, setContract] = useState(undefined);
  const [termalAddress, setTermalAddress] = useState(undefined);
  const [daiContract, setDaiContract] = useState(undefined);
  const [owner, setOwner] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [daiContractBalance, setDaiContractBalance] = useState(undefined);
  const [totalInvestors, setTotalInvestors] = useState(undefined);
  const [totalStartups, setTotalStartups] = useState(undefined);
  const [daiInvested, setDaiInvested] = useState(undefined);
  const [termalReceived, setTermalReceived] = useState(undefined);
  const [termalBalance, setTermalBalance] = useState(undefined);
  const [validStartup, setValidStartup] = useState(undefined);

  const [startupContract, setStartupContract] = useState(undefined);
  const [isSigned, setIsSigned] = useState(undefined);
  
  useEffect(() => {
      const init = async () => {
      const web3 = await getWeb3();
      const accounts = await web3.eth.getAccounts();

      const networkId = await web3.eth.net.getId();
      console.log(networkId);
      const termalDeployedNetwork = await Termal.networks[networkId];
      const termalTokenDeployedNetwork = await TermalToken.networks[networkId];
      //local
      const daiDeployedNetwork = await DaiToken.networks[networkId];
            
      const contract = new web3.eth.Contract(
        Termal.abi,
        termalDeployedNetwork && termalDeployedNetwork.address
      );

      console.log("Termal Address:", termalDeployedNetwork.address);

      //HEroku: https://desolate-tundra-94662.herokuapp.com/

      /*const termalToken = new web3.eth.Contract(
        TermalToken.abi,
        termalTokenDeployedNetwork && termalTokenDeployedNetwork.address
      );*/

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

      const balance = await contract.methods.getTermalBalance(termalDeployedNetwork.address).call();
      const _balance = parseFloat(balance / (10 ** 18)).toFixed(2);
      setBalance(_balance);
      console.log("Termal Contract Balance", balance);

      setWeb3(web3);
      setContract(contract);
      setDaiContract(daiContract);
      setAccounts(accounts);
      
      setTermalAddress(termalDeployedNetwork.address);
                  
      const _owner = await contract.methods.owner().call();
      setOwner(_owner);
      
      const totalInvestors = await contract.methods.getTotalInvestors().call();
      setTotalInvestors(totalInvestors);

      const totalStartups = await contract.methods.getTotalStartups().call();
      setTotalStartups(totalStartups);
      
      const daiContractBalance = await contract.methods.getDaiContractBalance().call();
      const _daiContractBalance = parseFloat(daiContractBalance / (10 ** 18)).toFixed(2);
      setDaiContractBalance(_daiContractBalance);
    }
    init();
    
  }, []);

  async function initInfo(e) {
    e.preventDefault();
    try{
      const _owner = await contract.methods.owner().call();
      console.log(_owner);
      setOwner(_owner);

      let _balance = await contract.methods.getTermalBalance(_owner).call();
      setBalance(_balance);
    } catch(e){
      console.error(e);
    }
  }

  async function getTermalBalance(e) {
    e.preventDefault();
    const _address = e.target.elements[0].value;
    
    try{
      const termalBalance = await contract.methods.getTermalBalance(_address).call();
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
      await contract.methods.createInvestor(_address, _name).send({from: accounts[0]});
    } catch(e){
      console.error(e);
    }
  }

  async function getDaiInvested(e) {
    e.preventDefault();
    const _address = e.target.elements[0].value;
    try{
      let result = await contract.methods.investors(_address).call();
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
      let result = await contract.methods.startups(_address).call();
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
      let tx = await contract.methods.createStartup(_address, _name).send({from: accounts[0]});
      const startupProfileAddress = tx.events.LogCreateStartup.returnValues._newStartupAddress;
      console.log("Startup Profile: ", startupProfileAddress);
    } catch(e){
      console.error(e);
    }
  }

  async function sendDai(e) {
    e.preventDefault();
    const _startup = e.target.elements[0].value;
    const _daiAmount = e.target.elements[1].value;
    const _DAI_AMOUNT_WEI = web3.utils.toWei(_daiAmount.toString());
    try{
      await contract.methods.transferDai(
        _startup,
        _DAI_AMOUNT_WEI
      )
      .send({from: accounts[0], gas: 6485876});
    } catch(e){
      console.error(e);
    }
  }

  async function sendTermal(e) {
    e.preventDefault();
    const _receiver = e.target.elements[0].value;
    const _termalAmount = e.target.elements[1].value;
    const _TERMAL_AMOUNT_WEI = web3.utils.toWei(_termalAmount.toString());
    
    try{
      await contract.methods.transferTermal(
        _receiver,
        _TERMAL_AMOUNT_WEI
        )
      .send({from: accounts[0], gas: 6485876});
    } catch(e){
      console.error(e);
    }
  }

  async function depositDai(e) {
    e.preventDefault();
    const _daiAmount = e.target.elements[0].value;
    const _DAI_AMOUNT_WEI = web3.utils.toWei(_daiAmount.toString());
    console.log("Dai Address", _DAI_AMOUNT_WEI);
    
    try{
      await daiContract.methods.approve(termalAddress, _DAI_AMOUNT_WEI).send({from: accounts[0]});
      console.log("Selected address:", accounts[0]);
      await contract.methods.depositDai(
        _DAI_AMOUNT_WEI
        )
      .send({from: accounts[0], gas: 6485876});
    } catch(e){
      console.error(e);
    }
  }

  async function getContractInfo(e) {
    e.preventDefault();
    const _wallet = e.target.elements[0].value;
    try{
      let results = await contract.methods.startups(_wallet).call();
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

  async function signContract(e) {
    e.preventDefault();
    try{
      let results = await contract.methods.startups(accounts[0]).call();

      
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
  }

  async function returnDai(e) {
    e.preventDefault();
    const _daiAmount = e.target.elements[0].value;
    const _DAI_AMOUNT_WEI = web3.utils.toWei(_daiAmount.toString());
    
    try{
      await daiContract.methods.approve(termalAddress, _DAI_AMOUNT_WEI).send({from: accounts[0]});
      await contract.methods.returnDaiStartup(
        _DAI_AMOUNT_WEI
        )
      .send({from: accounts[0], gas: 6485876});

      const newDaiContractBalance = await daiContract.methods.balanceOf(termalAddress).call();
      setDaiContractBalance(newDaiContractBalance);
    } catch(e){
      console.error(e);
    }
  }

  async function createContract(e) {
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
      const tx = await contract.methods.createStartupContract(
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
          <form onSubmit= {e => createContract(e)}>
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
          <form onSubmit= {e => getContractInfo(e)}>
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
          <form onSubmit= {e => signContract(e)}>
            <div className="form-group">
              <label htmlFor="startup">Startup Wallet: </label>
              
            </div>
            <p></p>
            <button type="submit" className="btn btn-primary">Submit</button>
          </form>
          <p></p>
          <h2>Send DAI to Startup</h2>
          <form onSubmit= {e => sendDai(e)}>
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
              <label htmlFor="receiver">Receiver Wallet: </label>
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
        </div>
      </div>
    </div>
  );
}

export default App;
