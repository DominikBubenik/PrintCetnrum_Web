import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { AuthService } from '../services/auth.service';

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
    //private router: Router,
    //private toast: NgToastService,
/*    private userStore: UserStoreService*/
  ) { }

  ngOnInit() {
    this.loginForm = this.fb.group({
      surname: ['', [Validators.required]], // Validators.email
      password: ['', Validators.required],
    });
  }

  togglePasswordVisibility(): void {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  onLogin() {
    if (this.loginForm.valid) {
      console.log('Form submitted', this.loginForm.value);
      this.auth.loginUser(this.loginForm.value).subscribe({
        next: (res) => {
          console.log(res.message);
          this.loginForm.reset();
          //this.auth.storeToken(res.accessToken);
          //this.auth.storeRefreshToken(res.refreshToken);
          //const tokenPayload = this.auth.decodedToken();
          //this.userStore.setFullNameForStore(tokenPayload.name);
          //this.userStore.setRoleForStore(tokenPayload.role);
          //this.toast.success({ detail: "SUCCESS", summary: res.message, duration: 5000 });
          //this.router.navigate(['dashboard'])
        },
        error: (err) => {
         //this.toast.error({ detail: "ERROR", summary: "Something when wrong!", duration: 5000 });
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
