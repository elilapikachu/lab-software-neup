import { Component, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { Navbar } from '../navbar/navbar';
import { Footer } from '../footer/footer';
import { AuthService } from '../../services/auth';
import { AlertService } from '../../services/alert';

@Component({
  selector: 'app-diet',
  imports: [RouterLink, Navbar, Footer],
  templateUrl: './diet.html',
  styleUrl: './diet.scss',
})
export class Diet {
  private alerts = inject(AlertService);
  constructor(private router: Router,
    private auth: AuthService
  ) { }

  onValidarAutenticado(): void {
    if (this.auth.estaAutenticado()) {
      this.router.navigate(['/creatediet']);
    } else {
      this.alerts.danger('¡No has iniciado sesión para crear una dieta!', { autoDismiss: 3000 });
    }

  }
}
