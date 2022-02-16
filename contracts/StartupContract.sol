// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract StartupContract is Ownable {
    using SafeMath for uint256;

    address public startupWallet;
    uint public initialLoan; //Amount in USD
    uint public date;
    bool public signature;
    uint public interestRate; //% management fee
    uint public maxConvertionRate;
    uint public minConvertionRate;
    uint public termalCoinPercentage;
    uint public stableCoinPercentage;
    uint public fundingMonths; 
    uint public honeymoon; //Months without payments
    uint public interestOnly; //Interest only Months
    uint public interestAndCapital; //Interes and capital payments
    uint public maxProjectTime;
    
    event LogContractCreation(address _startupProfile, uint _initialLoan, uint _date, uint _interestRate);
    event LogStartupSingature(address _sender, bool _signature, address _startupProfile, uint);
    event LogSetNewOwner(address _owner, address _newOwner);
    
    event LogSetMonths(address _owner, uint _fundingMonths, uint _honeymoon, uint _interestOnly, uint _interestAndCapital);
    
    constructor(
            address _startupWallet,
            uint _initialLoan,          // Funding total amount
            uint _interestRate,         // %Management fee
            uint _maxConvertionRate,
            uint _minConvertionRate,
            uint _termalCoinPercentage,
            uint _stableCoinPercentage,
            uint _maxProjectTime
            )
        {
            startupWallet = _startupWallet;
            initialLoan = _initialLoan;
            date = block.timestamp;
            signature = false; // This is false until startup accepts the contract.
            interestRate = _interestRate;
            maxConvertionRate = _maxConvertionRate;
            minConvertionRate = _minConvertionRate;
            termalCoinPercentage = _termalCoinPercentage;
            stableCoinPercentage = _stableCoinPercentage;
            maxProjectTime = _maxProjectTime;
            setMonths(3, 2, 3, 10); 
            emit LogContractCreation(startupWallet, initialLoan, date, interestRate);
        }

    function setMonths(uint _fundingMonths, uint _honeymoon, uint _interestOnly, uint _interestAndCapital)
        onlyOwner()
        public
    {
        uint sum1 = _fundingMonths.add(_honeymoon);
        uint sum2 = _interestOnly.add(_interestAndCapital);
        uint sum3 = sum1.add(sum2);

        require(sum3 <= maxProjectTime, "Should be less or equal to maximum project time");
        
        fundingMonths = _fundingMonths;
        honeymoon = _honeymoon;
        interestOnly = _interestOnly;
        interestAndCapital = _interestAndCapital;

        emit LogSetMonths(msg.sender, fundingMonths, honeymoon, interestOnly, interestAndCapital);
    }

    //Total contract duration
    function getTotalMonths() 
        public 
        view
        returns (uint)
    {
        return (fundingMonths + honeymoon + interestOnly + interestAndCapital);
    }

    //Startup has to sign to accept the contract
    function startupSignature()
        external
    {
        require(startupWallet == msg.sender, "Only startup should accept!");
        require(!signature, "Contract has been signed!");
        require(getTotalMonths() > 0, "Total months should be greater than zero!" );
        signature = true;

        emit LogStartupSingature(msg.sender, true, msg.sender, block.timestamp);
    }
}