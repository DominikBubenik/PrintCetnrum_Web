import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePageComponent } from './home-page/home-page.component';
import { LoginPageComponent } from './login-page/login-page.component';
import { AboutPageComponent } from './about-page/about-page.component';
import { RegisterPageComponent } from './register-page/register-page.component';
import { EditPhotoPageComponent } from './edit-photo-page/edit-photo-page.component';
import { UploadPhotoPageComponent } from './upload-photo-page/upload-photo-page.component';
import { UsersListPageComponent } from './users-list-page/users-list-page.component';
import { AuthGuard } from './guards/auth.guard';
import { ResetPasswordPageComponent } from './user-accounts/reset-password-page/reset-password-page.component';
import { UserFilesComponent } from './user-files/user-files.component';



const routes: Routes = [
  {
    path: '',
    component: HomePageComponent,
    title: 'Home page',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginPageComponent,
    title: 'Login page',
    pathMatch: 'full'
  },
  {
    path: 'edit/:id',
    component: EditPhotoPageComponent,
    title: 'Edit page',
    pathMatch: 'full'
  },{
    path: 'upload',
    component: UploadPhotoPageComponent,
    title: 'Upload page',
    pathMatch: 'full'
  },{
    path: 'userFiles',
    component: UserFilesComponent,
    title: 'Data page',
    pathMatch: 'full'
  },
  {
    path: 'register',
    component: RegisterPageComponent,
    title: 'Register page',
    pathMatch: 'full'
  },
  {
    path: 'about',
    component: AboutPageComponent,
    title: 'About page',
    pathMatch: 'full'
  },
  {
    path: 'users',
    component: UsersListPageComponent,
    title: 'Users list',
    pathMatch: 'full',
    canActivate: [AuthGuard]
  },
  {
    path: 'reset',
    component: ResetPasswordPageComponent,
    title: 'Reset Password',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
