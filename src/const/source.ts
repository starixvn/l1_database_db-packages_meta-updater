import CollNamespace from '../interfaces/coll-namespace';

export const CONFIG: CollNamespace = Object.freeze({
  db  : 'summary',
  coll: 'metadata_configs',
});

export const QUEUE: CollNamespace = Object.freeze({
  db  : 'summary',
  coll: 'metadata_queue',
});

export enum USERS {
  _ID       = 'users__id',
  MEMBERID  = 'users_memberId',
  PLAYERID  = 'users_playerId',
  WINNERID  = 'users_winnerId',
  SELF      = 'users_self',
};

const Source = Object.freeze({ CONFIG, QUEUE, USERS });
export default Source;
