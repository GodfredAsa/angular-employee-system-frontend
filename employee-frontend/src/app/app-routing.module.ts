import { AuthenenticationGuard } from './guard/authenentication.guard';
import { UserComponent } from './user/user.component';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: 'login', component: LoginComponent},
  { path: 'register', component: RegisterComponent},
  // you cannot access the user page unless authenticated
  // { path: 'user/management', component: UserComponent, canActivate: [AuthenenticationGuard]},
  { path: 'user/management', component: UserComponent},
  { path: '', redirectTo: '/login', pathMatch: 'full'}, // redirecting needs t=o have this route and must be last
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
