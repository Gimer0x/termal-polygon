// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./StartupContract.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

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
    }

    mapping (address => Startup) public startups;
    address[] public startupList;
    
    event LogCreateStartup(address _newStartupAddress, address _owner);
    event LogNewStartupStatus(address _owner, address _startupAddress, bool _status);
    event LogReturnTermal(address _sender, address _contract, uint _amount);

    constructor() {}

    function createStartup(
            address _startupWallet, 
            string memory _startupName
            )
        onlyOwner()
        external
    {
        require(!startups[_startupWallet].status, "Startup is registered!");
        startups[_startupWallet] = Startup(_startupName, block.timestamp, true, false, address(0), 0, 0, 0, 0);
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
            uint _maxProjectime
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
                _maxProjectime
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

    function getSignatureStatus(address _investor)
        public
        view
        returns (bool)
    {
        return StartupContract(startups[_investor].startupContractAddress).signature();
    }

    function addDepositDai(address _receiver, uint _amount) external {
        require(isValidStartup(_receiver), "Investor not registered!");
        
        startups[_receiver].daiReceived += _amount;
    }

    function addReturnedDai(address _receiver, uint _amount) external {
        require(isValidStartup(_receiver), "Investor not registered!");
        
        startups[_receiver].daiReturned += _amount;
    }

    function addReturnedTermal(address _receiver, uint _amount) external {
        require(isValidStartup(_receiver), "Investor not registered!");
        
        startups[_receiver].termalReturned += _amount;
    }

}