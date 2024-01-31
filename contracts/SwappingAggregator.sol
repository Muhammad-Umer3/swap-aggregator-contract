// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract SwappingAggregator {
    struct Call {
        address target;
        bytes data;
    }

    function execute(Call[] memory callData) public payable {
        require(callData.length > 0, 'Empty Call Data');
        for (uint256 i = 0; i < callData.length; i++) {
            (bool success, ) = callData[i].target.call{value: msg.value}(
                callData[i].data
            );
            require(success, "Swap execution failed");
        }
    }
}
