import { NotificationMessage } from './../enum/notification-message.enum';
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { User } from '../model/user';
import { NotificationService } from '../service/notification.service';
import { Router } from '@angular/router';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthenticationService } from '../service/authentication.service';
import { Subscription } from 'rxjs';
import { NotificationType } from '../enum/notification-type.enum';
import { HeaderType } from '../enum/header-type.enum';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
  public showLoading: boolean;
  private subscriptions: Subscription[] = []
  private notificationService: NotificationService;

  constructor(private router: Router, private authenticationService: AuthenticationService, private toastr: ToastrService) { }

  ngOnInit(): void {
    if (this.authenticationService.isUserLoggedIn()) {
      this.router.navigateByUrl('/user/management')
    } else {
      this.router.navigateByUrl('/login');
    }
  }

  public onLogin(user: User) {
    this.showLoading = true;
    this.subscriptions.push(
      this.authenticationService.login(user).subscribe(
        (response: HttpResponse<User>) => {
          const token = response.headers.get(HeaderType.JWT_TOKEN);
          this.authenticationService.saveTokenToLocalStorage(token);
          this.sendSuccessNotification(NotificationMessage.LOGIN_SUCCESS)
          this.authenticationService.addUserToLocalStorage(response.body)
          this.router.navigateByUrl('/user/management');
          this.showLoading = false;
        },
        (errorResponse: HttpErrorResponse) => {
          this.sendErrorNotification(errorResponse.error.message);
          this.showLoading = false;
        }
      ))
  }

  private sendErrorNotification(message: string): void {
    if (message) {
        this.toastr.error(message);
    } else {
      this.toastr.error(NotificationMessage.DEFAULT_ERROR)
    }
  }

  private sendSuccessNotification(message: NotificationMessage): void{
    this.toastr.success(message);
  }

  // this is done to handle memory leaks
  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
