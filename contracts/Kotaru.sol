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
        uint256 downloads;
        address payable publisher;
    }

    struct Purchase {
        uint256 id;
        uint256 object_id;
        address buyer;
    }

    event ObjectPublished(
        uint256 id,
        string name,
        string ipfs_hash,
        uint256 price,
        uint256 downloads,
        address payable publisher
    );

    event ObjectBought(
        uint256 id,
        uint256 object_id,
        address buyer
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

        uint downloads = 0;

        objects[objectCount] = Object(
            objectCount,
            _name,
            _ipfs_hash,
            _price,
            downloads,
            publisher
        );

        emit ObjectPublished(objectCount, _name, _ipfs_hash, _price, downloads, publisher);
    }

    function buyObject(uint256 _id) public payable {
        require(_id > 0 && _id <= objectCount);
        Object memory _object = objects[_id];
        address payable _publisher = payable(_object.publisher);

        // address payable publisher = payable(msg.sender);
        uint256 _price = _object.price;
        // require(_price = msg.value);

        _publisher.transfer(_price);

        // update object
        _object.downloads = _object.downloads + 1;
        objects[_id] = _object;

        uint256 purchase_id = _object.downloads + 1;

        // to-do: add purchase to purchases wtf

        emit ObjectBought(purchase_id, _id, msg.sender);
    }
}
