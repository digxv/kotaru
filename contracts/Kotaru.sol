pragma solidity ^0.8.0;

contract Kotaru {
    string public name = "Kotaru";
    uint256 public objectCount = 0;
    mapping(uint256 => Object) public objects;

    struct Object {
        uint256 id;
        string name;
        string ipfs_hash;
        uint256 price;
        address payable publisher;
    }

    event ObjectPublished(
        uint256 id,
        string name,
        string ipfs_hash,
        uint256 price,
        address payable publisher
    );

    function publishObject(
        string memory _name,
        string memory _ipfs_hash,
        uint256 _price
    ) public {
        require(bytes(_name).length > 0);
        require(bytes(_ipfs_hash).length > 0);
        require(msg.sender != address(0));

        objectCount++;

        address payable publisher = payable(msg.sender);

        objects[objectCount] = Object(
            objectCount,
            _name,
            _ipfs_hash,
            _price,
            publisher
        );

        emit ObjectPublished(objectCount, _name, _ipfs_hash, _price, publisher);
    }
}
