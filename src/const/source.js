/**
 * @enum {string}
 * @readonly
 */
const Source = Object.freeze({
  USERS: Object.freeze({
    _ID       : 'users__id',
    MEMBERID  : 'users_memberId',
    PLAYERID  : 'users_playerId',
    WINNERID  : 'users_winnerId',
  }),
  QUEUE: Object.freeze({
    db: 'summary',
    coll: 'metadata_queue',
  }),
});

export default Source;
