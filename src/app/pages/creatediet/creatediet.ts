import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Navbar } from '../../layout/navbar/navbar';
import { Footer } from '../../layout/footer/footer';

import { Tag } from '../../models/secundary/tag';
import { RecetaResponse } from '../../models/receta';
import { DietaRequest, PlanSemanalItem } from '../../models/dieta';
import { RecetaService } from '../../services/receta.service';
import { DietaService } from '../../services/dieta.service';
import { AuthService } from '../../services/auth';
import { AppConstants } from '../../app.constantes';

interface Dia {
  key: string;
  label: string;
  short: string;
  activo: boolean;
}

interface Categoria {
  key: string;
  label: string;
  emoji: string;
}

@Component({
  selector: 'app-creatediet',
  imports: [RouterLink, Navbar, Footer, FormsModule, CommonModule],
  templateUrl: './creatediet.html',
  styleUrl: './creatediet.scss',
})
export class Creatediet implements OnInit {

  truncar(valor: string, max: number): string {
    return valor.length > max ? valor.substring(0, max) : valor;
  }

  // ── Modo edición ──
  dietaId: string | null = null;
  modoEdicion = false;

  // ── Portada ──
  portadaFile: File | null = null;
  portadaPreview: string | null = null;

  onPortadaSeleccionada(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.portadaFile = file;
    const reader = new FileReader();
    reader.onload = () => { this.portadaPreview = reader.result as string; this.cdr.detectChanges(); };
    reader.readAsDataURL(file);
  }

  // ── Modal de confirmación ──
  modalConfirmVisible = false;

  abrirModalConfirmar(): void { this.modalConfirmVisible = true; }
  cerrarModalConfirmar(): void { this.modalConfirmVisible = false; }

  confirmarCreacion(): void {
    this.modalConfirmVisible = false;
    this.guardarDieta();
  }

  // ── Stepper ──
  pasoActual = 1;
  cargando = false;
  errorMensaje = '';
  errorPaso = '';

  pasoSiguiente(): void {
    this.errorPaso = '';
    if (this.pasoActual === 1) {
      if (!this.nombreDieta.trim()) {
        this.errorPaso = 'El nombre de la dieta es obligatorio.';
        return;
      }
      if (this.nombreDieta.trim().length < 3) {
        this.errorPaso = 'El nombre debe tener al menos 3 caracteres.';
        return;
      }
    }
    if (this.pasoActual < 3) this.pasoActual++;
  }

  pasoAnterior(): void {
    this.errorPaso = '';
    if (this.pasoActual > 1) this.pasoActual--;
  }

  irAPaso(p: number): void {
    if (p < this.pasoActual) {
      this.errorPaso = '';
      this.pasoActual = p;
    } else if (p > this.pasoActual) {
      this.pasoSiguiente();
    }
  }

  // ── Paso 1: Info básica ──
  nombreDieta = '';
  descripcion = '';
  visibilidad = 'publica';

  // ── Paso 2: Tags/Metas ──
  tags: Tag[] = [];

  get tagsSeleccionados(): Tag[] { return this.tags.filter(t => t.selected); }

  initializeTags(): void {
    this.tags = [
      { id: '1', label: 'Bajar de peso',     selected: false },
      { id: '2', label: 'Subir de peso',     selected: false },
      { id: '3', label: 'Peso saludable',    selected: false },
      { id: '4', label: 'Bajar calorías',    selected: false },
      { id: '5', label: 'Ganar músculo',     selected: false },
      { id: '6', label: 'Definir mi cuerpo', selected: false },
      { id: '7', label: 'Más energía',       selected: false },
      { id: '8', label: 'Mejorar digestión', selected: false },
    ];
  }

  toggleTag(tag: Tag): void { tag.selected = !tag.selected; }

  // ── Paso 3: Días ──
  dias: Dia[] = [
    { key: 'lunes',     label: 'Lunes',     short: 'Lun', activo: false },
    { key: 'martes',    label: 'Martes',    short: 'Mar', activo: false },
    { key: 'miercoles', label: 'Miércoles', short: 'Mié', activo: false },
    { key: 'jueves',    label: 'Jueves',    short: 'Jue', activo: false },
    { key: 'viernes',   label: 'Viernes',   short: 'Vie', activo: false },
    { key: 'sabado',    label: 'Sábado',    short: 'Sáb', activo: false },
    { key: 'domingo',   label: 'Domingo',   short: 'Dom', activo: false },
  ];

  diaSeleccionado: string = '';

  get diasActivos(): Dia[] { return this.dias.filter(d => d.activo); }

  toggleDia(dia: Dia): void {
    if (!dia.activo) {
      dia.activo = true;
    }
    this.diaSeleccionado = dia.key;
    this.carruselOffset = 0;
  }

  selectDia(key: string): void {
    this.diaSeleccionado = key;
    this.carruselOffset = 0;
  }

  isDiaActivo(key: string): boolean { return this.dias.find(d => d.key === key)?.activo ?? false; }
  getDiaLabel(key: string): string { return this.dias.find(d => d.key === key)?.label ?? ''; }

  // ── Plan semanal: { diaKey: RecetaResponse[] } ──
  planSemanal: Record<string, RecetaResponse[]> = {};

  getRecetasDia(dia: string): RecetaResponse[] { return this.planSemanal[dia] ?? []; }

  isRecetaEnDia(dia: string, recetaId: string): boolean {
    return this.getRecetasDia(dia).some(r => r.id === recetaId);
  }

  toggleRecetaEnDia(dia: string, receta: RecetaResponse): void {
    if (!this.planSemanal[dia]) this.planSemanal[dia] = [];
    const idx = this.planSemanal[dia].findIndex(r => r.id === receta.id);
    if (idx === -1) {
      this.planSemanal[dia] = [...this.planSemanal[dia], receta];
    } else {
      this.planSemanal[dia] = this.planSemanal[dia].filter(r => r.id !== receta.id);
    }
  }

  getTotalKcalDia(dia: string): number {
    return this.getRecetasDia(dia).reduce((sum, r) => sum + (r.nutricion?.kcal ?? 0), 0);
  }

  getMacrosDia(dia: string) {
    return this.getRecetasDia(dia).reduce(
      (acc, r) => ({
        proteinas: acc.proteinas + (r.nutricion?.proteinas ?? 0),
        carbohidratos: acc.carbohidratos + (r.nutricion?.carbohidratos ?? 0),
        grasas: acc.grasas + ((r.nutricion as any)?.grasas ?? 0),
      }),
      { proteinas: 0, carbohidratos: 0, grasas: 0 }
    );
  }

  carruselOffset = 0;
  carruselCardWidth = 220;

  prevSlide(): void { if (this.carruselOffset > 0) this.carruselOffset--; }

  nextSlide(): void {
    const visibles = Math.floor(860 / this.carruselCardWidth);
    if (this.carruselOffset < this.recetasFiltradas.length - visibles) {
      this.carruselOffset++;
    }
  }

  puedeAvanzar(): boolean {
    const visibles = Math.floor(860 / this.carruselCardWidth);
    return this.carruselOffset < this.recetasFiltradas.length - visibles;
  }

  // ── Buscador y filtro ──
  busquedaReceta = '';
  filtroCategoria = 'todas';
  cargandoRecetas = false;

  categorias: Categoria[] = [
    { key: 'todas',        label: 'Todas',    emoji: '🍽️' },
    { key: 'proteina',     label: 'Proteína', emoji: '🍗' },
    { key: 'vegetal',      label: 'Vegetal',  emoji: '🥗' },
    { key: 'carbohidrato', label: 'Carbs',    emoji: '🍝' },
    { key: 'desayuno',     label: 'Desayuno', emoji: '🌅' },
    { key: 'snack',        label: 'Snack',    emoji: '🍎' },
  ];

  onBuscar(): void { this.carruselOffset = 0; }

  todasLasRecetas: RecetaResponse[] = [];

  get recetasFiltradas(): RecetaResponse[] {
    return this.todasLasRecetas.filter(r => {
      const matchBusqueda = r.nombre_receta.toLowerCase().includes(this.busquedaReceta.toLowerCase());
      const matchCat = this.filtroCategoria === 'todas'
        || r.tags.some(t => t.toLowerCase().includes(this.filtroCategoria));
      return matchBusqueda && matchCat;
    });
  }

  getImagenReceta(receta: RecetaResponse): string {
    if (receta.imagen?.length) {
      return `${AppConstants.API_URL}/documentos/${receta.imagen[0]}/archivo`;
    }
    return '/assets/img/dietas/placeholder.jpg';
  }

  getCategoriaEmoji(receta: RecetaResponse): string {
    const tag = receta.tags?.[0]?.toLowerCase() ?? '';
    if (tag.includes('proteína') || tag.includes('protein')) return '🍗';
    if (tag.includes('vegano') || tag.includes('vegetal') || tag.includes('vegetar')) return '🥗';
    if (tag.includes('carb') || tag.includes('pasta')) return '🍝';
    if (tag.includes('desayuno')) return '🌅';
    if (tag.includes('snack') || tag.includes('merienda')) return '🍎';
    return '🍽️';
  }

  getCategoriaLabel(receta: RecetaResponse): string {
    return receta.tags?.[0] ?? 'Receta';
  }

  // ── Guardar (crear o editar) ──
  guardarDieta(): void {
    const personaId = this.authService.getPersonaId();
    if (!personaId) {
      alert('Debes iniciar sesión para guardar una dieta.');
      return;
    }

    const tiposComida = ['desayuno', 'almuerzo', 'cena', 'merienda'];
    const planArray: PlanSemanalItem[] = [];

    for (const dia of Object.keys(this.planSemanal)) {
      this.planSemanal[dia].forEach((receta, idx) => {
        planArray.push({
          receta_id: receta.id,
          tipo_comida: tiposComida[idx % tiposComida.length],
          dia,
        });
      });
    }

    const payload: DietaRequest = {
      nombre_dieta: this.nombreDieta,
      descripcion: this.descripcion,
      metas: this.tagsSeleccionados.map(t => t.label),
      plan_semanal: planArray,
      es_personalizada: true,
      visibilidad: this.visibilidad as 'publica' | 'privada',
      creada_por: personaId,
    };

    this.cargando = true;
    this.errorMensaje = '';

    if (this.modoEdicion && this.dietaId) {
      this.dietaService.actualizar(this.dietaId, payload).subscribe({
        next: () => { this.subirPortadaYNavegar(this.dietaId!); },
        error: () => {
          this.cargando = false;
          this.errorMensaje = 'Error al guardar la dieta. Intenta de nuevo.';
        },
      });
    } else {
      this.dietaService.crear(payload).subscribe({
        next: (res) => { this.subirPortadaYNavegar(res.id); },
        error: () => {
          this.cargando = false;
          this.errorMensaje = 'Error al crear la dieta. Intenta de nuevo.';
        },
      });
    }
  }

  private subirPortadaYNavegar(id: string): void {
    if (this.portadaFile) {
      this.dietaService.subirPortada(id, this.portadaFile, this.portadaFile.name).subscribe({
        next:  () => { this.cargando = false; this.router.navigate(['/viewdiet', id]); },
        error: () => { this.cargando = false; this.router.navigate(['/viewdiet', id]); },
      });
    } else {
      this.cargando = false;
      this.router.navigate(['/viewdiet', id]);
    }
  }

  onReturn(): void { this.router.navigate(['/diet']); }

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private recetaService: RecetaService,
    private dietaService: DietaService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.initializeTags();
    this.cargarRecetas();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.dietaId = id;
      this.modoEdicion = true;
      this.cargarDieta(id);
    }
  }

  private cargarRecetas(): void {
    this.cargandoRecetas = true;
    this.recetaService.obtenerPublicas().subscribe({
      next: (recetas) => {
        this.todasLasRecetas = recetas;
        this.cargandoRecetas = false;
        if (this.modoEdicion && this._planPendiente.length > 0) {
          this.poblarPlan(this._planPendiente);
          this._planPendiente = [];
        }
        this.cdr.detectChanges();
      },
      error: () => { this.cargandoRecetas = false; this.cdr.detectChanges(); },
    });
  }

  // Guardamos el plan mientras las recetas cargan en paralelo
  private _planPendiente: { receta_id: string; dia: string }[] = [];

  private cargarDieta(id: string): void {
    this.dietaService.obtenerPorId(id).subscribe({
      next: (dieta) => {
        this.nombreDieta = dieta.nombre_dieta;
        this.descripcion = dieta.descripcion ?? '';
        this.visibilidad = dieta.visibilidad;

        if (dieta.metas) {
          this.tags.forEach(t => {
            t.selected = dieta.metas.includes(t.label);
          });
        }

        if (dieta.plan_semanal?.length) {
          if (this.todasLasRecetas.length > 0) {
            this.poblarPlan(dieta.plan_semanal);
          } else {
            this._planPendiente = dieta.plan_semanal;
          }
        }
        this.cdr.detectChanges();
      },
    });
  }

  private poblarPlan(plan: any[]): void {
    for (const item of plan) {
      // Priorizamos el objeto 'receta' que el backend ahora envía gracias al cambio en DietaDTO
      const receta = item.receta || this.todasLasRecetas.find(r => r.id === (item.receta_id || item.recetaId));
      
      if (!receta) continue;
      if (!this.planSemanal[item.dia]) this.planSemanal[item.dia] = [];
      if (!this.planSemanal[item.dia].some(r => r.id === receta.id)) {
        this.planSemanal[item.dia].push(receta);
      }
      const dia = this.dias.find(d => d.key === item.dia);
      if (dia) dia.activo = true;
    }
    // Seleccionar el primer día activo
    const primerDia = this.dias.find(d => d.activo);
    if (primerDia) this.diaSeleccionado = primerDia.key;
  }
}
