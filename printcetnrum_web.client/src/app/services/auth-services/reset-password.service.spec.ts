import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ResetPasswordService } from './reset-password.service';
import { ResetPassword } from '../../models/user-models/reset-password.model';

describe('ResetPasswordService', () => {
  let service: ResetPasswordService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ResetPasswordService]
    });
    service = TestBed.inject(ResetPasswordService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should send reset password link', () => {
    const email = 'test@example.com';
    const mockResponse = { message: 'Reset password email sent successfully!' };

    service.sendResetPasswordLink(email).subscribe(response => {
      expect(response.message).toBe('Reset password email sent successfully!');
    });

    const req = httpMock.expectOne(`https://localhost:7074/api/User/send-reset-email/${email}`);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('should reset password', () => {
    const resetPasswordObj: ResetPassword = {
      email: 'new@email.com',
      emailToken: 'dummy-token',
      newPassword: 'new-password',
      confirmPassword: 'new-password'
    };
    const mockResponse = { message: 'Password reset successful!' };

    service.resetPassword(resetPasswordObj).subscribe(response => {
      expect(response.message).toBe('Password reset successful!');
    });

    const req = httpMock.expectOne('https://localhost:7074/api/User/reset-password');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(resetPasswordObj);
    req.flush(mockResponse);
  });
});
