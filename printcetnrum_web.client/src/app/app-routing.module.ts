import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePageComponent } from './home-page/home-page.component';
import { LoginPageComponent } from './login-page/login-page.component';
import { AboutPageComponent } from './about-page/about-page.component';
import { RegisterPageComponent } from './register-page/register-page.component';
import { EditPhotoPageComponent } from './edit-photo-page/edit-photo-page.component';
import { UploadPhotoPageComponent } from './upload-photo-page/upload-photo-page.component';

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
    path: 'edit',
    component: EditPhotoPageComponent,
    title: 'Edit page',
    pathMatch: 'full'
  },{
    path: 'upload',
    component: UploadPhotoPageComponent,
    title: 'Edit page',
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
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
