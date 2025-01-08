import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoginPageComponent } from '../../login-page/login-page.component';
import { ActivatedRoute, Router } from '@angular/router';
import { ResetPassword } from '../../models/reset-password.model';
import { ResetPasswordService } from '../../services/reset-password.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-reset-password-page',
  templateUrl: './reset-password-page.component.html',
  styleUrl: './reset-password-page.component.css'
})
export class ResetPasswordPageComponent implements OnInit{
  resetForm!: FormGroup;
  emailToReset!: string;
  emailToken!: string;
  resetPasswordObject = new ResetPassword();
  isPasswordVisible: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private resetService: ResetPasswordService,
    private router: Router,
    private snackBar: MatSnackBar,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.resetForm = this.formBuilder.group({
      newPassword: ['', Validators.required],
      confirmPassword: ['', Validators.required]
    });

    this.activatedRoute.queryParams.subscribe(val => {
      this.emailToReset = val['email'];
      let uriToken = val['code'];
      this.emailToken = uriToken.replace(/ /g,'+');
      console.log('email', this.emailToReset);
      console.log('token', this.emailToken);
    });
  }

  onPasswordChange(): void {
    if (this.resetForm.valid) {
      console.log('Form Submitted', this.resetForm.value);
      this.resetPasswordObject.email = this.emailToReset;
      this.resetPasswordObject.newPassword = this.resetForm.value.newPassword;
      this.resetPasswordObject.emailToken = this.emailToken;

      this.resetService.resetPassword(this.resetPasswordObject).subscribe({
        next: (res) => {
          this.resetForm.reset();
          this.router.navigate(['/']);
          this.snackBar.open('Password Changed Successfully!', 'Close', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: 'app-notification-success'
          });
        },
        error: (err) => { }
      });
      //this.auth.registerUser(this.resetForm.value).subscribe({
      //  next: (res) => {
      //    console.log(res.message);
      //    
      //  },
      //  error: (err) => {
      //    alert(err.error.message);
      //  }
      //});
    } else {
      LoginPageComponent.validateAllFormFields(this.resetForm);
    }
  }

  togglePasswordVisibility(): void {
    this.isPasswordVisible = !this.isPasswordVisible;
  }
}
