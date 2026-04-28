import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { AlertService } from '../../services/alert';
import { Alert } from '../../models/secundary/alert';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [AsyncPipe],
  templateUrl: './alert.html',
  styleUrl: './alert.scss'
})
export class AlertComponent {
  private alertService = inject(AlertService);
  alerts$ = this.alertService.alerts$;

  dismiss(alert: Alert) {
    this.alertService.remove(alert.id);
  }

  iconFor(type: string): string {
    const icons: Record<string, string> = {
      success: '✓', danger: '✕', warning: '⚠', info: 'ℹ'
    };
    return icons[type] ?? 'ℹ';
  }
}