import { CompensationInterval } from '../enums/compensation-interval.enum';

export class CompensationDto {
  interval?: CompensationInterval | null;
  minAmount?: number | null;
  maxAmount?: number | null;
  currency?: string;

  constructor(partial?: Partial<CompensationDto>) {
    this.currency = 'USD';
    Object.assign(this, partial);
  }
}
