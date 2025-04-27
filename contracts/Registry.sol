// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Registry {
    struct Record {
        uint256 id;
        string name;
        string description;
    }

    Record[] private records;
    uint256 private nextId = 1;

    event RecordAdded(uint256 id, string name, string description);

    function addRecord(string memory _name, string memory _description) public {
        records.push(Record(nextId, _name, _description));
        emit RecordAdded(nextId, _name, _description);
        nextId++;
    }

    function getRecord(uint256 _id) public view returns (uint256, string memory, string memory) {
        require(_id > 0 && _id < nextId, "Record does not exist");
        Record memory record = records[_id - 1];
        return (record.id, record.name, record.description);
    }

    function getRecordCount() public view returns (uint256) {
        return records.length;
    }
} 