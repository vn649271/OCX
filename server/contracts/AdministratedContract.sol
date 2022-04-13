// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract AdministratedContract {
    address[]       internal adminGroup;
    address payable internal creator;

    constructor() {
        creator = payable(msg.sender);
	}

    modifier mustNoneZeroAddress(address _address) virtual {
        require(_address != address(0), "Expected non-zero address");
        _;
    }

    modifier onlyValidCaller virtual {
        require(msg.sender != address(0), "Expected non-zero address");
        _;
    }

    modifier onlyCreator virtual {
        require(creator != address(0), "Invalid creator address");
        require(msg.sender == creator, "For caller expected be creator");
        _;
    }

    modifier onlyAdmin virtual {
        require(msg.sender != address(0), "Invalid creator address");
        bool isInAdminGroup = false;
        for (uint8 i = 0; i < adminGroup.length; i++) {
            if (msg.sender == adminGroup[i]) {
                isInAdminGroup = true;
                break;
            }
        }
        require(isInAdminGroup, "Invalid caller. Must be admin");
        _;
    }

    function addAdmin(address _admin) public virtual
    onlyCreator mustNoneZeroAddress(_admin) {

        require(adminGroup.length < 6, "Admin group is full");

        for (uint8 i = 0; i < adminGroup.length; i++) {
            if (_admin == adminGroup[i]) {
                return;
            }
        }
        adminGroup.push(_admin);
    }

    function getAdmins() public view virtual 
    returns(address[] memory) {
        return adminGroup;
    }
}