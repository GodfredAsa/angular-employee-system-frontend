
// creating a custom http response according to the contract at the backend which us immutable 
export interface CustomHttpResponse{
  httpStatusCode: number;
  httpStatus: string;
  reason: string;
  message: string;
}
