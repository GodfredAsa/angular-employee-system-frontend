import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { NotificationType } from '../enum/notification-type.enum';
import { AuthenticationService } from '../service/authentication.service';
import { NotificationService } from '../service/notification.service';

@Injectable({
  providedIn: 'root'
})
export class AuthenenticationGuard implements CanActivate {
  private isAuthenticated: boolean = false;

  constructor(private authenticationService: AuthenticationService,
              private router: Router,
              private notificationService: NotificationService) {}

  canActivate(
    next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
      this.isAuthenticated = this.isUserLoggedIn();
    return this.isAuthenticated;
  }

  private isUserLoggedIn(): boolean{
    if(this.authenticationService.isUserLoggedIn()){
      this.isAuthenticated = true;
    } this.router.navigate(['/login']);

    // TODO send notification
    this.notificationService.showNotification(NotificationType.ERROR, "You need to log in to access this page".toUpperCase())

    return this.isAuthenticated;

  }

}
