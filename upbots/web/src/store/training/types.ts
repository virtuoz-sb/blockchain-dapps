import { ErrorResponse } from "../error-response";

export interface TrainingState {
  loading: boolean;
  search: string;
  error: ErrorResponse | null;
  training: any[];
  activeFilters: any;
  availableFilters: any;
}
