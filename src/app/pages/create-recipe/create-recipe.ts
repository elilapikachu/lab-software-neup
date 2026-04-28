import { Component, OnInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule, DecimalPipe } from '@angular/common';
import { NgClass } from '@angular/common';
import { Navbar } from '../navbar/navbar';
import { Footer } from '../footer/footer';

import { Tag } from '../../models/secundary/tag';

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
  tiempo_preparacion: string;
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
  
  // ── Stepper ──
  pasoActual = 1;
  pasoSiguiente(): void { if (this.pasoActual < 3) this.pasoActual++; }
  pasoAnterior(): void  { if (this.pasoActual > 1) this.pasoActual--; }
 
  // ── Modelo principal (espejo del JSON de BD) ──
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
    { value: 'fruta',     label: 'Fruta',      emoji: '🍎' },
    { value: 'verdura',   label: 'Verdura',    emoji: '🥦' },
    { value: 'proteina',  label: 'Proteína',   emoji: '🍗' },
    { value: 'carbohidrato', label: 'Carbohidrato', emoji: '🌾' },
    { value: 'lacteo',    label: 'Lácteo',     emoji: '🧀' },
    { value: 'liquido',   label: 'Líquido',    emoji: '💧' },
    { value: 'grasa',     label: 'Grasa',      emoji: '🫒' },
    { value: 'especia',   label: 'Especia',    emoji: '🌶️' },
    { value: 'otro',      label: 'Otro',       emoji: '🍽️' },
  ];
 
  getTipoLabel(value: string): string {
    const found = this.tiposIngrediente.find(t => t.value === value);
    return found ? `${found.emoji} ${found.label}` : value || 'Sin tipo';
  }
 
  agregarIngrediente(): void {
    if (!this.nuevoIng.nombre_ingrediente || this.nuevoIng.cantidad === null) return;
 
    if (this.editandoIdx !== null) {
      // Modo edición — reemplaza
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
 
  initTags(): void {
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
  }
 
  toggleTag(tag: TagOpcion): void { tag.selected = !tag.selected; }
 
  // ── Crear receta ──────────────────────────────────────────────────────────
 
  crearReceta(): void {
    // Sincroniza tags seleccionados al modelo antes de enviar
    this.receta.tags = this.tagsSeleccionados.map(t => t.label);
 
    const payload = {
      ...this.receta,
      es_personalizada: true,   // siempre true cuando la crea el usuario
      creada_por: null,         // pendiente: inyectar ID del usuario autenticado
    };
 
    console.log('Receta a crear:', payload);
    // Aquí irá la llamada al servicio cuando el backend esté listo
  }
 
  onReturn(): void { this.router.navigate(['/recipes']); }
 
  constructor(private router: Router) {}
  ngOnInit(): void { this.initTags(); }
}
