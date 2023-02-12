App = {
  web3Provider: null,
  contracts: {},
  account: "0x0",

  init: function () {
    console.log(web3.currentProvider);
    return App.initWeb3();
  },

  initWeb3: async function () {
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      try {
        // Request account access
        await window.ethereum.enable();
      } catch (error) {
        // User denied account access...
        console.error("User denied account access");
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
    }
    // If no injected web3 instance is detected, fall back to Ganache
    else {
      App.web3Provider = new Web3.providers.HttpProvider(
        "http://localhost:7545"
      );
    }
    web3 = new Web3(App.web3Provider);
    return App.initContract();
  },

  initContract: function () {
    $.getJSON("Election.json", function (election) {
      // Instantiate a new truffle contract from the artifact
      App.contracts.Election = TruffleContract(election);
      // Connect provider to interact with contract
      App.contracts.Election.setProvider(App.web3Provider);

      return App.render();
    });
  },

  render: function () {
    var electionInstance;
    var loader = $("#loader");
    var content = $("#content");
    var addVoter = $("#addVoter");

    loader.show();
    content.hide();
    addVoter.hide();

    // Load account data
    web3.eth.getCoinbase(function (err, account) {
      if (err === null) {
        App.account = account;
        $("#accountAddress").html("Your Account: " + account);
        console.log(account);
      }
    });


    // console.log(a)
    // Load contract data
    // Load contract data
    App.contracts.Election.deployed()
      .then(function (instance) {
        electionInstance = instance;
        return electionInstance.candidatesCount();
      })
      .then(function (candidatesCount) {
        var candidatesResults = $("#candidatesResults");
        candidatesResults.empty();

        var candidatesSelect = $("#candidatesSelect");
        candidatesSelect.empty();

        for (var i = 1; i <= candidatesCount; i++) {
          electionInstance.candidates(i).then(function (candidate) {
            var id = candidate[0];
            var name = candidate[1];
            var voteCount = candidate[2];

            // Render candidate Result
            var candidateTemplate =
              "<tr><th>" +
              id +
              "</th><td>" +
              name +
              "</td><td>" +
              voteCount +
              "</td></tr>";
            candidatesResults.append(candidateTemplate);

            // Render candidate ballot option
            var candidateOption =
              "<option value='" + id + "' >" + name + "</ option>";
            candidatesSelect.append(candidateOption);
          });
        }
        
        return electionInstance.votes(App.account);
      })
      .then(function (hasVoted) {
        // Do not allow a user to vote
        console.log(hasVoted);
        if (hasVoted) {
          
          $("form").hide();
        }

        loader.hide();
        content.show();

        return electionInstance.chairperson();
      })
      .then(function (address) {
        if (App.account == address) {
          addVoter.show();
        }
        return electionInstance.live()
      })
      .then((status) => {
        if (!status) {
        
          $("form").hide();
          addVoter.hide();
          $("#status").html("Complete").css("background-color", "green");
            
        }
      })
      .catch(function (error) {
        console.warn(error);
      });
  },

  addVoters: function () {
    var address = $("#address").val();
    App.contracts.Election.deployed()
      .then(function (instance) {
        election = instance;
        // console.log(instance.candidates(0).id);
        return instance.giveVoteAccess(address, { from: App.account });
      })
      .then(function (instance) {
    
        $("#content").show();
        $("#loader").hide();
       
      })
      .catch(function (err) {
        //console.warn(err);
        console.log(err);
        console.log("Not deployed");
        console.log(App.account);
      });
  },

  endElection: ()=> {
    App.contracts.Election.deployed()
      .then(function (instance) {
        instance.endElection({ from: App.account });
        return instance
      })
      .then(function (instance) {
        return instance.live();
      })
      .then((status) => {
        console.log(status);
      })
      .catch(function (err) {
        console.error(err);
      });
  },

  castVote: function () {
    var candidateId = $("#candidatesSelect").val();
    App.contracts.Election.deployed()
      .then(function (instance) {
        return instance.vote(candidateId, { from: App.account });
      })
      .then(function (result) {
        // Wait for votes to update
 
       
      })
      
      .catch(function (err) {
        console.error(err);
      });
  },
};

$(function () {
  $(window).load(function () {
    App.init();
  });
});
