pragma solidity >=0.4.20;

contract Election {
    // Model a Candidate
    struct Candidate {
        uint id;
        string name;
        uint voteCount;
    }

    // struct Voter {
    //     uint weight;
    //     bool voted;
    // }


    // Store accounts that have voted
    mapping(address => uint) public weight;
    mapping(address => bool) public votes;
    
    // Store Candidates
    // Fetch Candidates
    mapping(uint => Candidate) public candidates;
    // Store Candidates Count
    uint public candidatesCount;
    address public chairperson;
    bool public live = true;

    // voted event
    event votedEvent (
        uint indexed _candidateId
    );

     event voterEvent (
        address indexed _voterId
    );

    constructor () public {
        chairperson = msg.sender;
        addCandidate("Candidate 1");
        addCandidate("Candidate 2");
        weight[msg.sender] = 1;
        
    }
    

    function addCandidate (string memory _name) private {
        candidatesCount ++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);
    }


    function vote (uint _candidateId) public {

        require(weight[msg.sender] ==1);

        // require that they haven't voted before
        require(!votes[msg.sender]);

        // require a valid candidate
        require(_candidateId > 0 && _candidateId <= candidatesCount);

        // record that voter has voted
        //voters[msg.sender].voted = true;
        votes[msg.sender] = true;

        // update candidate vote Count
        candidates[_candidateId].voteCount ++;

        // trigger voted event
        emit votedEvent(_candidateId);
    }

    function giveVoteAccess (address _voterId) public  {

        require(msg.sender==chairperson, "Only admin can give accesss");
        //require(!voters[_voterId].voted, "Voter has already voted");
        //addCandidate("Candidate 3");
        // voters[0xd1F61F5522369767F938fd053D59eB28f07ceA97] = Voter(1, true);
        weight[_voterId] = 1;
        emit voterEvent(_voterId);
    }

    function endElection() public {
        live = false;
    }
}
