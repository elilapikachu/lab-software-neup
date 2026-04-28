import { Component, OnInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Navbar } from '../navbar/navbar';
import { Footer } from '../footer/footer';

import { Tag } from '../../models/secundary/tag';

interface Dia {
  key: string;
  label: string;
  short: string;
  activo: boolean;
}

interface Receta {
  id: number;
  nombre: string;
  img: string;
  kcal: number;
  proteina: number;
  carbs: number;
  grasas: number;
  categoria: string;
  categoriaLabel: string;
  categoriaEmoji: string;
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

  // ── Stepper ──
  pasoActual = 1;

  pasoSiguiente(): void { if (this.pasoActual < 3) this.pasoActual++; }
  pasoAnterior(): void { if (this.pasoActual > 1) this.pasoActual--; }

  // ── Paso 1: Info básica ──
  nombreDieta = '';
  descripcion = '';
  visibilidad = 'publica';

  // ── Paso 2: Tags/Metas ──
  tags: Tag[] = [];

  get tagsSeleccionados(): Tag[] { return this.tags.filter(t => t.selected); }

  initializeTags(): void {
    this.tags = [
      { id: '1', label: 'Bajar de peso', selected: false },
      { id: '2', label: 'Subir de peso', selected: false },
      { id: '3', label: 'Peso saludable', selected: false },
      { id: '4', label: 'Bajar calorías', selected: false },
      { id: '5', label: 'Ganar músculo', selected: false },
      { id: '6', label: 'Definir mi cuerpo', selected: false },
      { id: '7', label: 'Más energía', selected: false },
      { id: '8', label: 'Mejorar digestión', selected: false },
    ];
  }

  toggleTag(tag: Tag): void { tag.selected = !tag.selected; }

  // ── Paso 3: Días ──
  dias: Dia[] = [
    { key: 'lunes', label: 'Lunes', short: 'Lun', activo: false },
    { key: 'martes', label: 'Martes', short: 'Mar', activo: false },
    { key: 'miercoles', label: 'Miércoles', short: 'Mié', activo: false },
    { key: 'jueves', label: 'Jueves', short: 'Jue', activo: false },
    { key: 'viernes', label: 'Viernes', short: 'Vie', activo: false },
    { key: 'sabado', label: 'Sábado', short: 'Sáb', activo: false },
    { key: 'domingo', label: 'Domingo', short: 'Dom', activo: false },
  ];

  diaSeleccionado: string = '';

  get diasActivos(): Dia[] { return this.dias.filter(d => d.activo); }

  toggleDia(dia: Dia): void {
    if (!dia.activo) {
      dia.activo = true;
      this.diaSeleccionado = dia.key;
    } else {
      if (this.diaSeleccionado === dia.key) {
        // Si ya estaba seleccionado, solo deseleccionar la vista sin desactivar
        this.diaSeleccionado = dia.key; // mantener panel abierto
      } else {
        this.diaSeleccionado = dia.key;
      }
    }
    this.carruselOffset = 0;
  }

  selectDia(key: string): void {
    this.diaSeleccionado = key;
    this.carruselOffset = 0;
  }

  isDiaActivo(key: string): boolean { return this.dias.find(d => d.key === key)?.activo ?? false; }
  getDiaLabel(key: string): string { return this.dias.find(d => d.key === key)?.label ?? ''; }

  // ── Recetas por día: mapa { diaKey: Receta[] } ──
  planSemanal: Record<string, Receta[]> = {};

  getRecetasDia(dia: string): Receta[] { return this.planSemanal[dia] ?? []; }

  isRecetaEnDia(dia: string, recetaId: number): boolean {
    return this.getRecetasDia(dia).some(r => r.id === recetaId);
  }

  toggleRecetaEnDia(dia: string, receta: Receta): void {
    if (!this.planSemanal[dia]) this.planSemanal[dia] = [];
    const idx = this.planSemanal[dia].findIndex(r => r.id === receta.id);
    if (idx === -1) {
      this.planSemanal[dia] = [...this.planSemanal[dia], receta];
    } else {
      this.planSemanal[dia] = this.planSemanal[dia].filter(r => r.id !== receta.id);
    }
  }

  getTotalKcalDia(dia: string): number {
    return this.getRecetasDia(dia).reduce((sum, r) => sum + r.kcal, 0);
  }

  carruselOffset = 0;
  carruselCardWidth = 220; 

  prevSlide(): void { if (this.carruselOffset > 0) this.carruselOffset--; }

  nextSlide(): void {
    const visibles = Math.floor(860 / this.carruselCardWidth); // viewport ~860px
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

  categorias: Categoria[] = [
    { key: 'todas', label: 'Todas', emoji: '🍽️' },
    { key: 'proteina', label: 'Proteína', emoji: '🍗' },
    { key: 'vegetal', label: 'Vegetal', emoji: '🥗' },
    { key: 'carbohidrato', label: 'Carbs', emoji: '🍝' },
    { key: 'desayuno', label: 'Desayuno', emoji: '🌅' },
    { key: 'snack', label: 'Snack', emoji: '🍎' },
  ];

  onBuscar(): void { this.carruselOffset = 0; }

  get recetasFiltradas(): Receta[] {
    return this.todasLasRecetas.filter(r => {
      const matchBusqueda = r.nombre.toLowerCase().includes(this.busquedaReceta.toLowerCase());
      const matchCat = this.filtroCategoria === 'todas' || r.categoria === this.filtroCategoria;
      return matchBusqueda && matchCat;
    });
  }


  todasLasRecetas: Receta[] = [
    { id: 1, nombre: 'Bowl de pollo y quinoa', img: '/assets/img/dietas/pollo-quinoa.jpg', kcal: 420, proteina: 38, carbs: 32, grasas: 9, categoria: 'proteina', categoriaLabel: 'Proteína', categoriaEmoji: '🍗' },
    { id: 2, nombre: 'Avena proteica con berries', img: '/assets/img/dietas/avena-frutos.jpg', kcal: 510, proteina: 28, carbs: 60, grasas: 12, categoria: 'desayuno', categoriaLabel: 'Desayuno', categoriaEmoji: '🌅' },
    { id: 3, nombre: 'Salmón al horno con brócoli', img: '/assets/img/dietas/salmon-brocoli.jpg', kcal: 480, proteina: 42, carbs: 18, grasas: 22, categoria: 'proteina', categoriaLabel: 'Proteína', categoriaEmoji: '🍗' },
    { id: 4, nombre: 'Ensalada de garbanzos', img: '/assets/img/dietas/garbanzos.jpg', kcal: 380, proteina: 18, carbs: 42, grasas: 11, categoria: 'vegetal', categoriaLabel: 'Vegetal', categoriaEmoji: '🥗' },
    { id: 5, nombre: 'Tortilla de claras', img: '/assets/img/dietas/tortilla-claras.jpg', kcal: 290, proteina: 32, carbs: 8, grasas: 6, categoria: 'proteina', categoriaLabel: 'Proteína', categoriaEmoji: '🍗' },
    { id: 6, nombre: 'Pasta integral con carne', img: '/assets/img/dietas/pasta-carne.jpg', kcal: 620, proteina: 40, carbs: 72, grasas: 14, categoria: 'carbohidrato', categoriaLabel: 'Carbs', categoriaEmoji: '🍝' },
    { id: 7, nombre: 'Smoothie verde energizante', img: '/assets/img/dietas/smoothie-verde.jpg', kcal: 240, proteina: 8, carbs: 38, grasas: 6, categoria: 'snack', categoriaLabel: 'Snack', categoriaEmoji: '🍎' },
    { id: 8, nombre: 'Arroz con atún y aguacate', img: '/assets/img/dietas/arroz-atun.jpg', kcal: 460, proteina: 34, carbs: 45, grasas: 14, categoria: 'carbohidrato', categoriaLabel: 'Carbs', categoriaEmoji: '🍝' },
    { id: 9, nombre: 'Pancakes de plátano', img: '/assets/img/dietas/pancakes.jpg', kcal: 490, proteina: 30, carbs: 58, grasas: 10, categoria: 'desayuno', categoriaLabel: 'Desayuno', categoriaEmoji: '🌅' },
    { id: 10, nombre: 'Ensalada mediterránea', img: '/assets/img/dietas/garbanzos.jpg', kcal: 320, proteina: 14, carbs: 28, grasas: 16, categoria: 'vegetal', categoriaLabel: 'Vegetal', categoriaEmoji: '🥗' },
    { id: 11, nombre: 'Yogur griego con granola', img: '/assets/img/dietas/avena-frutos.jpg', kcal: 310, proteina: 20, carbs: 36, grasas: 8, categoria: 'snack', categoriaLabel: 'Snack', categoriaEmoji: '🍎' },
    { id: 12, nombre: 'Wrap de pavo integral', img: '/assets/img/dietas/pasta-carne.jpg', kcal: 410, proteina: 35, carbs: 40, grasas: 9, categoria: 'proteina', categoriaLabel: 'Proteína', categoriaEmoji: '🍗' },
  ];

  // ── Crear dieta ──
  crearDieta(): void {
    console.log({
      nombre: this.nombreDieta,
      descripcion: this.descripcion,
      visibilidad: this.visibilidad,
      metas: this.tagsSeleccionados,
      planSemanal: this.planSemanal,
    });
    // Aquí irá la llamada al servicio cuando el backend esté listo
  }

  onReturn(): void { this.router.navigate(['/diet']); }

  constructor(private router: Router) { }

  ngOnInit(): void { this.initializeTags(); }
}
