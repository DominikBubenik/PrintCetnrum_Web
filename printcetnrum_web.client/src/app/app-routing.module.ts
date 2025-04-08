import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { RegisterPageComponent } from './pages/register-page/register-page.component';
import { UsersListPageComponent } from './pages/users-list-page/users-list-page.component';
import { AuthGuard } from './guards/auth.guard';
import { ResetPasswordPageComponent } from './user-accounts/reset-password-page/reset-password-page.component';
import { UserFilesComponent } from './pages/user-files/user-files.component';
import { NewOrderComponent } from './orders/new-order/new-order.component';
import { AllOrdersListComponent } from './orders/all-orders-list/all-orders-list.component';
import { OrderDetailsComponent } from './orders/order-details/order-details.component';
import {StampPageComponent} from "./pages/stamp-page/stamp-page.component";
import { DiplomaPageComponent } from './pages/diploma-page/diploma-page.component';
import { UserProfilePageComponent } from './pages/user-profile-page/user-profile-page.component';
import { UploadFileComponent } from './pages/upload-file/upload-file.component';
import {StatisticsComponent} from "./pages/statistics/statistics.component";
import { AdminGuard } from './guards/admin.guard';


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
    path: 'order-details/:id',
    component: OrderDetailsComponent,
    title: 'Order Details',
    pathMatch: 'full'
  },
  {
    path: 'upload',
    component: UploadFileComponent,
    title: 'Upload page',
    pathMatch: 'full'
  },{
    path: 'userFiles',
    component: UserFilesComponent,
    title: 'Data page',
    pathMatch: 'full'
  },{
    path: 'newOrder',
    component: NewOrderComponent,
    title: 'New Order',
    pathMatch: 'full'
  },{
    path: 'editStamp/:id',
    component: StampPageComponent,
    title: 'edit Stamp',
    pathMatch: 'full'
  },{
    path: 'allOrders',
    component: AllOrdersListComponent,
    title: 'All Orders',
    pathMatch: 'full'
  },
  {
    path: 'register',
    component: RegisterPageComponent,
    title: 'Register page',
    pathMatch: 'full'
  },
  {
    path: 'users',
    component: UsersListPageComponent,
    title: 'Users list',
    pathMatch: 'full',
    canActivate: [AdminGuard]
  },
  {
    path: 'editDiploma/:id',
    component: DiplomaPageComponent,
    title: 'Diploma',
    pathMatch: 'full',
    canActivate: [AuthGuard]
  },
  {
    path: 'userProfile',
    component: UserProfilePageComponent,
    title: 'Profile',
    pathMatch: 'full',
    canActivate: [AuthGuard]
  },
  {
    path: 'statistics',
    component: StatisticsComponent,
    title: 'Stats',
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
