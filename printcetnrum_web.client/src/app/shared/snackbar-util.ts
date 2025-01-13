import { MatSnackBar } from '@angular/material/snack-bar';

export class SnackBarUtil {
  static showSnackBar(
    snackBar: MatSnackBar,
    message: string,
    type: 'success' | 'error' | 'warning'
  ): void {
    const panelClass = `app-notification-${type}`;
    snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass,
    });
  }
}
