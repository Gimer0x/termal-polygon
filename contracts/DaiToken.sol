//SPDX-License-Identifier: MIT
pragma solidity ^0.8.14;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract DaiToken is ERC20 {

    constructor(uint256 initialSupply) ERC20("Dai Stablecoin", "DAI") {
        _mint(msg.sender, initialSupply);
    }

}