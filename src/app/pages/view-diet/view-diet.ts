import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Navbar } from '../../layout/navbar/navbar';
import { Footer } from '../../layout/footer/footer';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

import { DietaResponse, PlanSemanalItem } from '../../models/dieta';
import { DietaService } from '../../services/dieta.service';
import { GuardadosService } from '../../services/guardados.service';
import { AuthService } from '../../services/auth';
import { AppConstants } from '../../app.constantes';

interface DiaConComidas {
  dia: string;
  label: string;
  comidas: PlanSemanalItem[];
}

const DIA_LABELS: Record<string, string> = {
  lunes:     'Lunes',
  martes:    'Martes',
  miercoles: 'Miércoles',
  jueves:    'Jueves',
  viernes:   'Viernes',
  sabado:    'Sábado',
  domingo:   'Domingo',
};

const ORDEN_DIAS = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];

@Component({
  selector: 'app-view-diet',
  imports: [RouterLink, Navbar, Footer, CommonModule],
  templateUrl: './view-diet.html',
  styleUrl: './view-diet.scss',
})
export class ViewDiet implements OnInit, OnDestroy {
  dieta: DietaResponse | null = null;
  dietasRelacionadas: DietaResponse[] = [];
  planPorDia: DiaConComidas[] = [];
  cargando = true;
  error = '';
  guardada = false;
  guardandoEstado = false;

  private routeSub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dietaService: DietaService,
    private guardadosService: GuardadosService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.routeSub = this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (!id) { this.router.navigate(['/diet']); return; }
      this.dieta    = null;
      this.guardada = false;
      this.cargando = true;
      this.error    = '';
      this.cargarDieta(id);
      this.cargarRelacionadas();
    });
  }

  ngOnDestroy(): void { this.routeSub?.unsubscribe(); }

  private cargarDieta(id: string): void {
    this.dietaService.obtenerPorId(id).subscribe({
      next: (dieta) => {
        this.dieta      = dieta;
        this.planPorDia = this.agruparPlanPorDia(dieta.plan_semanal);
        this.cargando   = false;
        this.verificarGuardada(id);
        this.cdr.detectChanges();
      },
      error: () => {
        this.error    = 'No se pudo cargar la dieta.';
        this.cargando = false;
        this.cdr.detectChanges();
      },
    });
  }

  private cargarRelacionadas(): void {
    this.dietaService.obtenerPublicas().subscribe({
      next: (dietas) => {
        const actual = this.route.snapshot.paramMap.get('id');
        this.dietasRelacionadas = dietas.filter(d => d.id !== actual).slice(0, 3);
        this.cdr.detectChanges();
      },
      error: () => {},
    });
  }

  private verificarGuardada(dietaId: string): void {
    const personaId = this.authService.getPersonaId();
    if (!personaId) return;
    this.guardadosService.isDietaGuardada(personaId, dietaId).subscribe({
      next: (res) => { this.guardada = res.guardada; this.cdr.detectChanges(); },
      error: () => {},
    });
  }

  toggleGuardar(): void {
    const personaId = this.authService.getPersonaId();
    const dietaId   = this.dieta?.id;
    if (!personaId || !dietaId || this.guardandoEstado) return;

    this.guardandoEstado = true;
    const accion$ = this.guardada
      ? this.guardadosService.desguardarDieta(personaId, dietaId)
      : this.guardadosService.guardarDieta(personaId, dietaId);

    accion$.subscribe({
      next: () => {
        this.guardada        = !this.guardada;
        this.guardandoEstado = false;
        this.cdr.detectChanges();
      },
      error: () => { this.guardandoEstado = false; },
    });
  }

  private agruparPlanPorDia(plan: PlanSemanalItem[]): DiaConComidas[] {
    const mapa: Record<string, PlanSemanalItem[]> = {};
    for (const item of plan) {
      const dia = item.dia ?? 'sin_dia';
      if (!mapa[dia]) mapa[dia] = [];
      mapa[dia].push(item);
    }
    return ORDEN_DIAS
      .filter(d => mapa[d]?.length)
      .map(d => ({ dia: d, label: DIA_LABELS[d] ?? d, comidas: mapa[d] }));
  }

  getPortadaDieta(dieta: DietaResponse): string {
    if (dieta.portada) return `${AppConstants.API_URL}/documentos/${dieta.portada}/archivo`;
    return '/assets/img/comidas/plato-proteina.png';
  }

  verDieta(id: string): void { this.router.navigate(['/viewdiet', id]); }

  descargarPDF(): void { window.print(); }
}
