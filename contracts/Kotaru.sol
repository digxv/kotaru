pragma solidity ^0.8.0;
import "hardhat/console.sol";

contract Kotaru {
    string public name = "Kotaru";
    uint256 public objektCount = 0;
    uint256 public totalDownloads = 0;
    mapping(uint256 => Objekt) public objekts;
    mapping(uint256 => Download) public downloads;

    struct Objekt {
        uint256 id;
        string name;
        string ipfs_uri;
        uint256 price;
        uint256 downloads;
        address payable publisher;
    }

    struct Download {
        uint256 id;
        uint256 objekt_id;
        address buyer;
    }

    event ObjektPublished(
        uint256 id,
        string name,
        string ipfs_hash,
        uint256 price,
        uint256 downloads,
        address payable publisher
    );

    event ObjektBought(uint256 id, uint256 object_id, address buyer);

    function publishObjekt(
        string memory _name,
        string memory _ipfs_hash,
        uint256 _price
    ) public {
        require(bytes(_name).length > 0);
        require(bytes(_ipfs_hash).length > 0);
        require(msg.sender != address(0));

        objektCount++;

        address payable publisher = payable(msg.sender);

        uint256 objekt_downloads = 0;

        objekts[objektCount] = Objekt(
            objektCount,
            _name,
            _ipfs_hash,
            _price,
            objekt_downloads,
            publisher
        );

        emit ObjektPublished(
            objektCount,
            _name,
            _ipfs_hash,
            _price,
            objekt_downloads,
            publisher
        );
    }

    function buyObjekt(uint256 _id) public payable {
        require(_id <= objektCount);
        totalDownloads++;

        Objekt memory _objekt = objekts[_id];
        address payable _publisher = _objekt.publisher;
        uint256 _price = _objekt.price;

        require(msg.value == _price);
        _publisher.transfer(msg.value);

        _objekt.downloads = _objekt.downloads + 1;
        objekts[_id] = _objekt;

        downloads[totalDownloads] = Download(totalDownloads, _objekt.id, msg.sender);

        emit ObjektBought(totalDownloads, _objekt.id, msg.sender);
    }
}
