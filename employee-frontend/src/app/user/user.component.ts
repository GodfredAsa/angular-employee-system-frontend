import { FileUploadStatus } from './../model/file-upload.status';
import { AuthenticationService } from './../service/authentication.service';
import { CustomHttpResponse } from './../model/custom-http-resonse';
import { NotificationMessage } from './../enum/notification-message.enum';
import { HttpErrorResponse, HttpEvent, HttpEventType } from '@angular/common/http';
import { User } from './../model/user';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { UserService } from '../service/user.service';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';

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
  public editUser = new User();
  private currentUsername: string;
  public loginUser: User;
  public fileStatus = new FileUploadStatus();

  constructor(private router: Router,private userService: UserService, private toastr: ToastrService, private authenticationService: AuthenticationService){}

  ngOnInit(): void {
    this.getUsers(true)
    this.getLoggedInUser()
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
    this.clickButtonById("openUserInfo")
  }

  public onProfileImageChange(event: Event ): File{
    const target = event.target as HTMLInputElement;
      const files = target.files as FileList;
      this.fileName = files[0].name;
      return this.profileImage  = files[0]
  }

  public updateprofileImage(): void{
    this.clickButtonById("profile-image-input")

  }
//  UPDATE PROFILE CLICK FUNCTION
  public onUpdateProfileImage(): void{
    const formData = new FormData()
    formData.append("username", this.loginUser.username);
    formData.append("profileImage",  this.profileImage);

    this.subscriptions.push(
      this.userService.updateProfileImage(formData).subscribe(
        (event: HttpEvent<any>) => {
          this.reportImageUploadProgress(event);
        },
        (errorResponse: HttpErrorResponse) => {
          this.toastr.error(errorResponse.error.message)
          this.fileStatus.status = "Done"
        }))
  }

  private reportImageUploadProgress(event: HttpEvent<any>): void{

    switch(event.type){
      case HttpEventType.UploadProgress:
        this.fileStatus.percent  = Math.round((100 * event.loaded / event.total));
        this.fileStatus.status = "progress";
        break;

      case HttpEventType.Response:
        if(event.status === 200){
          this.loginUser.profileImageUrl = `${event.body.profileImageUrl}?time=${new Date().getTime()}`;
          this.toastr.success(`${event.body.firstName} ${NotificationMessage.PROFILE_IMAGE_UPLOAD_SUCCESS}`)
          this.fileStatus.status = "Done";
          break;
        }else{
          this.toastr.warning(`${NotificationMessage.PROFILE_IMAGE_UPLOAD_FAILURE} Try Again`)
          break;
        }
        default:
          `Finished All Processes`
    }
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
          user.userId.toString().toLowerCase().indexOf(seacrhName.toLowerCase())       !== -1 ){
            searchedUsers.push(user)
      }
    }
    this.users = searchedUsers;
    if(searchedUsers.length === 0 || !seacrhName){
      this.users = this.userService.getUsersFromLocalStorage()
    }
  }

  public onEditUser(selectedUser: User): void{
    this.editUser = selectedUser;
    this.currentUsername = selectedUser.username;
    this.clickButtonById("openUserEdit");
  }

  private getLoggedInUser(): User {
    this.loginUser = this.authenticationService.getUserFromLocalStorage();
    return this.loginUser;
  }

  public onUpdateUser(): void{
     // save the form data;
     const formData = this.userService.createUserFormData(this.currentUsername, this.editUser, this.profileImage);
     // makes an http call so we need to subscribe to it
     this.subscriptions.push(
     this.userService.updateUser(formData).subscribe(
      ( response: User) => {
       this.clickButtonById("closeEditUserModalButton")
       this.getUsers(false);
       // removing all data in the forms
       this.fileName = null;
       this.profileImage = null;
       this.toastr.success(`${response.firstName} updated Successfully Added`);
      },
      (errorResponse: HttpErrorResponse) => {
       this.toastr.error(errorResponse.error.message);
       this.profileImage = null;
      }))
  }

  public onResetPassword(emailForm: NgForm): void{
    this.refreshing = true;
    const emailAddress = emailForm.value['reset-password-email']
    this.subscriptions.push(
      this.userService.resetPassword(emailAddress).subscribe(
        (response: CustomHttpResponse) =>{
          this.toastr.success(response.message);
          this.getUsers(false)
          this.refreshing = false
        },
        (errorResponse: HttpErrorResponse) => {
          this.toastr.warning(errorResponse.error.message);
          this.refreshing = false
        },
        () => emailForm.reset()
      ))
  }

  public onDeleteUser(user: User): void{
    this.subscriptions.push(
      this.userService.deleteUser(user.username).subscribe(
        (response: CustomHttpResponse) => {
          this.toastr.success(response.message);
          this.getUsers(true)
        },
        (errorResponse: HttpErrorResponse) =>{
          this.toastr.error(errorResponse.error.message)
        }))
  }

  public onLogout(): void{
    this.authenticationService.logout()
    this.router.navigateByUrl('/login')
    this.toastr.success(NotificationMessage.LOGOUT_SUCCESS)
  }

  public onUpdateCurrentUser(user: User): void{
   this.currentUsername =  this.authenticationService.getUserFromLocalStorage().username;
   this.refreshing = true
     // save the form data;
     const formData = this.userService.createUserFormData(this.currentUsername, user, this.profileImage);
     // makes an http call so we need to subscribe to it
     this.subscriptions.push(
     this.userService.updateUser(formData).subscribe(
      ( response: User) => {
       this.getUsers(false);
       // removing all data in the forms
       this.authenticationService.addUserToLocalStorage(response)
       this.fileName = null;
       this.profileImage = null;
       this.toastr.success(`${response.firstName} updated Successfully Added`);
       this.refreshing = true
      },
      (errorResponse: HttpErrorResponse) => {
       this.toastr.error(errorResponse.error.message);
       this.profileImage = null;
       this.refreshing = false;
      }))

  }

  private clickButtonById(buttonId: string): void {
    document.getElementById(buttonId).click()
  }


  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

}
