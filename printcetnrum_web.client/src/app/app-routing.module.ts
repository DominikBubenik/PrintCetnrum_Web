import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { RegisterPageComponent } from './pages/register-page/register-page.component';
import { EditPhotoPageComponent } from './pages/edit-photo-page/edit-photo-page.component';
import { UploadPhotoPageComponent } from './pages/upload-photo-page/upload-photo-page.component';
import { UsersListPageComponent } from './pages/users-list-page/users-list-page.component';
import { AuthGuard } from './guards/auth.guard';
import { ResetPasswordPageComponent } from './user-accounts/reset-password-page/reset-password-page.component';
import { UserFilesComponent } from './pages/user-files/user-files.component';
import { NewOrderComponent } from './orders/new-order/new-order.component';
import { AllOrdersListComponent } from './orders/all-orders-list/all-orders-list.component';
import { OrderDetailsComponent } from './orders/order-details/order-details.component';



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
  },
  {
    path: 'order-details/:id',
    component: OrderDetailsComponent,
    title: 'Order Details',
    pathMatch: 'full'
  },
  {
    path: 'upload',
    component: UploadPhotoPageComponent,
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
