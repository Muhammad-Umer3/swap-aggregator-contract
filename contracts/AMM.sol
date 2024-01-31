// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract AMM {

    event Swap(address caller, uint amount, string message);

    function swap(
        uint256 _amount,
        string memory _message
    ) public payable returns (uint) {
        require(_amount > 0, 'Amount cannot be zero');

        emit Swap(msg.sender, _amount, _message);

        return _amount;
    }
}
