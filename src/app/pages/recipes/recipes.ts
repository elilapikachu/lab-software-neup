import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Navbar } from '../../layout/navbar/navbar';
import { Footer } from '../../layout/footer/footer';
import { RecetaResponse } from '../../models/receta';
import { RecetaService } from '../../services/receta.service';
import { AuthService } from '../../services/auth';
import { AppConstants } from '../../app.constantes';

type FiltroMeal = 'Todos' | 'Desayuno' | 'Almuerzo' | 'Cena';

@Component({
  selector: 'app-recipes',
  imports: [RouterLink, Navbar, Footer, CommonModule, FormsModule],
  templateUrl: './recipes.html',
  styleUrl: './recipes.scss',
})
export class Recipes implements OnInit {

  cargando = false;
  error = '';
  recetas: RecetaResponse[] = [];
  searchTerm = '';
  filtroMeal: FiltroMeal = 'Todos';
  paginaActual = 1;
  readonly itemsPorPagina = 6;

  recomendadas: RecetaResponse[] = [];
  cargandoRecomendadas = false;
  tienePreferencias = true;

  readonly filtros: FiltroMeal[] = ['Todos', 'Desayuno', 'Almuerzo', 'Cena'];

  constructor(
    private recetaService: RecetaService,
    private auth: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  get estaAutenticado(): boolean { return this.auth.estaAutenticado(); }

  ngOnInit(): void {
    this.cargarRecetas();
    if (this.estaAutenticado) this.cargarRecomendadas();
  }

  cargarRecomendadas(): void {
    const personaId = this.auth.getPersonaId();
    if (!personaId) return;
    this.cargandoRecomendadas = true;
    this.recetaService.obtenerRecomendadas(personaId).subscribe({
      next: (res) => {
        this.tienePreferencias = res.tiene_preferencias;
        this.recomendadas      = res.recetas ?? [];
        this.cargandoRecomendadas = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargandoRecomendadas = false;
        this.cdr.detectChanges();
      },
    });
  }

  cargarRecetas(): void {
    this.cargando = true;
    this.error = '';
    this.recetaService.obtenerPublicas().subscribe({
      next: (recetas) => {
        this.recetas  = recetas;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error    = 'No se pudieron cargar las recetas. Intenta de nuevo.';
        this.cargando = false;
        this.cdr.detectChanges();
      },
    });
  }

  get recetasFiltradas(): RecetaResponse[] {
    let resultado = this.recetas;

    if (this.filtroMeal !== 'Todos') {
      resultado = resultado.filter(r => r.tags?.includes(this.filtroMeal));
    }

    const term = this.searchTerm.toLowerCase().trim();
    if (term) {
      resultado = resultado.filter(r =>
        r.nombre_receta?.toLowerCase().includes(term) ||
        r.tags?.some(t => t.toLowerCase().includes(term)) ||
        r.ingredientes?.some(i => i.nombre_ingrediente?.toLowerCase().includes(term))
      );
    }

    return resultado;
  }

  get totalPaginas(): number {
    return Math.max(1, Math.ceil(this.recetasFiltradas.length / this.itemsPorPagina));
  }

  get recetasPaginadas(): RecetaResponse[] {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    return this.recetasFiltradas.slice(inicio, inicio + this.itemsPorPagina);
  }

  get paginas(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  setFiltro(f: FiltroMeal): void {
    this.filtroMeal  = f;
    this.paginaActual = 1;
  }

  onBuscar(): void {
    this.paginaActual = 1;
  }

  limpiarBusqueda(): void {
    this.searchTerm  = '';
    this.paginaActual = 1;
  }

  cambiarPagina(p: number): void {
    if (p < 1 || p > this.totalPaginas) return;
    this.paginaActual = p;
    const el = document.getElementById('recetas-seccion');
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  imagenPrincipal(receta: RecetaResponse): string {
    if (receta.imagen?.length) return `${AppConstants.API_URL}/documentos/${receta.imagen[0]}/archivo`;
    return '/assets/img/comidas/bowlRecetas.png';
  }

  resumenNutricion(receta: RecetaResponse): string {
    const n = receta.nutricion;
    if (!n) return '';
    return `${n.kcal} kcal · ${n.proteinas}g prot · ${n.carbohidratos}g carbs`;
  }

  verReceta(id: string): void { this.router.navigate(['/viewrecipe', id]); }

  iconoFiltro(f: FiltroMeal): string {
    const map: Record<FiltroMeal, string> = {
      Todos: '🍽️', Desayuno: '🌅', Almuerzo: '☀️', Cena: '🌙',
    };
    return map[f];
  }
}
