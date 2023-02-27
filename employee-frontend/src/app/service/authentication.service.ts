import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { User } from '../model/user';


@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  private host: string =  environment.apiUrl;
  private token: string;
  private loggedInUsername: string;
  private isTokenExpired: boolean;
  private jwtHelper = new JwtHelperService();

  constructor(private http: HttpClient) { }

  public login(user: User): Observable<HttpResponse<any> | HttpErrorResponse>{
    return this.http.post<HttpResponse<any> | HttpErrorResponse>(`${this.host}/user/login`, user, {observe: 'response'});
  }

  public register(user: User): Observable<User | HttpErrorResponse>{
    return this.http.post<User | HttpErrorResponse>(`${this.host}/user/register`, user);
  }

  public logout(): void {
    this.token = null;
    this.loggedInUsername = null;
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("users");
  }

  public saveTokenToLocalStorage(token: string): void {
    this.token = token;
    localStorage.setItem("token", token);
  }

  public addUserToLocalStorage(user: User): void {
    localStorage.setItem("user", JSON.stringify(user));
  }

  public getUserFromLocalStorage(): User {
    return JSON.parse(localStorage.getItem('user'));
  }

public loadTokenFromLocalStorage(): void{
   this.token = localStorage.getItem('token')
}

public getTokenFromLocalStorage(): string{
  return this.token;
}

//  implementation of jwt using installed dependency on video 107 on 3mins

public isLoggedIn(): boolean{
  this.loadTokenFromLocalStorage();
  if(this.token != null && this.token !==""){
    if(this.jwtHelper.decodeToken(this.token).sub != null || ""){
      if(!this.jwtHelper.isTokenExpired(this.token)){
        this.loggedInUsername = this.jwtHelper.decodeToken(this.token).sub;
        this.isTokenExpired = true;
      }
    }

  }else{
    this.logout();
    this.isTokenExpired =  false;
  }
  return this.isTokenExpired;
}

}
