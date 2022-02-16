// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./InvestorContract.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract InvestorsHandler is Ownable {

    struct Investor{
        string name;
        uint registerDate;
        bool status;
        uint rating;
        uint amountInvested; //total amount in DAI
        uint termalReceived;
        bool hasContract;
        address investorContractAddress;
    }

    mapping (address => Investor) public investors;
    address[] public investorList;

    event LogCreateInvestor(address _creator, address _investorAddress, string _investorName, uint _registerDate, bool _status, uint _rating, uint _amountInvested);
    event LogNewInvestorStatus(address _owner,  address _investorAddress, bool _status);

    constructor(){
    }

    function createInvestor(address _investorAddress, 
                         string memory _investorName)
        onlyOwner()
        external
    {
        require(!investors[_investorAddress].status, "Investor's address is registered!");
        investors[_investorAddress] = Investor(_investorName, block.timestamp, true, 0, 0, 0, false, address(0));
        investorList.push(_investorAddress);
        emit LogCreateInvestor(msg.sender, _investorAddress, _investorName, block.timestamp, true, 0, 0);
    }

    function createInvestorContract(
            address _investorWallet, 
            uint _investment,
            uint _managementFee,
            uint _termalCoinRatio,
            uint _duration,
            uint _interestRate
        )
        onlyOwner()
        external
    {
        require(isValidInvestor(_investorWallet), "Investor wallet is not a valid contract");
        require(!investors[_investorWallet].hasContract, "Startup has a contract");
        
        InvestorContract newInvestorContract = new InvestorContract(
            _investorWallet, 
            _investment,
            _managementFee,
            _termalCoinRatio,
            _duration,
            _interestRate
        );

        investors[_investorWallet].hasContract = true;
        investors[_investorWallet].investorContractAddress = address(newInvestorContract);
        newInvestorContract.transferOwnership(msg.sender);
    }

    function getSignatureStatus(address _investor)
        public
        view
        returns (bool)
    {
        return InvestorContract(investors[_investor].investorContractAddress).signature();
    }

    function isValidInvestor(address _investorAddress)
        public
        view
        returns(bool)
    {
        return investors[_investorAddress].status;
    }

    function newInvestorStatus(address _investorAddress, bool _status)
        onlyOwner()
        public
    {
        require(investors[_investorAddress].status != _status, "New investor's status should be different!");
        investors[_investorAddress].status = _status;
        emit LogNewInvestorStatus(msg.sender, _investorAddress, _status);
    }
    function getTotalInvestors()
        external
        view
        returns (uint)
    {
        return investorList.length;
    }

    //event LogDepositDai(address _sender, address _receipent, uint _amount);
    
    // Move this function to Termal.sol
    function addDepositDai(address _receiver, uint _amount) external {
        require(isValidInvestor(_receiver), "Investor not registered!");
        
        investors[_receiver].amountInvested += _amount;
    }

    function addDepositTermal(address _receiver, uint _amount) external {
        require(isValidInvestor(_receiver), "Investor not registered!");
        
        investors[_receiver].termalReceived += _amount;
    }



    // Move this function to Termal.sol
    // This function allows to send termal from the contract to a user.
    /*function transferTermal(address _receiver, uint _amount)
        onlyOwner()
        public
    {
        termalToken.transfer(_receiver, _amount);
    }*/

    //Move this function to Termal.sol
    //This function returns the dai contract's balance
    /*function getDaiContractBalance()
        external
        view
        returns (uint)
    {
        return daiToken.balanceOf(address(this));
    }*/

    // Move this function to Termal.sol
    //This function returns the Termal tottal supply
    /*function getTermalTotalSupply()
        external
        view
        returns (uint)
    {
        return termalToken.totalSupply();
    } */

    // Move this function to Termal.sol
    /*function getTermalBalance(address _wallet)
        external
        view
        returns (uint)
    {
        return termalToken.balanceOf(_wallet);
    } */
        
}