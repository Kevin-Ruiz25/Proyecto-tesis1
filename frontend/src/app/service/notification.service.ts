import { Injectable } from "@angular/core";
import { MatSnackBar } from '@angular/material/snack-bar';

export enum VerticalPosition {
  top = 'top',
  bottom = 'bottom'
}

export enum HorizontalPosition {
  left = 'left',
  right = 'right',
  center = 'center'
}

interface Options {
  duration?: number,
  verticalPosition?: VerticalPosition,
  horizontalPosition?: HorizontalPosition,
  colorName?: string
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  constructor(private snackBar: MatSnackBar) {}

  success(message: string, options?: Options) {
    this.showNotification(message, 'snackbar-success', options);
  }
  danger(message: string, options?: Options) {
    this.showNotification(message, 'snackbar-danger', options);
  }
  warning(message: string, options?: Options) {
    this.showNotification(message, 'snackbar-warning', options);
  }
  info(message: string, options?: Options) {
    this.showNotification(message, 'snackbar-info', options);
  }
  private showNotification(message: string, panelClass: string, options?: Options) {
    this.snackBar.open(message, '', {
      duration: (options?.duration || 2500),
      verticalPosition: (options?.verticalPosition || VerticalPosition.bottom),
      horizontalPosition: (options?.horizontalPosition || HorizontalPosition.right),
      panelClass: (options?.colorName || panelClass)
    })
  }
}