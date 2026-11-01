/** Standard successful API envelope returned by the backend. */
export interface ApiResponse<T = unknown> {
  message: string;
  data: T;
}
