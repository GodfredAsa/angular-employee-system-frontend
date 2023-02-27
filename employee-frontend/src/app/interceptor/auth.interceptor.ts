
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthenticationService } from '../service/authentication.service';

/**
 * THE GENERAL CONCEPTS OF HTTPINTERCEPTOR: intercept requests from the frontend and add headers before sending it to the server
 * this is done as a best practice to keep the service clean and deviod of having to repeat ourselves by adding headers or
 * tokens to every request sends to the backend that requires a token.
 */

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authenticationService: AuthenticationService) {}

  intercept(httpRequest: HttpRequest<any>, HttpHandler: HttpHandler): Observable<HttpEvent<any>> {
    // does not modify login, register and reset password as no token is required request calls
    // endpoints that do not require passwords
  if(httpRequest.url.includes(`${this.authenticationService.host}/user/login`)){
    return HttpHandler.handle(httpRequest)
  }
  if(httpRequest.url.includes(`${this.authenticationService.host}/user/register`)){
    return HttpHandler.handle(httpRequest)
  }
  if(httpRequest.url.includes(`${this.authenticationService.host}/user/resetpassword`)){
    return HttpHandler.handle(httpRequest)
  }

  // getting the token from the local storage if the user has logged in before
  this.authenticationService.loadTokenFromLocalStorage();
  // assigning the token to a variable
  const token = this.authenticationService.getTokenFromLocalStorage();

  // get the request and add the token into it
  // this is done by cloning the request as the requests are immutable
  // and pass the cloned request to the handler
  const authorizedRequest = httpRequest.clone({
    setHeaders: { Authorization: `Bearer ${token}` }
  })
    return HttpHandler.handle(authorizedRequest)
  }
}
