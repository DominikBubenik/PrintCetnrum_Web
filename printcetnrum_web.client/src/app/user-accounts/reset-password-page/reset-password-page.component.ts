import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoginPageComponent } from '../../pages/login-page/login-page.component';
import { ActivatedRoute, Router } from '@angular/router';
import { ResetPassword } from '../../models/reset-password.model';
import { ResetPasswordService } from '../../services/reset-password.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackBarUtil } from '../../shared/snackbar-util';

@Component({
  selector: 'app-reset-password-page',
  templateUrl: './reset-password-page.component.html',
  styleUrls: ['./reset-password-page.component.css']
})
export class ResetPasswordPageComponent implements OnInit {
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
  ) { }

  ngOnInit(): void {
    this.resetForm = this.formBuilder.group({
      newPassword: ['', Validators.required],
      confirmPassword: ['', Validators.required]
    });

    this.activatedRoute.queryParams.subscribe(val => {
      this.emailToReset = val['email'];
      let uriToken = val['code'];
      this.emailToken = uriToken.replace(/ /g, '+');
    });
  }

  onPasswordChange(): void {
    if (this.resetForm.valid) {
      this.resetPasswordObject.email = this.emailToReset;
      this.resetPasswordObject.newPassword = this.resetForm.value.newPassword;
      this.resetPasswordObject.emailToken = this.emailToken;

      this.resetService.resetPassword(this.resetPasswordObject).subscribe({
        next: (res) => {
          this.resetForm.reset();
          this.router.navigate(['/login']);
          SnackBarUtil.showSnackBar(this.snackBar, 'Password Changed Successfully!', 'success');
        },
        error: (error) => {
          SnackBarUtil.showSnackBar(this.snackBar, 'Password Reset Failed. ' + error?.error?.message, 'error');
        }
      });
    } else {
      LoginPageComponent.validateAllFormFields(this.resetForm);
    }
  }

  togglePasswordVisibility(): void {
    this.isPasswordVisible = !this.isPasswordVisible;
  }
}
