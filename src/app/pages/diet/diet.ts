import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Navbar } from '../../layout/navbar/navbar';
import { Footer } from '../../layout/footer/footer';
import { AuthService } from '../../services/auth';
import { AlertService } from '../../services/alert';
import { DietaService } from '../../services/dieta.service';
import { DietaResponse } from '../../models/dieta';
import { AppConstants } from '../../app.constantes';

@Component({
  selector: 'app-diet',
  imports: [RouterLink, Navbar, Footer, CommonModule, FormsModule],
  templateUrl: './diet.html',
  styleUrl: './diet.scss',
})
export class Diet implements OnInit {

  dietas: DietaResponse[] = [];
  cargando = false;
  error = '';
  searchTerm = '';
  paginaActual = 1;
  readonly itemsPorPagina = 6;

  recomendadas: DietaResponse[] = [];
  cargandoRecomendadas = false;
  tienePreferencias = true;

  private alerts = inject(AlertService);

  constructor(
    private router: Router,
    private auth: AuthService,
    private dietaService: DietaService,
    private cdr: ChangeDetectorRef,
  ) {}

  get estaAutenticado(): boolean { return this.auth.estaAutenticado(); }

  ngOnInit(): void {
    this.cargando = true;
    this.dietaService.obtenerPublicas().subscribe({
      next:  (data) => { this.dietas = data; this.cargando = false; this.cdr.detectChanges(); },
      error: ()     => { this.error = 'No se pudieron cargar las dietas.'; this.cargando = false; this.cdr.detectChanges(); },
    });
    if (this.estaAutenticado) this.cargarRecomendadas();
  }

  cargarRecomendadas(): void {
    const personaId = this.auth.getPersonaId();
    if (!personaId) return;
    this.cargandoRecomendadas = true;
    this.dietaService.obtenerRecomendadas(personaId).subscribe({
      next: (res) => {
        this.tienePreferencias    = res.tiene_preferencias;
        this.recomendadas         = res.dietas ?? [];
        this.cargandoRecomendadas = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargandoRecomendadas = false;
        this.cdr.detectChanges();
      },
    });
  }

  get dietasFiltradas(): DietaResponse[] {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) return this.dietas;
    return this.dietas.filter(d =>
      d.nombre_dieta?.toLowerCase().includes(term) ||
      d.descripcion?.toLowerCase().includes(term) ||
      d.metas?.some(m => m.toLowerCase().includes(term))
    );
  }

  get totalPaginas(): number {
    return Math.max(1, Math.ceil(this.dietasFiltradas.length / this.itemsPorPagina));
  }

  get dietasPaginadas(): DietaResponse[] {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    return this.dietasFiltradas.slice(inicio, inicio + this.itemsPorPagina);
  }

  get paginas(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  onBuscar(): void {
    this.paginaActual = 1;
  }

  limpiarBusqueda(): void {
    this.searchTerm = '';
    this.paginaActual = 1;
  }

  cambiarPagina(p: number): void {
    if (p < 1 || p > this.totalPaginas) return;
    this.paginaActual = p;
    const el = document.getElementById('dietas-publicas');
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  getPortadaDieta(dieta: DietaResponse): string {
    if (dieta.portada) return `${AppConstants.API_URL}/documentos/${dieta.portada}/archivo`;
    return '/assets/img/comidas/plato-proteina.png';
  }

  verDieta(id: string): void { this.router.navigate(['/viewdiet', id]); }

  onValidarAutenticado(): void {
    if (this.auth.estaAutenticado()) {
      this.router.navigate(['/creatediet']);
    } else {
      this.alerts.danger('¡No has iniciado sesión para crear una dieta!', { autoDismiss: 3000 });
    }
  }
}
