import { NotificationMessage } from './../enum/notification-message.enum';
import { NotificationType } from './../enum/notification-type.enum';
import { HttpErrorResponse } from '@angular/common/http';
import { User } from './../model/user';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { UserService } from '../service/user.service';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';


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
  public fileName: string;
  public profileImage: File;

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
            console.log(this.users)
          }
        },
        (errorResponse: HttpErrorResponse) => {
          this.toastr.error(NotificationMessage.DEFAULT_ERROR)
          this.refreshing = false;
        }))
  }

  public onSelectUser(selectedUser: User): void{
    this.selectedUser = selectedUser;
    this.clickButtonById("openUserInfo")
  }

  public onProfileImageChange(event: Event ): void{
    const target = event.target as HTMLInputElement;
      const files = target.files as FileList;
      this.fileName = files[0].name;
      this.profileImage  = files[0]
  }

  public saveNewUser(): void{
    this.clickButtonById("new-user-save")
  }

  public onAddNewUser(userForm: NgForm): void {
    // save the form data;
    const formData = this.userService.createUserFormData(null, userForm.value, this.profileImage);
    // makes an http call so we need to subscribe to it
    this.subscriptions.push(
    this.userService.addUser(formData).subscribe(
     ( response: User) => {
      this.clickButtonById("new-user-close")
      this.getUsers(false);
      // removing all data in the forms
      this.fileName = null;
      this.profileImage = null;
      userForm.reset()
      this.toastr.success(`${response.firstName} Successfull Added`);
     },
     (errorResponse: HttpErrorResponse) => {
      this.toastr.error(errorResponse.error.message);
      this.profileImage = null;
     }))
  }

  public searchUsers(seacrhName: string): void{
    const searchedUsers: User[] = []
    for( let user of this.userService.getUsersFromLocalStorage()){
      if(user.firstName.toLowerCase().indexOf(seacrhName.toLowerCase()) !== -1 ||
          user.lastName.toLowerCase().indexOf(seacrhName.toLowerCase())     !== -1 ||
          user.email.toLowerCase().indexOf(seacrhName.toLowerCase())        !== -1 ||
          user.username.toLowerCase().indexOf(seacrhName.toLowerCase())     !== -1 ||
          user.userId.toLowerCase().indexOf(seacrhName.toLowerCase())       !== -1 ){
            searchedUsers.push(user)
      }
    }
    this.users = searchedUsers;
    if(searchedUsers.length === 0 || !seacrhName){
      this.users = this.userService.getUsersFromLocalStorage()
    }
  }

  private clickButtonById(buttonId: string): void {
    document.getElementById(buttonId).click()
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

}
