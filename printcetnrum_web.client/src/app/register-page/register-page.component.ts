import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoginPageComponent } from '../login-page/login-page.component';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-register-page',
  templateUrl: './register-page.component.html',
  styleUrls: ['./register-page.component.css'] // Update with your CSS path
})
export class RegisterPageComponent implements OnInit {
  registerForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private auth: AuthService
  ) {
    // Initialize the form group with validators
    this.registerForm = this.formBuilder.group({
      firstname: ['', Validators.required],
      lastName: ['', Validators.required],
      userName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required]
    });
  }

  ngOnInit(): void { }

  onRegister(): void {
    if (this.registerForm.valid) {
      console.log('Form Submitted', this.registerForm.value);

      this.auth.registerUser(this.registerForm.value).subscribe({
        next: (res) => {
          console.log(res.message);
          this.registerForm.reset();
        },
        error: (err) => {
          alert(err.error.message);
        }
      });
    } else {
      LoginPageComponent.validateAllFormFields(this.registerForm);
    }
  }
}

