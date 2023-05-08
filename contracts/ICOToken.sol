// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IEIP20 {
    event Transfer(address indexed from, address indexed to, uint256 value);

    event Approval(address indexed owner, address indexed spender, uint256 value);

    function totalSupply() external view returns (uint256);

    function balanceOf(address account) external view returns (uint256);

    function transfer(address to, uint256 amount) external returns (bool);

    function allowance(address owner, address spender) external view returns (uint256);

    function approve(address spender, uint256 amount) external returns (bool);

    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

contract ICOToken is IEIP20 {
    string public name = "ICO Token";
    string public symbol = "ICOT";
    uint8 public decimals = 18;
    uint256 public _totalSupply;

    mapping(address => uint256) public balances;
    mapping(address => mapping(address => uint256)) public _allowances;

    address public owner;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function.");
        _;
    }

    // Premint to owner address
    constructor() {
        _totalSupply = 5000 * 10 ** uint256(decimals);
        balances[msg.sender] = _totalSupply;
        owner = msg.sender;
    }

    function mint(address to, uint256 amount) public onlyOwner {
        require(msg.sender == owner, "Only owner can mint tokens");
        balances[to] += amount;
        _totalSupply += amount;
    }

    function transfer(address to, uint256 value) external override returns (bool) {
        owner = msg.sender;
        _transfer(owner, to, value);
        return true;
    }

    function balanceOf(address who) external view override returns (uint256) {
        return balances[who];
    }

    function totalSupply() public view virtual override returns (uint256) {
        return _totalSupply;
    }

    function allowance(address own, address spender) public view virtual override returns (uint256) {
        return _allowances[own][spender];
    }

    function approve(address spender, uint256 amount) public virtual override returns (bool) {
        owner = msg.sender;
        _approve(owner, spender, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) public virtual override returns (bool) {
        address spender = msg.sender;
        _spendAllowance(from, spender, amount);
        _transfer(from, to, amount);
        return true;
    }

    function _spendAllowance(address own, address spender, uint256 amount) internal virtual {
        uint256 currentAllowance = allowance(own, spender);
        if (currentAllowance != type(uint256).max) {
            require(currentAllowance >= amount, "ERC20: insufficient allowance");
            unchecked {
                _approve(own, spender, currentAllowance - amount);
            }
        }
    }

    function _approve(address own, address spender, uint256 amount) internal virtual {
        require(own != address(0), "ERC20: approve from the zero address");
        require(spender != address(0), "ERC20: approve to the zero address");

        _allowances[own][spender] = amount;
        emit Approval(own, spender, amount);
    }

    function _transfer(address from, address to, uint256 amount) public {
        require(from != address(0), "ERC20: transfer from the zero address");
        require(to != address(0), "ERC20: transfer to the zero address");
        uint256 fromBalance = balances[from];
        require(fromBalance >= amount, "ERC20: transfer amount exceeds balance");
        unchecked {
            balances[from] = fromBalance - amount;
            // Overflow not possible: the sum of all balances is capped by totalSupply, and the sum is preserved by
            // decrementing then incrementing.
            balances[to] += amount;
        }
        emit Transfer(from, to, amount);
    }
}