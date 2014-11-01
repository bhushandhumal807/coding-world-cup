/**
 * PlayerState_Static
 * ------------------
 * Holds static state for a player, such as their skills
 * and abilities, maximum speed and so on.
 *
 * These values may not be entirely static throughout a game.
 * Some can change, for example as a result of injuries. But they
 * are much more 'static' than other more dynamic attributes such
 * as the player's position.
 *
 * Skills and other attributes are values between 0.0 - 100.0, unless
 * otherwise indicated.
 */

/**
 * @constructor
 */
function PlayerState_Static() {
    // How accurately the player passes the ball. This also
    // controls kicking when not passing, including shooting
    // at goal...
    this.passingAbility = 0.0;
}

// Exports...
module.exports = PlayerState_Static;
