export const Source = Object.freeze({
  CONFIG: Object.freeze({
    db  : 'summary',
    coll: 'metadata_configs',
  }),
  QUEUE: Object.freeze({
    db  : 'summary',
    coll: 'metadata_queue',
  }),
  USERS: Object.freeze({
    _ID       : 'users__id',
    MEMBERID  : 'users_memberId',
    PLAYERID  : 'users_playerId',
    WINNERID  : 'users_winnerId',
  }),
});

export default Source;
