import MetaLookup from "../models/meta-lookup";
import Source     from "./source";

export const SourceLookup = Object.freeze({
  [Source.USERS._ID]: new MetaLookup({
    from        : 'users',
    localField  : 'ouid',
    foreignField: '_id',
    as          : Source.USERS._ID,
    project     : { $toObjectId: '$uid' },
  }),
  [Source.USERS.MEMBERID]: new MetaLookup({
    from        : 'users',
    localField  : 'memberId',
    foreignField: 'local.memberId',
    as          : Source.USERS.MEMBERID,
    filter      : { memberId: { $gt: 0 } },
    project     : 1,
  }),
  [Source.USERS.PLAYERID]: new MetaLookup({
    from        : 'users',
    localField  : 'playerId',
    foreignField: 'local.memberId',
    as          : Source.USERS.PLAYERID,
    filter      : { playerId: { $gt: 0 } },
    project     : 1,
  }),
  [Source.USERS.WINNERID]: new MetaLookup({
    from        : 'users',
    localField  : 'winnerId',
    foreignField: 'local.memberId',
    as          : Source.USERS.WINNERID,
    filter      : { winnerId: { $gt: 0 } },
    project     : 1,
  }),
});

export default SourceLookup;
