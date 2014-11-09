/**
 * Team
 * ----
 * Manages one team, including the collection of players in it.
 */
var TeamState = require('./TeamState');

/**
 * @constructor
 */
function Team() {
    // The team state (score etc)...
    this._state = new TeamState();

    // The collection of _players.
    // (The player objects are created in the Game, and passed to us later)...
    this._players = [];
}

/**
 * Adds a player to this team.
 */
Team.prototype.addPlayer = function(player) {
    this._players.push(player);
};

/**
 * Updates the positions of the _players using the current time
 * from the game.
 */
Team.prototype.updatePositions = function(game) {
    this._players.forEach(function(player){
        player.updatePosition();
    });
};

/**
 * getStateForDTO
 * --------------
 * Returns the state of this object and its players.
 *
 * If publicOnly is true, then only public (dynamic) data about
 * the players will be included.
 */
Team.prototype.getStateForDTO = function(publicOnly) {
    var state = {};
    state.team = this._state;
    state.players = this._players.map(function(player) {
        return player.getStateForDTO(publicOnly);
    });
    return state;
};

// The number of _players on each team (not including the goalkeeper)...
Team.NUMBER_OF_PLAYERS = 5;

// Exports...
module.exports = Team;