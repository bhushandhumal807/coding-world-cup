/**
 * Player
 * ------
 * Information about one player and methods to control them.
 *
 * The information includes dynamic data such as the player's current
 * position and speed, as well as more static / config data such as
 * the player's skills and abilities.
 *
 * Most, but not all, of the data is serialized and passed to AIs
 * each turn of the game. Some data - in particular the player's
 * "intentions" are private, and are only available to the AI which
 * is controlling the player.
 */
var PlayerState_Dynamic = require('./PlayerState_Dynamic');
var PlayerState_Static = require('./PlayerState_Static');
var PlayerState_Intentions = require('./PlayerState_Intentions');
var UtilsLib = require('../utils');
var Utils = UtilsLib.Utils;

/**
 * @constructor
 */
function Player(playerNumber, playerType) {
    // Dynamic state (position etc)...
    this._dynamicState = new PlayerState_Dynamic();

    // Static state (skills, abilities etc)...
    this._staticState = new PlayerState_Static(playerNumber, playerType);

    // Intentions (direction, speed etc)...
    this._intentionsState = new PlayerState_Intentions();
}

/**
 * Maximum running speed, in metres/second.
 * If a player has runningAbility of 100.0 and chooses to run at
 * 100% speed, they will run at this rate.
 */
Player.MAX_SPEED = 10.0;

/**
 * The maximum energy that any player can have. All players start with
 * this energy. (Though players recuperate at different rates depending
 * on their stamina.)
 */
Player.MAX_ENERGY = 100.0;

/**
 * The maximum rate at which players turn, in degrees/second.
 */
Player.MAX_TURNING_RATE = 600.0;

/**
 * isPlayer
 * --------
 * Returns true if this player is a player (ie, not a goalkeeper).
 */
Player.prototype.isPlayer = function() {
    return this._staticState.playerType === PlayerState_Static.PlayerType.PLAYER;
};

/**
 * isGoalkeeper
 * ------------
 * Returns true if this player is a goalkeeper.
 */
Player.prototype.isGoalkeeper = function() {
    return this._staticState.playerType === PlayerState_Static.PlayerType.GOALKEEPER;
};

/**
 * updatePosition
 * --------------
 * Moves or turns the player based on their current intentions, speed
 * and so on, and on the time elapsed since the previous update.
 */
Player.prototype.updatePosition = function(game) {
    switch(this._intentionsState.action) {
        case PlayerState_Intentions.Action.TURN:
            this.updatePosition_Turn(game);
            break;

        case PlayerState_Intentions.Action.MOVE:
            this.updatePosition_Move(game);
            break;
    }
};

/**
 * updatePosition_Turn
 * -------------------
 * Turns the player towards their desired direction.
 */
Player.prototype.updatePosition_Turn = function(game) {
    // We work out whether we should be turning left or right...
    var currentDirection = this._dynamicState.direction;
    var desiredDirection = this._intentionsState.direction;
    var angleToTurn = desiredDirection - currentDirection;
    if(angleToTurn > 180) {
        // We are turning more than 180 degrees to the right,
        // so this is really a turn to the left...
        angleToTurn = angleToTurn - 360;
    }
    if(angleToTurn < -180) {
        // We are turning more than 180 degrees to the left,
        // so this is really a turn to the right...
        angleToTurn = 360 + angleToTurn;
    }

    // We change this to an abs(angle) and a direction...
    var directionToTurn = 1.0;
    if(angleToTurn < 0) {
        angleToTurn = -1.0 * angleToTurn;
        directionToTurn = -1.0;
    }

    // We find the maximum angle that can be turned in the interval
    // since the last update. We may need to cap the angle we move...
    var maxAngle = Player.MAX_TURNING_RATE * game.getCalculationIntervalSeconds();
    if(angleToTurn > maxAngle) {
        angleToTurn = maxAngle;
    }

    // We turn by the amount, and check if we've gone past 360 degrees...
    var newDirection = currentDirection + angleToTurn * directionToTurn;
    if(newDirection > 360.0) {
        newDirection -= 360.0;
    }
    if(newDirection < 0) {
        newDirection += 360.0;
    }

    // We set the new direction...
    this._dynamicState.direction = newDirection;
};

/**
 * updatePosition_Move
 * -------------------
 * Moves the player towards their desired position.
 */
Player.prototype.updatePosition_Move = function(game) {
    // We check if the player is already at the destination...
    var position = this._dynamicState.position;
    var destination = this._intentionsState.destination;
    if(position.approxEqual(destination)) {
        // The player is already at the destination...
        return;
    }

    // We check if the player is facing the right way...
    var currentDirection = this._dynamicState.direction;
    var directionToDestination = Utils.angleBetween(position, destination);
    if(!Utils.approxEqual(currentDirection, directionToDestination)) {
        // We are not currently facing the right way, so we turn first...
        this._intentionsState.direction = directionToDestination;
        this.updatePosition_Turn(game);
        return;
    }

    // We are facing the right direction, so we can move towards
    // the destination at the player's current speed...
    var distanceToDestination = position.distanceTo(destination);
    var distanceToMove = this.getSpeed() * game.getCalculationIntervalSeconds();
    if(distanceToDestination < distanceToMove) {
        distanceToMove = distanceToDestination;
    }

    // We find the vector to the destination, and scale it by the
    // distance to move...
    var vectorToDestination = position.vectorTo(destination);
    var scaleFactor = distanceToMove / distanceToDestination;
    var scaledVector = vectorToDestination.scale(scaleFactor);

    // We move the player...
    position.addVector(scaledVector);
};

/**
 * getSpeed
 * --------
 * Returns the current speed the player will move at in m/s.
 * This is a function of the player's max speed and current energy.
 */
Player.prototype.getSpeed = function() {
    var runningAbility = this._staticState.runningAbility / 100.0;
    var energy = this._dynamicState.energy / 100.0;
    var speed = runningAbility * energy * Player.MAX_SPEED;
    return speed;
};

/**
 * getStateForDTO
 * --------------
 * Returns an object holding the player's state.
 *
 * If publicOnly is true, then only the dynamic state is
 * returned. If false, all the state is returned.
 */
Player.prototype.getStateForDTO = function(publicOnly) {
    var state = {};
    state.dynamic = this._dynamicState;
    state.config = this._staticState;
    if(!publicOnly) {
        // We want to include the private data as well...
        state.intentions = this._intentionsState;
    }
    return state;
};

// Exports...
module.exports = Player;

