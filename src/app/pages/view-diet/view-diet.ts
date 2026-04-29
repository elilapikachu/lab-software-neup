import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { Navbar } from '../../layout/navbar/navbar';
import { Footer } from '../../layout/footer/footer';
import { CommonModule } from '@angular/common';

interface PlanSemanal {
  receta_id: { $oid: string };
  tipo_comida: string;
}

interface Dieta {
  _id: { $oid: string };
  nombre_dieta: string;
  descripcion: string;
  metas: string[];
  plan_semanal: PlanSemanal[];
  es_personalizada: boolean;
  visibilidad: string;
}

@Component({
  selector: 'app-view-diet',
  imports: [RouterLink, Navbar, Footer, CommonModule],
  templateUrl: './view-diet.html',
  styleUrl: './view-diet.scss',
})
export class ViewDiet implements OnInit {
  dieta: Dieta | null = null;
  dietasRelacionadas: Dieta[] = [];

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    // Simulación - reemplazar con servicio real
    this.dieta = {
      _id: { $oid: '69c5fbf01ba5db5ec8d79090' },
      nombre_dieta: 'Bajemos de peso ¡Ahora!',
      descripcion: 'Una dieta única para que puedas bajar de peso de manera efectiva y saludable',
      metas: ['Bajar de peso', 'Estabilizar peso'],
      plan_semanal: [
        { receta_id: { $oid: '69c5e7be1ba5db5ec8d7908a' }, tipo_comida: 'almuerzo' }
      ],
      es_personalizada: false,
      visibilidad: 'publica'
    };

    this.cargarDietasRelacionadas();
  }

  cargarDietasRelacionadas(): void {
    // Simulación - reemplazar con servicio real
    this.dietasRelacionadas = [
      {
        _id: { $oid: '69c5fbf01ba5db5ec8d79091' },
        nombre_dieta: 'Fit y Saludable',
        descripcion: 'Dieta para mantener tu peso ideal',
        metas: ['Mantener peso', 'Aumentar musculatura'],
        plan_semanal: [],
        es_personalizada: false,
        visibilidad: 'publica'
      },
      {
        _id: { $oid: '69c5fbf01ba5db5ec8d79092' },
        nombre_dieta: 'Proteína Power',
        descripcion: 'Enfocada en ganar masa muscular',
        metas: ['Aumentar musculatura', 'Ganar fuerza'],
        plan_semanal: [],
        es_personalizada: false,
        visibilidad: 'publica'
      },
      {
        _id: { $oid: '69c5fbf01ba5db5ec8d79093' },
        nombre_dieta: 'Detox Natural',
        descripcion: 'Limpia tu cuerpo de toxinas',
        metas: ['Desintoxicar', 'Mejorar digestión'],
        plan_semanal: [],
        es_personalizada: false,
        visibilidad: 'publica'
      }
    ];
  }

  guardarDieta(): void {
    // Lógica para guardar dieta
    console.log('Dieta guardada');
  }

  compartirDieta(): void {
    // Lógica para compartir dieta
    console.log('Dieta compartida');
  }

  descargarPDF(): void {
    // Lógica para descargar PDF
    console.log('PDF descargado');
  }
}
