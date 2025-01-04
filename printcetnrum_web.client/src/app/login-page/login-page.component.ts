import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserStoreService } from "../services/user-store.service";

/**TODO make the form look better
 * add option to log in via google
 */
@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css'
})
export class LoginPageComponent {
  isPasswordVisible: boolean = false;
  public loginForm!: FormGroup;
  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    private userStore: UserStoreService
  ) { }

  ngOnInit() {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]], // Validators.email
      password: ['', Validators.required],
    });
  }

  togglePasswordVisibility(): void {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  onLogin() {
    console.log(this.loginForm.value);
    if (this.loginForm.valid) {
      console.log('Form submitted', this.loginForm.value);
      this.auth.loginUser(this.loginForm.value).subscribe({
        next: (res) => {

          this.auth.storeToken(res.accessToken);
          this.auth.storeRefreshToken(res.refreshToken);
          const tokenPayload = this.auth.decodedToken();
          this.userStore.setFullNameForStore(tokenPayload.unique_name);
          this.userStore.setRoleForStore(tokenPayload.role);
          this.snackBar.open('This is a snackbar message', 'Close', {
            duration: 3000,
            horizontalPosition: 'center',  
            verticalPosition: 'top',
            panelClass: 'app-notification-success'
          });
          this.loginForm.reset();
          this.router.navigate(['']);
        },
        error: (err) => {
          this.snackBar.open('This is a snackbar message', 'Close', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: 'app-notification-error',
          });
          console.log(err);
        },
      });
    } else {
      //ValidateForm.validateAllFormFields(this.loginForm);
      console.log('Form not valid');
      LoginPageComponent.validateAllFormFields(this.loginForm);
    }
  }

  static validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsDirty({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }
}
