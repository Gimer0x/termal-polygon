// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract InvestorContract is Ownable {
    using SafeMath for uint256;

    address public investorWallet;
    uint public investment; //Amount in USD
    uint public managementFee;
    uint public date;
    bool public signature;
    uint public termalCoinRatio;
    uint public endDate;
    
    
    event LogContractCreation(address _sender, address _investorWallet, uint _initialInvestment, uint _creationDate);
    event LogInvestorSignature(address _sender, bool _signature, uint _date);
      
    constructor(
            address _investorWallet,   // Investor's ethereum address
            uint _investment,          // Funding total amount
            uint _managementFee,       // Management fee
            uint _termalCoinRatio      // Termal token ratio
            )
        {
            investorWallet = _investorWallet;
            investment = _investment;
            managementFee = _managementFee;
            date = block.timestamp;
            signature = false; // This is false until investor accepts the contract.
            termalCoinRatio = _termalCoinRatio;
            emit LogContractCreation(msg.sender, investorWallet, investment, date);
        }

    //Startup has to sign to accept the contract
    function startupSignature()
        external
    {
        require(investorWallet == msg.sender, "Only investor should accept!");
        require(!signature, "Contract has been signed!");
        signature = true;

        emit LogInvestorSignature(msg.sender, true, block.timestamp);
    }
}