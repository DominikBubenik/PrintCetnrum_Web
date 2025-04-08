import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './navbar/navbar.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RegisterPageComponent } from './pages/register-page/register-page.component';
import { FormsModule } from '@angular/forms';
import { UsersListPageComponent } from './pages/users-list-page/users-list-page.component';
import { TokenInterceptor } from './interceptors/token.interceptor';
import { ResetPasswordPageComponent } from './user-accounts/reset-password-page/reset-password-page.component';
import { UserFilesComponent } from './pages/user-files/user-files.component';
import { NewOrderComponent } from './orders/new-order/new-order.component';
import { AllOrdersListComponent } from './orders/all-orders-list/all-orders-list.component';
import { OrderDetailsComponent } from './orders/order-details/order-details.component';
import { ConfirmModalComponent } from './shared/confirm-modal/confirm-modal.component';
import { StampPageComponent } from './pages/stamp-page/stamp-page.component'
import { FileCardComponentComponent } from './shared/file-card-component/file-card-component.component';
import { DiplomaPageComponent } from './pages/diploma-page/diploma-page.component';
import { UserProfilePageComponent } from './pages/user-profile-page/user-profile-page.component';
import { UploadFileComponent } from './pages/upload-file/upload-file.component';
import { SelectedFilesListComponent } from './shared/selected-files-list/selected-files-list.component';
import { StatisticsComponent } from './pages/statistics/statistics.component'
import {MatCard, MatCardContent, MatCardHeader, MatCardTitle} from "@angular/material/card";
import {NgxChartsModule} from "@swimlane/ngx-charts";
import {MatTable} from "@angular/material/table";
import {MatProgressSpinner} from "@angular/material/progress-spinner";


@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    HomePageComponent,
    LoginPageComponent,
    RegisterPageComponent,
    UsersListPageComponent,
    ResetPasswordPageComponent,
    UserFilesComponent,
    NewOrderComponent,
    AllOrdersListComponent,
    OrderDetailsComponent,
    ConfirmModalComponent,
    StampPageComponent,
    FileCardComponentComponent,
    DiplomaPageComponent,
    UserProfilePageComponent,
    UploadFileComponent,
    SelectedFilesListComponent,
    StatisticsComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    MatToolbarModule, MatButtonModule, MatIconModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    CommonModule,
    FormsModule,
    AppRoutingModule,
    NgbModule, MatCard, MatCardContent, MatCardTitle, MatCardHeader, NgxChartsModule, MatTable, MatProgressSpinner
  ],
  providers: [
    provideAnimationsAsync(),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
