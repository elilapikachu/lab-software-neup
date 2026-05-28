import { ChangeDetectorRef, Component, OnInit, HostListener } from '@angular/core';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule, DecimalPipe } from '@angular/common';
import { NgClass } from '@angular/common';
import { Navbar } from '../../layout/navbar/navbar';
import { Footer } from '../../layout/footer/footer';

import { RecetaRequest } from '../../models/receta';
import { RecetaService } from '../../services/receta.service';
import { AuthService } from '../../services/auth';
import { IngredienteService } from '../../services/ingrediente.service';
import { IngredienteResponse } from '../../models/ingrediente';

interface IngredienteForm {
  ingrediente_id: string;
  nombre_ingrediente: string;
  cantidad: number | null;
  tipo_ingrediente: string;
  tipo_cantidad: string;
}

interface Nutricion {
  kcal: number;
  proteinas: number;
  carbohidratos: number;
  fibra: number;
  vitaminas: string[];
  minerales: string[];
}

interface RecetaForm {
  nombre_receta: string;
  ingredientes: IngredienteForm[];
  nutricion: Nutricion;
  tags: string[];
  tiempo_preparacion: number | string;
  visibilidad: 'publica' | 'privada';
}

interface TagOpcion {
  id: string;
  label: string;
  emoji: string;
  selected: boolean;
}

@Component({
  selector: 'app-create-recipe',
  imports: [RouterLink, Navbar, Footer, FormsModule, CommonModule, DecimalPipe, NgClass],
  templateUrl: './create-recipe.html',
  styleUrl: './create-recipe.scss',
})
export class CreateRecipe implements OnInit {

  truncar(valor: string, max: number): string {
    return valor.length > max ? valor.substring(0, max) : valor;
  }

  // ── Modo edición ──
  recetaId: string | null = null;
  modoEdicion = false;

  // ── Imagen ──
  imagenFile: File | null = null;
  imagenPreview: string | null = null;

  onImagenSeleccionada(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.imagenFile = file;
    const reader = new FileReader();
    reader.onload = () => { this.imagenPreview = reader.result as string; this.cdr.detectChanges(); };
    reader.readAsDataURL(file);
  }

  // ── Modal de confirmación ──
  modalConfirmVisible = false;

  abrirModalConfirmar(): void { this.modalConfirmVisible = true; }
  cerrarModalConfirmar(): void { this.modalConfirmVisible = false; }

  confirmarCreacion(): void {
    this.modalConfirmVisible = false;
    this.guardarReceta();
  }

  // ── Stepper ──
  pasoActual = 1;
  cargando = false;
  errorMensaje = '';
  errorPaso = '';

  pasoSiguiente(): void {
    this.errorPaso = '';
    if (this.pasoActual === 1) {
      if (!this.receta.nombre_receta.trim()) {
        this.errorPaso = 'El nombre de la receta es obligatorio.';
        return;
      }
      if (this.receta.nombre_receta.trim().length < 3) {
        this.errorPaso = 'El nombre debe tener al menos 3 caracteres.';
        return;
      }
      const tiempo = Number(this.receta.tiempo_preparacion);
      if (!this.receta.tiempo_preparacion || isNaN(tiempo) || tiempo < 1) {
        this.errorPaso = 'El tiempo de preparación es obligatorio y debe ser mayor a 0.';
        return;
      }
    }
    if (this.pasoActual === 2) {
      if (this.receta.ingredientes.length === 0) {
        this.errorPaso = 'Debes agregar al menos un ingrediente.';
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

  // ── Modelo principal ──
  receta: RecetaForm = {
    nombre_receta: '',
    ingredientes: [],
    nutricion: { kcal: 0, proteinas: 0, carbohidratos: 0, fibra: 0, vitaminas: [], minerales: [] },
    tags: [],
    tiempo_preparacion: '',
    visibilidad: 'publica',
  };

  // ── PASO 2: Catálogo de ingredientes ──────────────────────────────────────

  catalogoIngredientes: IngredienteResponse[] = [];
  cargandoCatalogo = false;
  errorCatalogo = false;

  // Estado del buscador
  busquedaIng = '';
  mostrarDropdown = false;
  ingredienteSeleccionado: IngredienteResponse | null = null;
  cantidadIng: number | null = null;

  // Para edición de un ingrediente ya agregado
  editandoIdx: number | null = null;

  get ingredientesFiltrados(): IngredienteResponse[] {
    const term = this.busquedaIng.toLowerCase().trim();
    if (!term) return this.catalogoIngredientes.slice(0, 8);
    return this.catalogoIngredientes
      .filter(i => i.nombre_ingrediente.toLowerCase().includes(term))
      .slice(0, 8);
  }

  cargarCatalogo(): void {
    if (this.catalogoIngredientes.length > 0) return;
    this.cargandoCatalogo = true;
    this.errorCatalogo = false;
    this.ingredienteService.obtenerTodos().subscribe({
      next: (data) => {
        this.catalogoIngredientes = data;
        this.cargandoCatalogo = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorCatalogo = true;
        this.cargandoCatalogo = false;
        this.cdr.detectChanges();
      },
    });
  }

  seleccionarIngrediente(ing: IngredienteResponse): void {
    this.ingredienteSeleccionado = ing;
    this.busquedaIng = ing.nombre_ingrediente;
    this.mostrarDropdown = false;
    this.cdr.detectChanges();
  }

  limpiarSeleccion(): void {
    this.ingredienteSeleccionado = null;
    this.busquedaIng = '';
    this.cantidadIng = null;
    this.mostrarDropdown = false;
  }

  onBusquedaInput(): void {
    this.ingredienteSeleccionado = null;
    this.mostrarDropdown = this.busquedaIng.trim().length > 0;
  }

  onBusquedaFocus(): void {
    this.mostrarDropdown = true;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(e: MouseEvent): void {
    const target = e.target as HTMLElement;
    if (!target.closest('.ing-search-wrap')) {
      this.mostrarDropdown = false;
    }
  }

  agregarIngrediente(): void {
    if (!this.ingredienteSeleccionado || this.cantidadIng === null || this.cantidadIng <= 0) return;

    const nuevo: IngredienteForm = {
      ingrediente_id:    this.ingredienteSeleccionado.id,
      nombre_ingrediente: this.ingredienteSeleccionado.nombre_ingrediente,
      cantidad:          this.cantidadIng,
      tipo_ingrediente:  this.ingredienteSeleccionado.tipo_ingrediente,
      tipo_cantidad:     this.ingredienteSeleccionado.tipo_cantidad,
    };

    if (this.editandoIdx !== null) {
      this.receta.ingredientes[this.editandoIdx] = nuevo;
      this.editandoIdx = null;
    } else {
      this.receta.ingredientes.push(nuevo);
    }

    this.limpiarSeleccion();
  }

  editarIngrediente(idx: number): void {
    const ing = this.receta.ingredientes[idx];
    this.busquedaIng = ing.nombre_ingrediente;
    this.cantidadIng = ing.cantidad;
    this.ingredienteSeleccionado = {
      id: ing.ingrediente_id,
      nombre_ingrediente: ing.nombre_ingrediente,
      tipo_ingrediente: ing.tipo_ingrediente,
      tipo_cantidad: ing.tipo_cantidad,
    } as IngredienteResponse;
    this.editandoIdx = idx;
    this.mostrarDropdown = false;
  }

  eliminarIngrediente(idx: number): void {
    this.receta.ingredientes.splice(idx, 1);
    if (this.editandoIdx === idx) {
      this.editandoIdx = null;
      this.limpiarSeleccion();
    }
  }

  getTipoEmoji(tipo: string): string {
    const map: Record<string, string> = {
      fruta: '🍎', verdura: '🥦', proteina: '🍗', carbohidrato: '🌾',
      lacteo: '🧀', liquido: '💧', grasa: '🫒', especia: '🌶️', otro: '🍽️',
    };
    return map[tipo?.toLowerCase()] ?? '🍽️';
  }

  // ── PASO 3: Nutrición ─────────────────────────────────────────────────────

  nuevaVitamina = '';
  nuevoMineral  = '';

  agregarVitamina(): void {
    const v = this.nuevaVitamina.trim();
    if (v && !this.receta.nutricion.vitaminas.includes(v)) {
      this.receta.nutricion.vitaminas = [...this.receta.nutricion.vitaminas, v];
    }
    this.nuevaVitamina = '';
  }

  eliminarVitamina(v: string): void {
    this.receta.nutricion.vitaminas = this.receta.nutricion.vitaminas.filter(x => x !== v);
  }

  agregarMineral(): void {
    const m = this.nuevoMineral.trim();
    if (m && !this.receta.nutricion.minerales.includes(m)) {
      this.receta.nutricion.minerales = [...this.receta.nutricion.minerales, m];
    }
    this.nuevoMineral = '';
  }

  eliminarMineral(m: string): void {
    this.receta.nutricion.minerales = this.receta.nutricion.minerales.filter(x => x !== m);
  }

  get totalMacros(): number {
    const n = this.receta.nutricion;
    return n.proteinas + n.carbohidratos + n.fibra;
  }

  getPct(campo: 'proteinas' | 'carbohidratos' | 'fibra'): number {
    if (this.totalMacros === 0) return 0;
    return (this.receta.nutricion[campo] / this.totalMacros) * 100;
  }

  // ── PASO 3: Tags ──────────────────────────────────────────────────────────

  tagsDisponibles: TagOpcion[] = [];

  get tagsSeleccionados(): TagOpcion[] {
    return this.tagsDisponibles.filter(t => t.selected);
  }

  initTags(tagsExistentes: string[] = []): void {
    this.tagsDisponibles = [
      { id: '1',  label: 'Bajo en calorías',  emoji: '📉', selected: false },
      { id: '2',  label: 'Alto en proteína',  emoji: '💪', selected: false },
      { id: '3',  label: 'Sin gluten',        emoji: '🌾', selected: false },
      { id: '4',  label: 'Vegano',            emoji: '🌱', selected: false },
      { id: '5',  label: 'Vegetariano',       emoji: '🥗', selected: false },
      { id: '6',  label: 'Bajo en carbs',     emoji: '⚖️', selected: false },
      { id: '7',  label: 'Rápido (<15 min)',  emoji: '⚡', selected: false },
      { id: '8',  label: 'Desayuno',          emoji: '☀️', selected: false },
      { id: '9',  label: 'Almuerzo',          emoji: '🍽️', selected: false },
      { id: '10', label: 'Cena',              emoji: '🌙', selected: false },
      { id: '11', label: 'Snack',             emoji: '🍎', selected: false },
      { id: '12', label: 'Alto en fibra',     emoji: '🥦', selected: false },
    ];
    if (tagsExistentes.length) {
      this.tagsDisponibles.forEach(t => { t.selected = tagsExistentes.includes(t.label); });
    }
  }

  toggleTag(tag: TagOpcion): void { tag.selected = !tag.selected; }

  // ── Guardar ───────────────────────────────────────────────────────────────

  guardarReceta(): void {
    this.receta.tags = this.tagsSeleccionados.map(t => t.label);
    const personaId = this.auth.getPersonaId();

    const payload: RecetaRequest = {
      nombre_receta: this.receta.nombre_receta,
      ingredientes: this.receta.ingredientes.map(ing => ({
        ingrediente_id:    ing.ingrediente_id,
        nombre_ingrediente: ing.nombre_ingrediente,
        cantidad:          ing.cantidad ?? 0,
        tipo_ingrediente:  ing.tipo_ingrediente,
        tipo_cantidad:     ing.tipo_cantidad,
      })),
      nutricion: this.receta.nutricion,
      tags: this.receta.tags,
      tiempo_preparacion: String(this.receta.tiempo_preparacion),
      creada_por: personaId,
      es_personalizada: true,
      visibilidad: this.receta.visibilidad,
    };

    this.cargando = true;
    this.errorMensaje = '';

    if (this.modoEdicion && this.recetaId) {
      this.recetaService.actualizar(this.recetaId, payload).subscribe({
        next: () => { this.subirImagenYNavegar(this.recetaId!); },
        error: () => { this.cargando = false; this.errorMensaje = 'Error al guardar la receta. Intenta de nuevo.'; },
      });
    } else {
      this.recetaService.crear(payload).subscribe({
        next: (res) => { this.subirImagenYNavegar(res.id); },
        error: () => { this.cargando = false; this.errorMensaje = 'Error al crear la receta. Intenta de nuevo.'; },
      });
    }
  }

  private subirImagenYNavegar(id: string): void {
    if (this.imagenFile) {
      this.recetaService.agregarImagen(id, this.imagenFile, this.imagenFile.name).subscribe({
        next:  () => { this.cargando = false; this.router.navigate(['/viewrecipe', id]); },
        error: () => { this.cargando = false; this.router.navigate(['/viewrecipe', id]); },
      });
    } else {
      this.cargando = false;
      this.router.navigate(['/viewrecipe', id]);
    }
  }

  onReturn(): void { this.router.navigate(['/recipes']); }

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private recetaService: RecetaService,
    private ingredienteService: IngredienteService,
    private auth: AuthService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.recetaId = id;
      this.modoEdicion = true;
      this.cargarReceta(id);
    } else {
      this.initTags();
    }
    this.cargarCatalogo();
  }

  private cargarReceta(id: string): void {
    this.recetaService.obtenerPorId(id).subscribe({
      next: (r) => {
        this.receta = {
          nombre_receta: r.nombre_receta,
          ingredientes: r.ingredientes.map(i => ({
            ingrediente_id:    i.ingrediente_id ?? '',
            nombre_ingrediente: i.nombre_ingrediente,
            cantidad:          i.cantidad,
            tipo_ingrediente:  i.tipo_ingrediente,
            tipo_cantidad:     i.tipo_cantidad ?? '',
          })),
          nutricion: { ...r.nutricion },
          tags: [...r.tags],
          tiempo_preparacion: r.tiempo_preparacion,
          visibilidad: r.visibilidad,
        };
        this.initTags(r.tags);
        this.cdr.detectChanges();
      },
    });
  }
}
