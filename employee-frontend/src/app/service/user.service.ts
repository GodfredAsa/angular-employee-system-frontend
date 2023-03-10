import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpEvent, HttpResponse } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { User } from '../model/user';
import { CustomHttpResponse } from '../model/custom-http-resonse';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private host: string =  environment.apiUrl;
  private users: User[];

  constructor(private http: HttpClient) { }

  public getUsers(): Observable<User [] | HttpErrorResponse >{
    return this.http.get<User[]>(`${this.host}/user/list`)
  }
  public addUser(formData: FormData): Observable<User | HttpErrorResponse >{
    return this.http.post<User>(`${this.host}/user/add`, formData)
  }

  public updateUser(formData: FormData): Observable<User | HttpErrorResponse >{
    return this.http.post<User>(`${this.host}/user/update`, formData)
  }

  public resetPassword(email: string): Observable<CustomHttpResponse | HttpErrorResponse >{
    return this.http.get<CustomHttpResponse>(`${this.host}/user/resetpassword/${email}`)
  }

  // this is an event
  public updateProfileImage(formData: FormData): Observable<HttpEvent<User>>{
    return this.http.post<User>(`${this.host}/user/updateProfileImage`,
          formData, {
            reportProgress: true,
            observe: 'events'
          })
  }

  public deleteUser(username: string): Observable<CustomHttpResponse | HttpErrorResponse> {
    return this.http.delete<CustomHttpResponse>(`${this.host}/user/delete/${username}`)}

  public addUsersToLocalStorage(users: User[]): void{
    localStorage.setItem('users', JSON.stringify(users))
  }

  public getUsersFromLocalStorage(): User[]{
    if(localStorage.getItem('users')){
      this.users =  JSON.parse(localStorage.getItem('users'))
    }
    return this.users;
  }


  // this is a utility method since i have only one of them I used it in here
  public createUserFormData(loggedInUsername: string, user: User, profileImage: File): FormData{
    const formData = new FormData();
    formData.append('currentUsername', loggedInUsername);
    formData.append('firstName', user.firstName);
    formData.append('lastName', user.lastName);
    formData.append('email', user.email);
    formData.append('username', user.username);
    formData.append('role', user.role);
    formData.append('isActive', JSON.stringify(user.active));
    formData.append('isNonLocked', JSON.stringify(user.notLocked));
    formData.append('profileImage', profileImage);
    return formData;

  }

}
