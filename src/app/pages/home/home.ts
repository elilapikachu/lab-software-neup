import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Navbar } from '../../layout/navbar/navbar';
import { Footer } from '../../layout/footer/footer';
import { RecetaResponse } from '../../models/receta';
import { DietaResponse } from '../../models/dieta';
import { RecetaService } from '../../services/receta.service';
import { DietaService } from '../../services/dieta.service';
import { AppConstants } from '../../app.constantes';

@Component({
  selector: 'app-home',
  imports: [RouterLink, Navbar, Footer, CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {

  recetas: RecetaResponse[] = [];
  dietas:  DietaResponse[]  = [];

  cargandoRecetas = true;
  cargandoDietas  = true;
  errorRecetas    = false;
  errorDietas     = false;

  constructor(
    private recetaService: RecetaService,
    private dietaService:  DietaService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.recetaService.obtenerPublicas().subscribe({
      next: (data) => {
        this.recetas         = data.slice(0, 3);
        this.cargandoRecetas = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorRecetas    = true;
        this.cargandoRecetas = false;
        this.cdr.detectChanges();
      },
    });
    this.dietaService.obtenerPublicas().subscribe({
      next: (data) => {
        this.dietas         = data.slice(0, 3);
        this.cargandoDietas = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorDietas    = true;
        this.cargandoDietas = false;
        this.cdr.detectChanges();
      },
    });
  }

  reintentarRecetas(): void {
    this.errorRecetas    = false;
    this.cargandoRecetas = true;
    this.recetaService.obtenerPublicas().subscribe({
      next: (data) => {
        this.recetas         = data.slice(0, 3);
        this.cargandoRecetas = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorRecetas    = true;
        this.cargandoRecetas = false;
        this.cdr.detectChanges();
      },
    });
  }

  reintentarDietas(): void {
    this.errorDietas    = false;
    this.cargandoDietas = true;
    this.dietaService.obtenerPublicas().subscribe({
      next: (data) => {
        this.dietas         = data.slice(0, 3);
        this.cargandoDietas = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorDietas    = true;
        this.cargandoDietas = false;
        this.cdr.detectChanges();
      },
    });
  }

  getImagenReceta(receta: RecetaResponse): string {
    if (receta.imagen?.length) return `${AppConstants.API_URL}/documentos/${receta.imagen[0]}/archivo`;
    return '/assets/img/comidas/bowlRecetas.png';
  }

  getPortadaDieta(dieta: DietaResponse): string {
    if (dieta.portada) return `${AppConstants.API_URL}/documentos/${dieta.portada}/archivo`;
    return '/assets/img/comidas/platoComida.jpeg';
  }

  verReceta(id: string): void { this.router.navigate(['/viewrecipe', id]); }
  verDieta(id: string):  void { this.router.navigate(['/viewdiet',   id]); }
}
