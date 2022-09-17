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

export const UNKNOWN: string = 'UNKNOWN';
export const PENDING: string = 'PENDING';
export const PREPARE: string = 'PREPARE';
export const ACTIVE: string = 'ACTIVE';
export const INACTIVE: string = 'INACTIVE';
export const EXPIRED: string = 'EXPIRED';
export const DISABLE: string = 'DISABLE';
