export class User{

  public id: number;
  public userId: string;
  public firstNamee: string;
  public lastName: string;
  public username: string;
  public email: string;
  public logInDateDisplay: Date;
  public joinDate: Date;
  public profileImage: string;
  public active: boolean;
  public notLocked: boolean;
  public role: string;
  public authorities: [];

  constructor(){
    this.firstNamee = '';
    this.lastName = '';
    this.username = '';
    this.email = '';
    this.active = false;
    this.notLocked = false;
    this.profileImage = '';
    this.role = '';
    this.authorities = [];

  }


}
