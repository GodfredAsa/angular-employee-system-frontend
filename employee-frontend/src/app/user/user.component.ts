import { NotificationMessage } from './../enum/notification-message.enum';
import { NotificationType } from './../enum/notification-type.enum';
import { HttpErrorResponse } from '@angular/common/http';
import { User } from './../model/user';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { UserService } from '../service/user.service';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit, OnDestroy{

  private titleSubject = new BehaviorSubject<string>("Users");
  public titleAction$ = this.titleSubject.asObservable();
  public refreshing: boolean;
  public users: User[];
  private subscriptions: Subscription[] = [];
  public selectedUser: User;


  constructor(private userService: UserService, private toastr: ToastrService){}

  ngOnInit(): void {
    this.getUsers(true)
  }

  public changeTitle(title: string): void{
    this.titleSubject.next(title);
  }

  public getUsers(showNotification: boolean): void{
    this.refreshing = true;
    this.subscriptions.push (
      this.userService.getUsers().subscribe(
        (response: User[]) => {
          this.userService.addUsersToLocalStorage(response);
          this.users = response;
          this.refreshing = false;
          if(showNotification){
            this.toastr.success(`${response.length} user(s) loaded`)
          }
        },
        (errorResponse: HttpErrorResponse) => {
          this.toastr.error(NotificationMessage.DEFAULT_ERROR)
          this.refreshing = false;
        }))
  }

  public onSelectUser(selectedUser: User): void{
    this.selectedUser = selectedUser;
    console.log(this.selectedUser)
    document.getElementById("openUserInfo").click();

  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

}
