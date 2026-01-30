export type UnitOfMeasure = "day" | "week" | "month";

export interface Transaction {
  id: number;
  name: string;
  amount: number;
  start_date: string | Date;
  end_date: string | Date;
  frequency: number;
  uom: UnitOfMeasure;
}

export interface CalculationResult {
  date: Date;
  cash_flow: number;
  balance: number;
}

export interface ForecastData {
  results: CalculationResult[];
  startDate: Date;
  endDate: Date;
}
