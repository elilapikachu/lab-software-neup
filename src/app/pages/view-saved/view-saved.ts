import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Navbar } from '../../layout/navbar/navbar';
import { Footer } from '../../layout/footer/footer';
import { RecetaResponse } from '../../models/receta';
import { DietaResponse } from '../../models/dieta';
import { RecetaService } from '../../services/receta.service';
import { DietaService } from '../../services/dieta.service';
import { GuardadosService } from '../../services/guardados.service';
import { AuthService } from '../../services/auth';
import { AppConstants } from '../../app.constantes';

@Component({
  selector: 'app-view-saved',
  imports: [RouterLink, Navbar, Footer, CommonModule],
  templateUrl: './view-saved.html',
  styleUrl: './view-saved.scss',
})
export class ViewSaved implements OnInit {

  activeTab: 'recetas' | 'dietas' = 'recetas';
  filterRecetas: 'todos' | 'personalizadas' = 'todos';
  filterDietas:  'todos' | 'personalizadas' = 'todos';

  misRecetas: RecetaResponse[] = [];
  misDietas:  DietaResponse[]  = [];

  cargandoRecetas = false;
  cargandoDietas  = false;

  personaId: string | null = null;

  modal = {
    visible: false,
    titulo: '',
    mensaje: '',
    icono: '',
    accion: (() => {}) as () => void,
  };

  constructor(
    private router: Router,
    private recetaService: RecetaService,
    private dietaService:  DietaService,
    private guardadosService: GuardadosService,
    private authService:   AuthService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.personaId = this.authService.getPersonaId();
    this.cargarRecetas();
    this.cargarDietas();
  }

  private cargarRecetas(): void {
    if (!this.personaId) return;

    this.cargandoRecetas = true;
    forkJoin({
      creadas: this.recetaService.obtenerPorPersona(this.personaId),
      guardadas: this.guardadosService.getRecetasGuardadas(this.personaId),
    }).subscribe({
      next: ({ creadas, guardadas }) => {
        const idsCreadas = new Set(creadas.map(r => r.id));
        const soloGuardadas = guardadas.filter(r => !idsCreadas.has(r.id));
        this.misRecetas = [...creadas, ...soloGuardadas];
        this.cargandoRecetas = false;
        this.cdr.detectChanges();
      },
      error: () => { this.cargandoRecetas = false; this.cdr.detectChanges(); },
    });
  }

  private cargarDietas(): void {
    if (!this.personaId) return;

    this.cargandoDietas = true;
    forkJoin({
      creadas: this.dietaService.obtenerPorPersona(this.personaId),
      guardadas: this.guardadosService.getDietasGuardadas(this.personaId),
    }).subscribe({
      next: ({ creadas, guardadas }) => {
        const idsCreadas = new Set(creadas.map(d => d.id));
        const soloGuardadas = guardadas.filter(d => !idsCreadas.has(d.id));
        this.misDietas = [...creadas, ...soloGuardadas];
        this.cargandoDietas = false;
        this.cdr.detectChanges();
      },
      error: () => { this.cargandoDietas = false; this.cdr.detectChanges(); },
    });
  }

  // ── Filtros ──
  cambiarTab(tab: 'recetas' | 'dietas'): void { this.activeTab = tab; }
  cambiarFilterRecetas(f: 'todos' | 'personalizadas'): void { this.filterRecetas = f; }
  cambiarFilterDietas(f:  'todos' | 'personalizadas'): void { this.filterDietas  = f; }

  esCreadaPorMi(receta: RecetaResponse): boolean {
    return receta.creada_por === this.personaId;
  }

  esDietaCreadaPorMi(dieta: DietaResponse): boolean {
    return dieta.creada_por === this.personaId;
  }

  get recetasMostradas(): RecetaResponse[] {
    if (this.filterRecetas === 'personalizadas') return this.misRecetas.filter(r => this.esCreadaPorMi(r));
    return this.misRecetas;
  }

  get dietasMostradas(): DietaResponse[] {
    if (this.filterDietas === 'personalizadas') return this.misDietas.filter(d => this.esDietaCreadaPorMi(d));
    return this.misDietas;
  }

  // ── Imágenes ──
  getImagenReceta(receta: RecetaResponse): string {
    if (receta.imagen?.length) return `${AppConstants.API_URL}/documentos/${receta.imagen[0]}/archivo`;
    return '/assets/img/comidas/bowlRecetas.png';
  }

  getPortadaDieta(dieta: DietaResponse): string {
    if (dieta.portada) return `${AppConstants.API_URL}/documentos/${dieta.portada}/archivo`;
    return '/assets/img/comidas/plato-proteina.png';
  }

  // ── Navegación ──
  verReceta(id: string):    void { this.router.navigate(['/viewrecipe', id]); }
  verDieta(id: string):     void { this.router.navigate(['/viewdiet',   id]); }
  editarReceta(id: string): void { this.router.navigate(['/editrecipe', id]); }
  editarDieta(id: string):  void { this.router.navigate(['/editdiet',   id]); }
  crearReceta(): void { this.router.navigate(['/createrecipe']); }
  crearDieta():  void { this.router.navigate(['/creatediet']);   }
  irAExplorar(): void { this.router.navigate(['/recipes']); }

  // ── Modal de confirmación ──
  private abrirModal(titulo: string, mensaje: string, icono: string, accion: () => void): void {
    this.modal = { visible: true, titulo, mensaje, icono, accion };
    this.cdr.detectChanges();
  }

  confirmarModal(): void {
    this.modal.accion();
    this.modal.visible = false;
    this.cdr.detectChanges();
  }

  cancelarModal(): void {
    this.modal.visible = false;
    this.cdr.detectChanges();
  }

  // ── Eliminar (solo para contenido propio) ──
  eliminarReceta(receta: RecetaResponse): void {
    this.abrirModal(
      'Eliminar receta',
      `¿Estás seguro de que quieres eliminar la receta "${receta.nombre_receta}"? Esta acción no se puede deshacer.`,
      '🗑️',
      () => {
        this.recetaService.eliminar(receta.id).subscribe({
          next:  () => { this.misRecetas = this.misRecetas.filter(r => r.id !== receta.id); this.cdr.detectChanges(); },
          error: () => { alert('No se pudo eliminar la receta. Intenta de nuevo.'); },
        });
      }
    );
  }

  eliminarDieta(dieta: DietaResponse): void {
    this.abrirModal(
      'Eliminar dieta',
      `¿Estás seguro de que quieres eliminar la dieta "${dieta.nombre_dieta}"? Esta acción no se puede deshacer.`,
      '🗑️',
      () => {
        this.dietaService.eliminar(dieta.id).subscribe({
          next:  () => { this.misDietas = this.misDietas.filter(d => d.id !== dieta.id); this.cdr.detectChanges(); },
          error: () => { alert('No se pudo eliminar la dieta. Intenta de nuevo.'); },
        });
      }
    );
  }

  // ── Desguardar (solo para contenido guardado de otros) ──
  desguardarReceta(receta: RecetaResponse): void {
    if (!this.personaId) return;
    this.abrirModal(
      'Quitar receta guardada',
      `¿Quieres quitar la receta "${receta.nombre_receta}" de tus guardados?`,
      '❤',
      () => {
        this.guardadosService.desguardarReceta(this.personaId!, receta.id).subscribe({
          next:  () => { this.misRecetas = this.misRecetas.filter(r => r.id !== receta.id); this.cdr.detectChanges(); },
          error: () => { alert('No se pudo quitar la receta guardada.'); },
        });
      }
    );
  }

  desguardarDieta(dieta: DietaResponse): void {
    if (!this.personaId) return;
    this.abrirModal(
      'Quitar dieta guardada',
      `¿Quieres quitar la dieta "${dieta.nombre_dieta}" de tus guardados?`,
      '❤',
      () => {
        this.guardadosService.desguardarDieta(this.personaId!, dieta.id).subscribe({
          next:  () => { this.misDietas = this.misDietas.filter(d => d.id !== dieta.id); this.cdr.detectChanges(); },
          error: () => { alert('No se pudo quitar la dieta guardada.'); },
        });
      }
    );
  }
}
