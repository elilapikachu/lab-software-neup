import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { Navbar } from '../../layout/navbar/navbar';
import { Footer } from '../../layout/footer/footer';

interface Ingrediente {
  nombre_ingrediente: string;
  cantidad: number;
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

interface Receta {
  _id: { $oid: string };
  nombre_receta: string;
  ingredientes: Ingrediente[];
  nutricion: Nutricion;
  tags: string[];
  tiempo_preparacion: string;
  creada_por: string | null;
  es_personalizada: boolean;
  visibilidad: string;
}

interface Dieta {
  _id: { $oid: string };
  nombre_dieta: string;
  descripcion: string;
  metas: string[];
  es_personalizada: boolean;
  visibilidad: string;
}
@Component({
  selector: 'app-view-saved',
  imports: [RouterLink,Navbar, Footer, CommonModule],
  templateUrl: './view-saved.html',
  styleUrl: './view-saved.scss',
})
export class ViewSaved implements OnInit {
activeTab: 'recetas' | 'dietas' = 'recetas';
  
  misRecetas: Receta[] = [];
  misDietas: Dieta[] = [];
  recetasGuardadas: Receta[] = [];
  dietasGuardadas: Dieta[] = [];

  filterRecetas: 'todos' | 'personalizadas' | 'guardadas' = 'todos';
  filterDietas: 'todos' | 'personalizadas' | 'guardadas' = 'todos';

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.misRecetas = [
      {
        _id: { $oid: '69c5e7be1ba5db5ec8d7908a' },
        nombre_receta: 'Mi Receta de Pollo',
        ingredientes: [],
        nutricion: { kcal: 250, proteinas: 30, carbohidratos: 10, fibra: 2, vitaminas: [], minerales: [] },
        tags: ['personalizada'],
        tiempo_preparacion: '25',
        creada_por: 'usuario-123',
        es_personalizada: true,
        visibilidad: 'privada'
      },
      {
        _id: { $oid: '69c5e7be1ba5db5ec8d7908b' },
        nombre_receta: 'Ensalada Mix',
        ingredientes: [],
        nutricion: { kcal: 120, proteinas: 8, carbohidratos: 15, fibra: 4, vitaminas: [], minerales: [] },
        tags: ['vegetariana', 'ligera'],
        tiempo_preparacion: '10',
        creada_por: 'usuario-123',
        es_personalizada: true,
        visibilidad: 'publica'
      }
    ];

    this.misDietas = [
      {
        _id: { $oid: '69c5fbf01ba5db5ec8d79090' },
        nombre_dieta: 'Mi Dieta Personalizada',
        descripcion: 'Una dieta creada especialmente para mí',
        metas: ['Bajar de peso', 'Mejorar salud'],
        es_personalizada: true,
        visibilidad: 'privada'
      }
    ];

    this.recetasGuardadas = [
      {
        _id: { $oid: '69c5e7be1ba5db5ec8d7908c' },
        nombre_receta: 'Agua de pollo',
        ingredientes: [],
        nutricion: { kcal: 180, proteinas: 23, carbohidratos: 5, fibra: 0, vitaminas: [], minerales: [] },
        tags: ['bajo calorias'],
        tiempo_preparacion: '20',
        creada_por: null,
        es_personalizada: false,
        visibilidad: 'publica'
      }
    ];

    this.dietasGuardadas = [
      {
        _id: { $oid: '69c5fbf01ba5db5ec8d79091' },
        nombre_dieta: 'Fit y Saludable',
        descripcion: 'Dieta para mantener tu peso ideal',
        metas: ['Mantener peso', 'Aumentar musculatura'],
        es_personalizada: false,
        visibilidad: 'publica'
      }
    ];
  }

  cambiarTab(tab: 'recetas' | 'dietas'): void {
    this.activeTab = tab;
  }

  cambiarFilterRecetas(filter: 'todos' | 'personalizadas' | 'guardadas'): void {
    this.filterRecetas = filter;
  }

  cambiarFilterDietas(filter: 'todos' | 'personalizadas' | 'guardadas'): void {
    this.filterDietas = filter;
  }

  getRecetasFiltradasRecetas(): Receta[] {
    if (this.filterRecetas === 'personalizadas') {
      return this.misRecetas.filter(r => r.es_personalizada);
    } else if (this.filterRecetas === 'guardadas') {
      return this.recetasGuardadas;
    }
    return [...this.misRecetas, ...this.recetasGuardadas];
  }

  getDietasFiltradasDietas(): Dieta[] {
    if (this.filterDietas === 'personalizadas') {
      return this.misDietas.filter(d => d.es_personalizada);
    } else if (this.filterDietas === 'guardadas') {
      return this.dietasGuardadas;
    }
    return [...this.misDietas, ...this.dietasGuardadas];
  }

  crearReceta(): void {
    console.log('Ir a crear receta');
  }

  crearDieta(): void {
    this.router.navigate(['/createrecipe']);
  }

  editarReceta(receta: Receta): void {
    console.log('Editar receta:', receta);
  }

  editarDieta(dieta: Dieta): void {
    console.log('Editar dieta:', dieta);
  }

  eliminarReceta(id: string): void {
    console.log('Eliminar receta:', id);
  }

  eliminarDieta(id: string): void {
    console.log('Eliminar dieta:', id);
  }
}
