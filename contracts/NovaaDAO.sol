// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import "openzeppelin-solidity/contracts/utils/math/SafeMath.sol";

contract DAOVotingStaking {
    using SafeMath for uint256;

    // Contract owner
    address public owner;

    // Staking variables
    mapping(address => uint256) public alreadyWithdrawn;
    mapping(address => uint256) public balances;
    uint256 public contractBalance;

    // Voting structures
    struct Vote {
        address voterAddress;
        bool choice;
    }

    struct Voter {
        string voterName;
        bool voted;
        uint256 stakedAmount;
    }

    struct Proposal {
        string description;
        uint256 yesVotes;
        uint256 noVotes;
        uint256 totalVotes;
        uint256 endTime;
        bool ended;
        mapping(address => bool) hasVoted;
    }

    // Voting variables
    uint256 public proposalCount;
    mapping(uint256 => Proposal) public proposals;
    mapping(address => Voter) public voterRegister;
    uint256 public totalVoters;
    uint256 public minStakeToVote;

    // Events
    event MonadStaked(address indexed from, uint256 amount);
    event MonadUnstaked(address indexed to, uint256 amount);
    event VoterAdded(address indexed voter, string name);
    event ProposalCreated(uint256 indexed proposalId, string description);
    event VoteCast(uint256 indexed proposalId, address indexed voter, bool choice);
    event ProposalEnded(uint256 indexed proposalId, uint256 yesVotes, uint256 noVotes);

    // Modifiers
    modifier onlyOwner() {
        _;
    }

    modifier onlyStaker() {
        _;
    }

    modifier validProposal(uint256 _proposalId) {
        _;
    }

    constructor(uint256 _minStakeToVote) {
        owner = msg.sender;
        minStakeToVote = _minStakeToVote;
        proposalCount = 0;
        totalVoters = 0;
    }

    function stakeMonad(uint256 amount) public payable {
        balances[msg.sender] = balances[msg.sender].add(amount);
        contractBalance = contractBalance.add(amount);

        if (balances[msg.sender] >= minStakeToVote && bytes(voterRegister[msg.sender].voterName).length == 0) {
            voterRegister[msg.sender].voterName = "Staker";
            voterRegister[msg.sender].voted = false;
            voterRegister[msg.sender].stakedAmount = balances[msg.sender];
            totalVoters++;
            emit VoterAdded(msg.sender, "Staker");
        } else if (bytes(voterRegister[msg.sender].voterName).length > 0) {
            voterRegister[msg.sender].stakedAmount = balances[msg.sender];
        }

        emit MonadStaked(msg.sender, amount);
    }

    function unstakeMonad(uint256 amount) public {
        alreadyWithdrawn[msg.sender] = alreadyWithdrawn[msg.sender].add(amount);
        balances[msg.sender] = balances[msg.sender].sub(amount);
        contractBalance = contractBalance.sub(amount);
        voterRegister[msg.sender].stakedAmount = balances[msg.sender];
        
        payable(msg.sender).transfer(amount);
        emit MonadUnstaked(msg.sender, amount);
    }

    // Voting functions
    function addVoter(address _voterAddress, string memory _voterName) public onlyOwner {
        voterRegister[_voterAddress].voterName = _voterName;
        voterRegister[_voterAddress].voted = false;
        voterRegister[_voterAddress].stakedAmount = balances[_voterAddress];
        totalVoters++;
        
        emit VoterAdded(_voterAddress, _voterName);
    }

    function createProposal(string memory _description, uint256 _votingPeriodHours) public onlyOwner {
        uint256 proposalId = proposalCount;
        proposals[proposalId].description = _description;
        proposals[proposalId].yesVotes = 0;
        proposals[proposalId].noVotes = 0;
        proposals[proposalId].totalVotes = 0;
        proposals[proposalId].endTime = block.timestamp.add(_votingPeriodHours.mul(3600));
        proposals[proposalId].ended = false;
        
        proposalCount++;
        emit ProposalCreated(proposalId, _description);
    }

    function vote(uint256 _proposalId, bool _choice) public onlyStaker validProposal(_proposalId) {
        proposals[_proposalId].hasVoted[msg.sender] = true;
        proposals[_proposalId].totalVotes++;
        
        if(_choice) {
            proposals[_proposalId].yesVotes++;
        } else {
            proposals[_proposalId].noVotes++;
        }
        
        emit VoteCast(_proposalId, msg.sender, _choice);
    }

    function endProposal(uint256 _proposalId) public onlyOwner {
        proposals[_proposalId].ended = true;
        emit ProposalEnded(_proposalId, proposals[_proposalId].yesVotes, proposals[_proposalId].noVotes);
    }

    // View functions
    function getProposalResults(uint256 _proposalId) public view returns (
        string memory description,
        uint256 yesVotes,
        uint256 noVotes,
        uint256 totalVotes,
        uint256 endTime,
        bool ended
    ) {
        Proposal storage proposal = proposals[_proposalId];
        return (
            proposal.description,
            proposal.yesVotes,
            proposal.noVotes,
            proposal.totalVotes,
            proposal.endTime,
            proposal.ended
        );
    }

    function hasVoted(uint256 _proposalId, address _voter) public view returns (bool) {
        return proposals[_proposalId].hasVoted[_voter];
    }

    function getVoterInfo(address _voter) public view returns (
        string memory name,
        bool voted,
        uint256 stakedAmount
    ) {
        return (
            voterRegister[_voter].voterName,
            voterRegister[_voter].voted,
            voterRegister[_voter].stakedAmount
        );
    }

    function updateMinStakeToVote(uint256 _newMinStake) public onlyOwner {
        minStakeToVote = _newMinStake;
    }

    // Contract balance check
    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }

    // Emergency withdrawal for owner (only if no active stakes)
    function emergencyWithdraw() public onlyOwner {
        payable(owner).transfer(address(this).balance);
    }
}