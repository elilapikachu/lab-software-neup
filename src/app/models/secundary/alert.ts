export type AlertType = 'success' | 'danger' | 'warning' | 'info';

export interface Alert {
  id: string;
  type: AlertType;
  message: string;
  dismissible?: boolean;
  autoDismiss?: number;
}
