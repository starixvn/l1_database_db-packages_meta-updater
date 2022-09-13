export interface LookupStage {
  from        : string;
  localField  : string;
  foreignField: string;
  as          : string;
};

export default LookupStage;
