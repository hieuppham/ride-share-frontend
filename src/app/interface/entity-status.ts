interface EEntityStatus {
  [key: string]: string;
}

export const ENTITY_STATUS: EEntityStatus = {
  UNKNOWN: 'UNKNOWN',
  PENDING: 'PENDING',
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  EXPIRED: 'EXPIRED',
};
