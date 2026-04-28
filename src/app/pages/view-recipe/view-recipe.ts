import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Navbar } from '../navbar/navbar';
import { Footer } from '../footer/footer';
import { CommonModule, NgClass } from '@angular/common';

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
@Component({
  selector: 'app-view-recipe',
  imports: [RouterLink, Navbar, Footer, CommonModule],
  templateUrl: './view-recipe.html',
  styleUrl: './view-recipe.scss',
})
export class ViewRecipe implements OnInit {
   receta: Receta | null = null;
  recetasRelacionadas: Receta[] = [];
  
  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    // Simulación - reemplazar con servicio real
    this.receta = {
      _id: { $oid: '69c5e7be1ba5db5ec8d7908a' },
      nombre_receta: 'Agua de pollo',
      ingredientes: [
        { nombre_ingrediente: 'Tomate', cantidad: 2, tipo_ingrediente: 'fruta' },
        { nombre_ingrediente: 'Pollo', cantidad: 0.5, tipo_ingrediente: 'proteina' },
        { nombre_ingrediente: 'agua', cantidad: 1, tipo_ingrediente: 'liquido' }
      ],
      nutricion: {
        kcal: 0,
        proteinas: 23,
        carbohidratos: 209,
        fibra: 0,
        vitaminas: [],
        minerales: []
      },
      tags: ['bajo calorias'],
      tiempo_preparacion: '20',
      creada_por: null,
      es_personalizada: false,
      visibilidad: 'publica'
    };

    this.cargarRecetasRelacionadas();
  }

  cargarRecetasRelacionadas(): void {
    // Simulación - reemplazar con servicio real
    this.recetasRelacionadas = [
      {
        _id: { $oid: '69c5e7be1ba5db5ec8d7908b' },
        nombre_receta: 'Pechuga a la parilla',
        ingredientes: [],
        nutricion: { kcal: 165, proteinas: 31, carbohidratos: 0, fibra: 0, vitaminas: [], minerales: [] },
        tags: ['alto proteina'],
        tiempo_preparacion: '15',
        creada_por: null,
        es_personalizada: false,
        visibilidad: 'publica'
      },
      {
        _id: { $oid: '69c5e7be1ba5db5ec8d7908c' },
        nombre_receta: 'Ensalada fresca',
        ingredientes: [],
        nutricion: { kcal: 85, proteinas: 3, carbohidratos: 15, fibra: 4, vitaminas: [], minerales: [] },
        tags: ['bajo calorias', 'vegetariano'],
        tiempo_preparacion: '10',
        creada_por: null,
        es_personalizada: false,
        visibilidad: 'publica'
      },
      {
        _id: { $oid: '69c5e7be1ba5db5ec8d7908d' },
        nombre_receta: 'Sopa de verduras',
        ingredientes: [],
        nutricion: { kcal: 95, proteinas: 5, carbohidratos: 18, fibra: 3, vitaminas: [], minerales: [] },
        tags: ['bajo calorias'],
        tiempo_preparacion: '25',
        creada_por: null,
        es_personalizada: false,
        visibilidad: 'publica'
      }
    ];
  }

  guardarReceta(): void {
    console.log('Receta guardada');
  }

  compartirReceta(): void {
    console.log('Receta compartida');
  }
}
