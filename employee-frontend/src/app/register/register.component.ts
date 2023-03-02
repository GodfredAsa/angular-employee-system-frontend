import { NotificationMessage } from './../enum/notification-message.enum';
import { HttpErrorResponse } from '@angular/common/http';
import { User } from '../model/user';
import { Router } from '@angular/router';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthenticationService } from '../service/authentication.service';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit, OnDestroy{

  public showLoading: boolean;
  private subscriptions: Subscription[] = []

  constructor(private router: Router, private authenticationService: AuthenticationService, private toastr: ToastrService) { }

  ngOnInit(): void {
    if (this.authenticationService.isUserLoggedIn()) {
      this.router.navigateByUrl('/user/management')
    }
  }

    public onRegister(user: User){
      this.showLoading = true;
      this.subscriptions.push(
        this.authenticationService.register(user).subscribe(
          (response: User) => {
              this.sendNotification(`${NotificationMessage.REGISTRATION_SUCCESS}. Check ${response.email} for password`)
              this.router.navigateByUrl('/login')
              this.showLoading = false;
          },
          (errorResponse: HttpErrorResponse) => {
                    this.toastr.error(errorResponse.error.message)
                    this.showLoading = false;
                  }
        ))
    }

  private sendNotification(message: string): void {
    if (message) {
        this.toastr.success(message);
    } else {
      this.toastr.error(NotificationMessage.DEFAULT_ERROR)
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

}
