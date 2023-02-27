import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthenticationService } from '../service/authentication.service';

@Injectable({
  providedIn: 'root'
})
export class AuthenenticationGuard implements CanActivate {

  constructor(private authenticationService: AuthenticationService, private router: Router){}
  canActivate(
    next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return this.isUserLoggedIn();
  }

  private isUserLoggedIn(): boolean{
    if(this.authenticationService.isUserLoggedIn()){
      return true;
    } this.router.navigate(['/login']);

    // TODO send notification
    return false;

  }

}
