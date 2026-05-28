import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Navbar } from '../../layout/navbar/navbar';
import { Footer } from '../../layout/footer/footer';
import { CommonModule, NgClass } from '@angular/common';
import { Subscription } from 'rxjs';

import { RecetaResponse } from '../../models/receta';
import { RecetaService } from '../../services/receta.service';
import { GuardadosService } from '../../services/guardados.service';
import { AuthService } from '../../services/auth';
import { AppConstants } from '../../app.constantes';

@Component({
  selector: 'app-view-recipe',
  imports: [RouterLink, Navbar, Footer, CommonModule, NgClass],
  templateUrl: './view-recipe.html',
  styleUrl: './view-recipe.scss',
})
export class ViewRecipe implements OnInit, OnDestroy {
  receta: RecetaResponse | null = null;
  recetasRelacionadas: RecetaResponse[] = [];
  cargando = true;
  error = '';
  guardada = false;
  guardandoEstado = false;

  private routeSub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private recetaService: RecetaService,
    private guardadosService: GuardadosService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.routeSub = this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (!id) { this.router.navigate(['/recipes']); return; }
      this.receta   = null;
      this.guardada = false;
      this.cargando = true;
      this.error    = '';
      this.cargarReceta(id);
      this.cargarRelacionadas();
    });
  }

  ngOnDestroy(): void { this.routeSub?.unsubscribe(); }

  private cargarReceta(id: string): void {
    this.recetaService.obtenerPorId(id).subscribe({
      next: (receta) => {
        this.receta   = receta;
        this.cargando = false;
        this.verificarGuardada(id);
        this.cdr.detectChanges();
      },
      error: () => {
        this.error    = 'No se pudo cargar la receta.';
        this.cargando = false;
        this.cdr.detectChanges();
      },
    });
  }

  private cargarRelacionadas(): void {
    this.recetaService.obtenerPublicas().subscribe({
      next: (recetas) => {
        const actual = this.route.snapshot.paramMap.get('id');
        this.recetasRelacionadas = recetas.filter(r => r.id !== actual).slice(0, 3);
        this.cdr.detectChanges();
      },
      error: () => {},
    });
  }

  private verificarGuardada(recetaId: string): void {
    const personaId = this.authService.getPersonaId();
    if (!personaId) return;
    this.guardadosService.isRecetaGuardada(personaId, recetaId).subscribe({
      next: (res) => { this.guardada = res.guardada; this.cdr.detectChanges(); },
      error: () => {},
    });
  }

  toggleGuardar(): void {
    const personaId = this.authService.getPersonaId();
    const recetaId  = this.receta?.id;
    if (!personaId || !recetaId || this.guardandoEstado) return;

    this.guardandoEstado = true;
    const accion$ = this.guardada
      ? this.guardadosService.desguardarReceta(personaId, recetaId)
      : this.guardadosService.guardarReceta(personaId, recetaId);

    accion$.subscribe({
      next: () => {
        this.guardada        = !this.guardada;
        this.guardandoEstado = false;
        this.cdr.detectChanges();
      },
      error: () => { this.guardandoEstado = false; },
    });
  }

  getImagenReceta(receta: RecetaResponse): string {
    if (receta.imagen?.length) return `${AppConstants.API_URL}/documentos/${receta.imagen[0]}/archivo`;
    return '/assets/img/comidas/bowlRecetas.png';
  }

  verReceta(id: string): void { this.router.navigate(['/viewrecipe', id]); }
}
