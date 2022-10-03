import { MetaLookupInput, MetaLookup } from '../models/meta-lookup';
import { USERS } from './source';

export const SourceLookup = Object.freeze({
  [USERS._ID]: new MetaLookup({
    from        : 'users',
    localField  : 'ouid',
    foreignField: '_id',
    as          : USERS._ID,
    project     : { $toObjectId: '$uid' },
  } as MetaLookupInput),
  [USERS.MEMBERID]: new MetaLookup({
    from        : 'users',
    localField  : 'memberId',
    foreignField: 'local.memberId',
    as          : USERS.MEMBERID,
    filter      : { memberId: { $gt: 0 } },
    project     : 1,
  } as MetaLookupInput),
  [USERS.PLAYERID]: new MetaLookup({
    from        : 'users',
    localField  : 'playerId',
    foreignField: 'local.memberId',
    as          : USERS.PLAYERID,
    filter      : { playerId: { $gt: 0 } },
    project     : 1,
  } as MetaLookupInput),
  [USERS.WINNERID]: new MetaLookup({
    from        : 'users',
    localField  : 'winnerId',
    foreignField: 'local.memberId',
    as          : USERS.WINNERID,
    filter      : { winnerId: { $gt: 0 } },
    project     : 1,
  } as MetaLookupInput),
  [USERS.SELF]: new MetaLookup({
    from        : 'users',
    localField  : '_id',
    foreignField: '_id',
    as          : USERS.SELF,
    filter      : { 'local.memberId': { $gt: 0 } },
    project     : 1,
  } as MetaLookupInput),
});

export default SourceLookup;
