// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

enum FeeType {
    PNFT_OCAT_SWAP_FEE,
    OCAT_PNFT_SWAP_FEE,
    FEE_TYPE_SIZE
}

address constant UNISWAP_ROUTER_ADDRESS = 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;
uint8 constant FEE_DECIMAL = 4;

////////////////////////////////////////////////////////////////////////////////////////
function strConcat(
        string memory _a, 
        string memory _b, 
        string memory _c, 
        string memory _d, 
        string memory _e
) pure returns (string memory){
    bytes memory _ba = bytes(_a);
    bytes memory _bb = bytes(_b);
    bytes memory _bc = bytes(_c);
    bytes memory _bd = bytes(_d);
    bytes memory _be = bytes(_e);
    string memory abcde = new string(_ba.length + _bb.length + _bc.length + _bd.length + _be.length);
    bytes memory babcde = bytes(abcde);

    uint i = 0;
    uint k = 0;

    for (i = 0; i < _ba.length; i++) babcde[k++] = _ba[i];
    for (i = 0; i < _bb.length; i++) babcde[k++] = _bb[i];
    for (i = 0; i < _bc.length; i++) babcde[k++] = _bc[i];
    for (i = 0; i < _bd.length; i++) babcde[k++] = _bd[i];
    for (i = 0; i < _be.length; i++) babcde[k++] = _be[i];
    return string(babcde);
}

function strConcat(
        string memory _a, 
        string memory _b, 
        string memory _c, 
        string memory _d
) pure returns (string memory) {
    return strConcat(_a, _b, _c, _d, "");
}

function strConcat(
        string memory _a, 
        string memory _b, 
        string memory _c
) pure returns (string memory) {
    return strConcat(_a, _b, _c, "", "");
}

function strConcat(
        string memory _a, 
        string memory _b
) pure returns (string memory) {
    return strConcat(_a, _b, "", "", "");
}
