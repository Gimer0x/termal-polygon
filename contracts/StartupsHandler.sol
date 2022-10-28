// SPDX-License-Identifier: MIT
pragma solidity ^0.8.14;

import "./StartupContract.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract StartupsHandler is Ownable {
    
    struct Startup{
        string name;     //Startup's startupName
        uint registerDate;  //Register Date
        bool status;        //startup's status: true or false;
        bool hasContract;
        address startupContractAddress;
        uint amountTermal;
        uint daiReceived;
        uint daiReturned;
        uint termalReturned;
        address token;
    }

    struct token
    {
        address tokenAddress;
        uint balance;
    }
    mapping(address => token) public startupToken;

    mapping (address => Startup) public startups;
    address[] public startupList;
    
    event LogCreateStartup(address _newStartupAddress, address _owner);
    event LogNewStartupStatus(address _owner, address _startupAddress, bool _status);
    event LogReturnTermal(address _sender, address _contract, uint _amount);

    constructor() {}

    function createStartup(
            address _startupWallet, 
            string memory _startupName,
            address tokenAddress
            )
        onlyOwner()
        external
    {
        require(!startups[_startupWallet].status, "Startup is registered!");
        startups[_startupWallet] = Startup(_startupName, block.timestamp, true, false, address(0), 0, 0, 0, 0, tokenAddress);
        startupList.push(_startupWallet);
        emit LogCreateStartup(_startupWallet, msg.sender);
    }

    function createStartupContract(
            address _startupWallet, 
            uint _initialLoan,
            uint _interestRate,
            uint _maxConvertionRate,
            uint _minConvertionRate,
            uint _termalCoinPercentage,
            uint _stableCoinPercentage,
            uint _maxProjectime,
            uint _activeFee
        )
        onlyOwner()
        external
    {
        require(isValidStartup(_startupWallet), "Startup profile is not a valid contract");
        require(!startups[_startupWallet].hasContract, "Startup has a contract");
        
        StartupContract newStartupContract = new StartupContract(
                _startupWallet, 
                _initialLoan, 
                _interestRate, 
                _maxConvertionRate, 
                _minConvertionRate, 
                _termalCoinPercentage, 
                _stableCoinPercentage, 
                _maxProjectime,
                _activeFee
                );
        startups[_startupWallet].hasContract = true;
        startups[_startupWallet].startupContractAddress = address(newStartupContract);
        newStartupContract.transferOwnership(msg.sender);
    }
    
    function isValidStartup(address _startupAddress)
        public
        view
        returns(bool)
    {
        return startups[_startupAddress].status;
    }
    
    function getTotalStartups()
        external
        view
        returns (uint)
    {
        return startupList.length;
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

    function getStartupTokenAddress(address _startup)
        public
        view
        returns (address)
    {
        require(isValidStartup(_startup), "Startup is not registered!");
        
        return startups[_startup].token;
    }

    function getSignatureStatus(address _startup)
        public
        view
        returns (bool)
    {
        require(isValidStartup(_startup), "Startup is not registered!");
        return StartupContract(startups[_startup].startupContractAddress).signature();
    }

    function addDepositDai(address _receiver, uint _amount) external {
        require(isValidStartup(_receiver), "Investor is not registered!");
        
        startups[_receiver].daiReceived += _amount;
    }

    function addReturnedDai(address _receiver, uint _amount) external {
        require(isValidStartup(_receiver), "Startup is not registered!");
        
        startups[_receiver].daiReturned += _amount;
    }

    function addReturnedTermal(address _receiver, uint _amount) external {
        require(isValidStartup(_receiver), "Startup is not registered!");
        
        startups[_receiver].termalReturned += _amount;
    }

}