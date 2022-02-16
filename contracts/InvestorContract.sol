// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract InvestorContract is Ownable {
    using SafeMath for uint256;

    address public investorWallet;  // Investor public key
    uint public investment;         // Amount in DAI
    uint public managementFee;      // Initial management fees in DAI
    uint public date;               // Investor's contract creation date
    bool public signature;          // Investor's signature
    uint public termalCoinRatio;    // Initial 1:1 ratio
    uint public endDate;            // Investor contract end
    uint public duration;           // 0 means undefined
    uint public interestRate;       // 18% if not involved, 20% if involved
    
    event LogContractCreation(
        address _sender, 
        address _investorWallet, 
        uint _initialInvestment, 
        uint _creationDate, 
        uint _termalCoinRatio,
        uint _duration, 
        uint _interestRate
        );
    
    event LogInvestorSignature(address _sender, bool _signature, uint _date);

    constructor(
            address _investorWallet,   // Investor's ethereum address
            uint _investment,          // Funding total amount
            uint _managementFee,       // Management fee
            uint _termalCoinRatio,     // Termal token ratio
            uint _duration,            // In months
            uint _interestRate
            )
        {
            investorWallet = _investorWallet;
            investment = _investment;
            managementFee = _managementFee;
            date = block.timestamp;
            signature = false; // This is false until investor accepts the contract.
            termalCoinRatio = _termalCoinRatio;
            duration = _duration;
            interestRate = _interestRate;
            // consider a new variable to approve the new investor
            emit LogContractCreation(msg.sender, investorWallet, investment, date, termalCoinRatio, duration, interestRate);
        }

    //Startup has to sign to accept the contract
    function investorSignature()
        external
    {
        require(investorWallet == msg.sender, "Only investor should accept!");
        require(!signature, "Contract has been signed!");
        signature = true;

        emit LogInvestorSignature(msg.sender, true, block.timestamp);
    }
}