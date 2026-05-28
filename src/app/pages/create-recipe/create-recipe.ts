import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule, DecimalPipe } from '@angular/common';
import { NgClass } from '@angular/common';
import { Navbar } from '../../layout/navbar/navbar';
import { Footer } from '../../layout/footer/footer';

import { RecetaRequest } from '../../models/receta';
import { RecetaService } from '../../services/receta.service';
import { AuthService } from '../../services/auth';

interface Ingrediente {
  nombre_ingrediente: string;
  cantidad: number | null;
  tipo_ingrediente: string;
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
  ingredientes: Ingrediente[];
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

interface TipoIngrediente {
  value: string;
  label: string;
  emoji: string;
}

@Component({
  selector: 'app-create-recipe',
  imports: [RouterLink, Navbar, Footer, FormsModule, CommonModule, DecimalPipe, NgClass],
  templateUrl: './create-recipe.html',
  styleUrl: './create-recipe.scss',
})
export class CreateRecipe implements OnInit {

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

  // ── Stepper ──
  pasoActual = 1;
  cargando = false;
  errorMensaje = '';

  pasoSiguiente(): void { if (this.pasoActual < 3) this.pasoActual++; }
  pasoAnterior(): void  { if (this.pasoActual > 1) this.pasoActual--; }

  // ── Modelo principal ──
  receta: RecetaForm = {
    nombre_receta: '',
    ingredientes: [],
    nutricion: { kcal: 0, proteinas: 0, carbohidratos: 0, fibra: 0, vitaminas: [], minerales: [] },
    tags: [],
    tiempo_preparacion: '',
    visibilidad: 'publica',
  };

  // ── PASO 2: Ingredientes ──────────────────────────────────────────────────

  nuevoIng: Ingrediente = { nombre_ingrediente: '', cantidad: null, tipo_ingrediente: '' };
  editandoIdx: number | null = null;

  tiposIngrediente: TipoIngrediente[] = [
    { value: 'fruta',        label: 'Fruta',        emoji: '🍎' },
    { value: 'verdura',      label: 'Verdura',      emoji: '🥦' },
    { value: 'proteina',     label: 'Proteína',     emoji: '🍗' },
    { value: 'carbohidrato', label: 'Carbohidrato', emoji: '🌾' },
    { value: 'lacteo',       label: 'Lácteo',       emoji: '🧀' },
    { value: 'liquido',      label: 'Líquido',      emoji: '💧' },
    { value: 'grasa',        label: 'Grasa',        emoji: '🫒' },
    { value: 'especia',      label: 'Especia',      emoji: '🌶️' },
    { value: 'otro',         label: 'Otro',         emoji: '🍽️' },
  ];

  getTipoLabel(value: string): string {
    const found = this.tiposIngrediente.find(t => t.value === value);
    return found ? `${found.emoji} ${found.label}` : value || 'Sin tipo';
  }

  agregarIngrediente(): void {
    if (!this.nuevoIng.nombre_ingrediente || this.nuevoIng.cantidad === null) return;

    if (this.editandoIdx !== null) {
      this.receta.ingredientes[this.editandoIdx] = { ...this.nuevoIng };
      this.editandoIdx = null;
    } else {
      this.receta.ingredientes.push({ ...this.nuevoIng });
    }

    this.nuevoIng = { nombre_ingrediente: '', cantidad: null, tipo_ingrediente: '' };
  }

  editarIngrediente(idx: number): void {
    this.nuevoIng = { ...this.receta.ingredientes[idx] };
    this.editandoIdx = idx;
  }

  eliminarIngrediente(idx: number): void {
    this.receta.ingredientes.splice(idx, 1);
    if (this.editandoIdx === idx) {
      this.editandoIdx = null;
      this.nuevoIng = { nombre_ingrediente: '', cantidad: null, tipo_ingrediente: '' };
    }
  }

  // ── PASO 3: Nutrición ─────────────────────────────────────────────────────

  // ── Vitaminas / Minerales (chips) ──────────────────────────────────────────
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
      this.tagsDisponibles.forEach(t => {
        t.selected = tagsExistentes.includes(t.label);
      });
    }
  }

  toggleTag(tag: TagOpcion): void { tag.selected = !tag.selected; }

  // ── Guardar (crear o editar) ──────────────────────────────────────────────

  guardarReceta(): void {
    this.receta.tags = this.tagsSeleccionados.map(t => t.label);

    const personaId = this.auth.getPersonaId();

    const payload: RecetaRequest = {
      nombre_receta: this.receta.nombre_receta,
      ingredientes: this.receta.ingredientes.map(ing => ({
        nombre_ingrediente: ing.nombre_ingrediente,
        cantidad: ing.cantidad ?? 0,
        tipo_ingrediente: ing.tipo_ingrediente,
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
        next: () => {
          this.subirImagenYNavegar(this.recetaId!);
        },
        error: () => {
          this.cargando = false;
          this.errorMensaje = 'Error al guardar la receta. Intenta de nuevo.';
        },
      });
    } else {
      this.recetaService.crear(payload).subscribe({
        next: (res) => {
          this.subirImagenYNavegar(res.id);
        },
        error: () => {
          this.cargando = false;
          this.errorMensaje = 'Error al crear la receta. Intenta de nuevo.';
        },
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
  }

  private cargarReceta(id: string): void {
    this.recetaService.obtenerPorId(id).subscribe({
      next: (r) => {
        this.receta = {
          nombre_receta: r.nombre_receta,
          ingredientes: r.ingredientes.map(i => ({
            nombre_ingrediente: i.nombre_ingrediente,
            cantidad: i.cantidad,
            tipo_ingrediente: i.tipo_ingrediente,
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
