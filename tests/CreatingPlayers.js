var UtilsLib = require('../utils');
var Utils = UtilsLib.Utils;
var TestUtilsLib = require('../test_utils');
var MockAIWrapper = TestUtilsLib.MockAIWrapper;
var MockGame_CalculationInterval = TestUtilsLib.MockGame_CalculationInterval;


/**
 * Tests that a newly created game has the expected number of _players.
 */
exports['Expected number of players created'] = function(test) {
    // We create a new game...
    var game = new MockGame_CalculationInterval(1.0);

    // We check the number of _players...
    var numberOfPlayers = Utils.countIf(game._players, function(player) { return player.isPlayer(); });
    test.equal(numberOfPlayers, 10);

    // We check that there are two goalkeepers...
    var numberOfKeepers = Utils.countIf(game._players, function(player) { return player.isGoalkeeper(); });
    test.equal(numberOfKeepers, 2);

    test.done();
};

