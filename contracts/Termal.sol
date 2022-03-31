// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./StartupsHandler.sol";
import "./InvestorsHandler.sol";
import "./TermalToken.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Termal is Ownable {
    IERC20 public termalToken;
    IERC20 public daiToken;
    StartupsHandler public startupsHandler;
    InvestorsHandler public investorsHandler;

    event LogInvestorDepositDai(address _sender, address _receipent, uint _amount);
    event LogStartupReturnTermal(address _sender, address _contract, uint _amount);

    /*event LogCreateStartup(address _newStartupAddress, address _owner);
    event LogNewStartupStatus(address _owner, address _startupAddress, bool _status);
    
    event LogNewInvestorStatus(address _owner,  address _investorAddress, bool _status);
    event LogCreateInvestor(address _creator, address _investorAddress, string _investorName, uint _registerDate, bool _status, uint _rating, uint _amountInvested);
    */
   
    constructor(address _dai, address _termalToken, address _investorsHandler, address _startupsHandler) payable{
        daiToken = IERC20(_dai);
        termalToken = IERC20(_termalToken);
        investorsHandler = InvestorsHandler(_investorsHandler);
        startupsHandler = StartupsHandler(_startupsHandler);
    }
    

    function investorDepositDai(uint _amount) external {
        require(investorsHandler.isValidInvestor(msg.sender), "Investor not registered!");
        require(investorsHandler.getSignatureStatus(msg.sender), "Investor should have a signed contract!");
        
        //bool approved = daiToken.approve(address(this), _amount);
        //require(approved, "Approved failed!");

        bool success = daiToken.transferFrom(msg.sender, address(this), _amount);

        require(success, "Deposit failed!");
        investorsHandler.addDepositDai(msg.sender, _amount);
        
        //ratio?
        termalToken.transfer(msg.sender, _amount);
        investorsHandler.addDepositTermal(msg.sender, _amount);

        emit LogInvestorDepositDai(msg.sender, address(this), _amount);
    }

    // This function should be used by startups to deposit DAI
    function returnDaiStartup(uint _amount) external {
        require(startupsHandler.isValidStartup(msg.sender), "Startup should be valid!");
        bool success = daiToken.transferFrom(msg.sender, address(this), _amount);
        require(success, "Deposit failed!");

        startupsHandler.addReturnedDai(msg.sender, _amount);
    }

    function returnTermalStartup(uint _amount) external {
        
        bool success = termalToken.transferFrom(msg.sender, address(this), _amount);
        require(success, "Deposit failed!");
        
        startupsHandler.addReturnedTermal(msg.sender, _amount);

        emit LogStartupReturnTermal(msg.sender, address(this), _amount);
    }

    
    function transferDaiToStartup(address _startupAddress, uint _amount)
        onlyOwner()
        public
    {
        require(startupsHandler.isValidStartup(_startupAddress), "Startup should be valid!");

        require(startupsHandler.getSignatureStatus(_startupAddress), "Contract should be signed first!");

        bool success = daiToken.transfer(_startupAddress, _amount);
        require(success, "Deposit failed!");
        
        startupsHandler.addDepositDai(_startupAddress, _amount);
    }

    //This function allows to send termal from the contract to a user.
    function transferTermal(address _receiver, uint _amount)
        onlyOwner()
        public
    {
        termalToken.transfer(_receiver, _amount);
    }

    //This function returns the dai contract's balance
    function getDaiContractBalance()
        external
        view
        returns (uint)
    {
        return daiToken.balanceOf(address(this));
    }

    // This function returns the Termal tottal supply
    // Probably we don't need these two functions
    /*function getTermalTotalSupply()
        external
        view
        returns (uint)
    {
        return termalToken.totalSupply();
    }

    function getTermalBalance(address _wallet)
        external
        view
        returns (uint)
    {
        return termalToken.balanceOf(_wallet);
    } */
    
}