import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Alert, AlertType } from '../models/secundary/alert';

@Injectable({ providedIn: 'root' })
export class AlertService {
  private alertsSubject = new BehaviorSubject<Alert[]>([]);
  alerts$ = this.alertsSubject.asObservable();

  show(message: string, type: AlertType = 'info', options?: Partial<Alert>) {
    const alert: Alert = {
      id: crypto.randomUUID(),
      message,
      type,
      dismissible: true,
      ...options
    };

    this.alertsSubject.next([...this.alertsSubject.value, alert]);

    if (alert.autoDismiss) {
      setTimeout(() => this.remove(alert.id), alert.autoDismiss);
    }
  }

  success(msg: string, opts?: Partial<Alert>) { this.show(msg, 'success', opts); }
  danger(msg: string, opts?: Partial<Alert>)  { this.show(msg, 'danger', opts);  }
  warning(msg: string, opts?: Partial<Alert>) { this.show(msg, 'warning', opts); }
  info(msg: string, opts?: Partial<Alert>)    { this.show(msg, 'info', opts);    }

  remove(id: string) {
    this.alertsSubject.next(this.alertsSubject.value.filter(a => a.id !== id));
  }

  clear() { this.alertsSubject.next([]); }
}
