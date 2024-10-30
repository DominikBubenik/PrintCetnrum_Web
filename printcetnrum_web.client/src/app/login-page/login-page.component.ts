import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

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
    //private auth: AuthService,
    //private router: Router,
    //private toast: NgToastService,
/*    private userStore: UserStoreService*/
  ) { }

  ngOnInit() {
    this.loginForm = this.fb.group({
      email: ['', Validators.required, Validators.email],
      password: ['', Validators.required],
    });
  }

  togglePasswordVisibility(): void {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  onSubmit() {
    if (this.loginForm.valid) {
      console.log('Form submitted', this.loginForm.value);
      //this.auth.signIn(this.loginForm.value).subscribe({
      //  next: (res) => {
      //    console.log(res.message);
      //    this.loginForm.reset();
      //    this.auth.storeToken(res.accessToken);
      //    this.auth.storeRefreshToken(res.refreshToken);
      //    const tokenPayload = this.auth.decodedToken();
      //    this.userStore.setFullNameForStore(tokenPayload.name);
      //    this.userStore.setRoleForStore(tokenPayload.role);
      //    this.toast.success({ detail: "SUCCESS", summary: res.message, duration: 5000 });
      //    this.router.navigate(['dashboard'])
      //  },
      //  error: (err) => {
      //    this.toast.error({ detail: "ERROR", summary: "Something when wrong!", duration: 5000 });
      //    console.log(err);
      //  },
      //});
    } else {
      //ValidateForm.validateAllFormFields(this.loginForm);
    }
  }
}
