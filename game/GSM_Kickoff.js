/**
 * GSM_Kickoff
 * -----------
 * Manages play at kickoff.
 *
 * Requests player positions for he kickoff from the two teams, and
 * starts play when it has received them.
 */
var GSM_Base = require('./GSM_Base');
var UtilsLib = require('../utils');
var Utils = UtilsLib.Utils;
var CWCError = UtilsLib.CWCError;
var GSM_Play = require('./GSM_Play');


/**
 * @constructor
 */
function GSM_Kickoff(game, teamToKickOff) {
    // We call the base class constructor...
    GSM_Base.call(this, game);

    // We store the team kicking off...
    this._teamToKickOff = teamToKickOff;

    // We send the KICKOFF event...
    var event = {
        eventType:'KICKOFF',
        team1:game.getTeam1().state,
        team2:game.getTeam2().state,
        teamKickingOff:teamToKickOff.getTeamNumber()
    };
    game.sendEvent(event, true, true);

    // And the request...
    this.sendRequestToBothAIs({requestType:'KICKOFF'});
}
Utils.extend(GSM_Base, GSM_Kickoff); // Derived from GSM_Base.
module.exports = GSM_Kickoff;

/**
 * onAIResponsesReceived
 * ---------------------
 * Called when we have received responses from both AIs.
 */
GSM_Kickoff.prototype.onAIResponsesReceived = function() {
    // We clear all actions and set the players to their
    // default kickoff positions...
    this._game.clearAllActions();
    this._game.setDefaultKickoffPositions();

    // We process the two responses...
    this._processResponse(this._aiResponses.AI1.data, this._team1);
    this._processResponse(this._aiResponses.AI2.data, this._team2);

    // We play the next turn...
    this._game.setGameState(new GSM_Play(this._game));
    this._game.playNextTurn();
};

/**
 * _processResponse
 * ----------------
 * Checks that the response is the right type, and passes it to the
 * team to process.
 */
GSM_Kickoff.prototype._processResponse = function (data, team) {
    try {
    // We check that we got a PLAY response...
    if(data.requestType !== 'KICKOFF') {
        throw new CWCError('Expected a KICKOFF response.')
    }

    // We got a KICKOFF response, so we pass it to the Team to process...
    var isTeamKickingOff =  (team === this._teamToKickOff);
    team.processKickoffResponse(this._game, data, isTeamKickingOff);
    } catch(ex) {
        // We log the error and report it back to the AI...
        team.getAI().sendError(ex.message);
    }
};


