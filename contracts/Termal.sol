// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./StartupContract.sol";
import "./InvestorContract.sol";
import "./TermalToken.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Termal is Ownable {
    IERC20 public termalToken;
    IERC20 public daiToken;

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
    
    struct Startup{
        string name;     //Startup's startupName
        uint registerDate;  //Register Date
        bool status;        //startup's status: true or false;
        bool hasContract;
        address startupContractAddress;
        uint amountTermal;
        uint daiReceived;
        uint daiReturned;
    }

    mapping (address => Startup) public startups;
    address[] public startupList;
    
    event LogCreateStartup(address _newStartupAddress, address _owner);
    event LogNewStartupStatus(address _owner, address _startupAddress, bool _status);

    event LogNewInvestorStatus(address _owner,  address _investorAddress, bool _status);
    event LogCreateInvestor(address _creator, address _investorAddress, string _investorName, uint _registerDate, bool _status, uint _rating, uint _amountInvested);
   
    constructor(address _dai, address _termalToken) payable{
        daiToken = IERC20(_dai);
        termalToken = IERC20(_termalToken);
    }

    function createStartupContract(
            address _startupWallet, 
            uint _initialLoan,
            uint _interestRate,
            uint _maxConvertionRate,
            uint _minConvertionRate,
            uint _termalCoinPercentage,
            uint _stableCoinPercentage,
            uint _maxProjectime
        )
        onlyOwner()
        external
    {
        require(isValidStartup(_startupWallet), "Startup profile is not a valid contract");
        require(!startups[_startupWallet].hasContract, "Startup has a contract");
        
        StartupContract newStartupContract = new StartupContract(_startupWallet, _initialLoan, _interestRate, _maxConvertionRate, _minConvertionRate, _termalCoinPercentage, _stableCoinPercentage, _maxProjectime);
        startups[_startupWallet].hasContract = true;
        startups[_startupWallet].startupContractAddress = address(newStartupContract);
        newStartupContract.transferOwnership(msg.sender);
    }

    function createInvestorContract(
            address _investorWallet, 
            uint _investment,
            uint _managementFee,
            uint _termalCoinRatio
        )
        onlyOwner()
        external
    {
        require(isValidInvestor(_investorWallet), "Investor wallet is not a valid contract");
        require(!startups[_investorWallet].hasContract, "Startup has a contract");
        
        InvestorContract newInvestorContract = new InvestorContract(
            _investorWallet, 
            _investment,
            _managementFee,
            _termalCoinRatio
        );

        startups[_investorWallet].hasContract = true;
        startups[_investorWallet].startupContractAddress = address(newInvestorContract);
        newInvestorContract.transferOwnership(msg.sender);
    }

    event LogDepositDai(address _sender, address _receipent, uint _amount);
    
    // This function should be used by investors to deposit DAI
    function depositDai(uint _amount) external {
        require(isValidInvestor(msg.sender), "Investor not registered!");
        
        //bool approved = daiToken.approve(address(this), _amount);
        //require(approved, "Approved failed!");

        emit LogDepositDai(msg.sender, address(this), _amount);
        bool success = daiToken.transferFrom(msg.sender, address(this), _amount);
        require(success, "Deposit failed!");
        investors[msg.sender].amountInvested += _amount;
        
        termalToken.transfer(msg.sender, _amount);
        investors[msg.sender].termalReceived += _amount;
    }

    // This function should be used by startups to deposit DAI
    function returnDaiStartup(uint _amount) external {
        require(isValidStartup(msg.sender), "Startup is not registered!");
        
        //bool approved = daiToken.approve(address(this), _amount);
        //require(approved, "Approved failed!");

        bool success = daiToken.transferFrom(msg.sender, address(this), _amount);
        require(success, "Deposit failed!");
                
        startups[msg.sender].daiReturned += _amount;
    }

    //This function allows to send Dai from the contract to a startup.
    function transferDai(address _startupAddress, uint _amount)
        onlyOwner()
        public
    {
        require(isValidStartup(_startupAddress), "Startup should be valid!");
        require(startups[_startupAddress].hasContract, "Startup should have a contract!");

        //Contract should be accepted
        address _contractAddress = startups[_startupAddress].startupContractAddress;

        require(StartupContract(_contractAddress).signature(), "Contract should be signed first!");

        bool success = daiToken.transfer(_startupAddress, _amount);
        require(success, "Deposit failed!");
        startups[_startupAddress].daiReceived += _amount;
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

    //This function returns the Termal tottal supply
    function getTermalTotalSupply()
        external
        view
        returns (uint)
    {
        return termalToken.totalSupply();
    }

    //This function returns a termal address's balance
    function getTermalBalance(address _wallet)
        external
        view
        returns (uint)
    {
        return termalToken.balanceOf(_wallet);
    }
    
    //This function allows to register a new Startup
    function createStartup(address _startupWallet, 
                         string memory _startupName)
        onlyOwner()
        external
    {
        require(!startups[_startupWallet].status, "Startup is registered!");
        startups[_startupWallet] = Startup(_startupName, block.timestamp, true, false, address(0), 0, 0, 0);
        startupList.push(_startupWallet);
        emit LogCreateStartup(_startupWallet, msg.sender);
    }
    
    //This function validates a registered startup
    function isValidStartup(address _startupAddress)
        public
        view
        returns(bool)
    {
        return startups[_startupAddress].status;
    }
    
    //This function returns the total startups
    function getTotalStartups()
        external
        view
        returns (uint)
    {
        return startupList.length;
    }
    
    //This function allows to register a new investor
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
    //This function validates a registered investor
    function isValidInvestor(address _investorAddress)
        public
        view
        returns(bool)
    {
        return investors[_investorAddress].status;
    }
    //This function validate the investor's status before changing it.
    function newInvestorStatus(address _investorAddress, bool _status)
        onlyOwner()
        public
    {
        require(investors[_investorAddress].status != _status, "New investor's status should be different!");
        investors[_investorAddress].status = _status;
        emit LogNewInvestorStatus(msg.sender, _investorAddress, _status);
    }
    //This function validate the startup's status before changing it.
    function newStartupStatus(address _startupAddress, bool _status)
        onlyOwner()
        public
    {
        require(startups[_startupAddress].status != _status, "New investor's status should be different!");
        startups[_startupAddress].status = _status;
        emit LogNewStartupStatus(msg.sender, _startupAddress, _status);
    }
    //This function returns the total investors
    function getTotalInvestors()
        external
        view
        returns (uint)
    {
        return investorList.length;
    }
}