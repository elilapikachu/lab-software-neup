import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar implements OnInit {

  nombreUsuario: string | null = null;
  estaLogueado = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.verificarSesion();
  }

  verificarSesion(): void {
    this.estaLogueado = this.authService.estaAutenticado();
    this.nombreUsuario = this.authService.getNombreUsuario();
  }

  cerrarSesion(): void {
    this.authService.cerrarSesion();
    this.estaLogueado = false;
    this.nombreUsuario = null;
    this.router.navigate(['/loginandregister']);
  }
}