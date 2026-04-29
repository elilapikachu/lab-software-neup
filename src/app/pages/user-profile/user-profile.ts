// src/app/pages/user-profile/user-profile.ts
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Navbar } from '../../layout/navbar/navbar';
import { Footer } from '../../layout/footer/footer';
import { AuthService } from '../../services/auth';
import { PerfilService } from '../../services/profile-service';
import { AlertService } from '../../services/alert';
import { PerfilData } from '../../models/perfil';
import { Tag } from '../../models/secundary/tag';
import { AlertComponent } from '../../layout/alert/alert';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [RouterLink, CommonModule, ReactiveFormsModule, Navbar, Footer, AlertComponent],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.scss',
})
export class UserProfile implements OnInit {

  private authService = inject(AuthService);
  private perfilService = inject(PerfilService);
  private alertService = inject(AlertService);
  private fb = inject(FormBuilder);

  // ── Info del usuario ──────────────────────────────────────────────────────
  nombreUsuario = '';
  email = '';
  avatarLetra = 'N';
  private usuarioId = '';

  // ── UI state ──────────────────────────────────────────────────────────────
  tabActiva: 'sec1' | 'sec2' = 'sec1';
  formVisible = false;
  perfilGuardado = false;
  completionPct = 0;
  cargando = false;

  // ── Formulario reactivo ───────────────────────────────────────────────────
  perfilForm!: FormGroup;

  // ── Datos del perfil para mostrar en stats ────────────────────────────────
  perfil: PerfilData = {};

  // ── Stats cards ────────────────────���──────────────────────────────────────
  statPeso = '—';
  statEstatura = '—';
  statObjetivo = '—';
  statActividad = '—';

  // ── Tags ──────────────────────────────────────────────────────────────────
  tagsObjetivos: Tag[] = [
    { id: 'bajar', label: '⬇ Bajar de peso', selected: false },
    { id: 'mantener', label: '⚖ Mantener peso', selected: false },
    { id: 'subir', label: '⬆ Subir de peso', selected: false },
    { id: 'muscular', label: '💪 Ganar músculo', selected: false },
    { id: 'salud', label: '❤ Mejorar salud', selected: false },
    { id: 'energia', label: '⚡ Más energía', selected: false },
  ];

  tagsTipoActividad: Tag[] = [
    { id: 'gym', label: '🏋 Gimnasio', selected: false },
    { id: 'deporte', label: '⚽ Deporte', selected: false },
    { id: 'correr', label: '🏃 Correr/Caminar', selected: false },
    { id: 'yoga', label: '🧘 Yoga', selected: false },
    { id: 'ciclismo', label: '🚴 Ciclismo', selected: false },
    { id: 'natacion', label: '🏊 Natación', selected: false },
  ];

  tagsDieta: Tag[] = [
    { id: 'vegana', label: '🌱 Vegana', selected: false },
    { id: 'vegetariana', label: '🥗 Vegetariana', selected: false },
    { id: 'keto', label: '🥩 Keto', selected: false },
    { id: 'mediterranea', label: '🫒 Mediterránea', selected: false },
    { id: 'sin_gluten', label: '🌾 Sin gluten', selected: false },
    { id: 'sin_lactosa', label: '🥛 Sin lactosa', selected: false },
    { id: 'omnivora', label: '🍽 Omnívora', selected: false },
    { id: 'paleo', label: '🦴 Paleo', selected: false },
  ];

  tagsAlergias: Tag[] = [
    { id: 'mariscos', label: '🦐 Mariscos', selected: false },
    { id: 'cacahuates', label: '🥜 Cacahuates', selected: false },
    { id: 'lacteos', label: '🧀 Lácteos', selected: false },
    { id: 'huevo', label: '🥚 Huevo', selected: false },
    { id: 'soya', label: '🫘 Soya', selected: false },
    { id: 'nueces', label: '🌰 Nueces', selected: false },
    { id: 'trigo', label: '🌾 Trigo', selected: false },
    { id: 'ninguna', label: '✅ Ninguna', selected: false },
  ];

  ngOnInit(): void {
    this.usuarioId = this.authService.getUsuarioId() || '';
    this.nombreUsuario = this.authService.getNombreUsuario() || 'Usuario';
    this.email = localStorage.getItem('email') || 'usuario@email.com';
    this.avatarLetra = this.nombreUsuario.charAt(0).toUpperCase();

    this.initForm();

    if (this.usuarioId) {
      this.cargarPerfil();
    } else {
      this.alertService.danger('⚠ Sesión no válida. Inicia sesión de nuevo.');
    }
  }

  // ── Inicializar Formulario ────────────────────────────────────────────────
  private initForm(): void {
    this.perfilForm = this.fb.group({
      primerNombre: [''],
      segundoNombre: [''],
      primerApellido: [''],
      segundoApellido: [''],
      telefono: ['', [Validators.min(1000000000), Validators.max(9999999999)]],
      otroEmail: ['', Validators.email],
      edad: ['', [Validators.min(10), Validators.max(120)]],
      altura: ['', [Validators.required, Validators.min(100), Validators.max(250)]],
      peso: ['', [Validators.required, Validators.min(20), Validators.max(300)]],
      frecuenciaSemanal: [''],
      comidasAlDia: [''],
    });
  }

  // ── Carga desde API ───────────────────────────────────────────────────────
  private cargarPerfil(): void {
    this.cargando = true;
    this.perfilService.obtenerPerfil(this.usuarioId).subscribe({
      next: (dto) => {
        this.perfil = dto;
        this.email = dto.email || this.email;

        // Llena el formulario con los datos del perfil
        this.perfilForm.patchValue({
          primerNombre: dto.nombres?.[0] || '',
          segundoNombre: dto.nombres?.[1] || '',
          primerApellido: dto.apellidos?.[0] || '',
          segundoApellido: dto.apellidos?.[1] || '',
          telefono: dto.telefono || '',
          otroEmail: dto.otroEmail || '',
          edad: dto.edad || '',
          altura: dto.altura || '',
          peso: dto.peso || '',
          frecuenciaSemanal: dto.frecuenciaSemanal || '',
          comidasAlDia: dto.comidasAlDia || '',
        });

        // Sincroniza tags con los datos recibidos
        this.syncTags(this.tagsObjetivos, dto.objetivos);
        this.syncTags(this.tagsTipoActividad, dto.tipoActividad);
        this.syncTags(this.tagsDieta, dto.tipoDieta);
        this.syncTags(this.tagsAlergias, dto.alergias);

        // Determina si ya hay perfil guardado
        const tieneDatos = !!(dto.personaId && (dto.peso || dto.altura || dto.nombres?.length));
        if (tieneDatos) {
          this.perfilGuardado = true;
          this.updateStats();
          this.updateCompletion();
        }

        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar perfil:', err);
        this.alertService.warning('ℹ Crea tu perfil para personalizar tu experiencia', {
          autoDismiss: 5000
        });
        this.cargando = false;
      }
    });
  }

  // ── Guardar en API ────────────────────────────────────────────────────────
  guardarPerfil(): void {
    if (!this.usuarioId) {
      this.alertService.danger('⚠ Sesión no válida');
      return;
    }

    // Validar que el formulario sea válido
    if (this.perfilForm.invalid) {
      this.alertService.danger('❌ Revisa los campos. Hay valores inválidos.');
      console.log('Errores del formulario:', this.perfilForm.errors);
      return;
    }

    // Mapear valores del formulario
    const formValues = this.perfilForm.value;

    const dto: PerfilData = {
      nombres: [formValues.primerNombre, formValues.segundoNombre].filter(Boolean),
      apellidos: [formValues.primerApellido, formValues.segundoApellido].filter(Boolean),
      telefono: formValues.telefono || undefined,
      otroEmail: formValues.otroEmail || undefined,
      edad: formValues.edad || undefined,
      altura: formValues.altura || undefined,
      peso: formValues.peso || undefined,
      frecuenciaSemanal: formValues.frecuenciaSemanal || undefined,
      comidasAlDia: formValues.comidasAlDia || undefined,
      objetivos: this.tagsObjetivos.filter(t => t.selected).map(t => t.label),
      tipoActividad: this.tagsTipoActividad.filter(t => t.selected).map(t => t.label),
      tipoDieta: this.tagsDieta.filter(t => t.selected).map(t => t.label),
      alergias: this.tagsAlergias.filter(t => t.selected).map(t => t.label),
    };

    this.cargando = true;
    this.perfilService.guardarPerfil(this.usuarioId, dto).subscribe({
      next: (respuesta) => {
        this.perfil = respuesta;
        this.perfilGuardado = true;
        this.updateStats();
        this.updateCompletion();

        this.alertService.success('✅ ¡Perfil guardado correctamente!', {
          autoDismiss: 4000
        });

        this.cargando = false;
        this.formVisible = false;
      },
      error: (err) => {
        console.error('Error al guardar perfil:', err);

        if (err.status === 400) {
          this.alertService.danger('❌ Datos inválidos. Revisa los campos.');
        } else if (err.status === 404) {
          this.alertService.danger('❌ Usuario no encontrado.');
        } else {
          this.alertService.danger('❌ Error al guardar. Intenta de nuevo.');
        }

        this.cargando = false;
      }
    });
  }

  // ── Helpers de tags ───────────────────────────────────────────────────────
  toggleTag(tag: Tag): void {
    tag.selected = !tag.selected;
  }

  private syncTags(tags: Tag[], valores?: string[]): void {
    if (!valores?.length) return;
    tags.forEach(t => {
      t.selected = valores.includes(t.label);
    });
  }

  // ── Stats y completion ───────────────────────────────��────────────────────
  private updateStats(): void {
    const peso = this.perfilForm.get('peso')?.value;
    const altura = this.perfilForm.get('altura')?.value;
    const frecuencia = this.perfilForm.get('frecuenciaSemanal')?.value;

    this.statPeso = peso ? String(peso) : '—';
    this.statEstatura = altura ? String(altura) : '—';
    const obj = this.tagsObjetivos.find(t => t.selected)?.label || '—';
    this.statObjetivo = obj.length > 10 ? obj.slice(0, 9) + '…' : obj;
    this.statActividad = frecuencia ? `${frecuencia}x/sem` : '—';
  }

  public updateCompletion(): void {
    const checks: boolean[] = [
      !!this.perfilForm.get('primerNombre')?.value,
      !!this.perfilForm.get('primerApellido')?.value,
      !!this.perfilForm.get('peso')?.value,
      !!this.perfilForm.get('altura')?.value,
      this.tagsObjetivos.some(t => t.selected),
      !!this.perfilForm.get('frecuenciaSemanal')?.value,
      this.tagsTipoActividad.some(t => t.selected),
      this.tagsDieta.some(t => t.selected),
      this.tagsAlergias.some(t => t.selected),
      !!this.perfilForm.get('comidasAlDia')?.value,
    ];
    const filled = checks.filter(Boolean).length;
    this.completionPct = Math.round(filled / checks.length * 100);
  }

  // ── UI helpers ────────────────────────────────────────────────────────────
  switchTab(tab: 'sec1' | 'sec2'): void { this.tabActiva = tab; }

  toggleForm(): void { this.formVisible = !this.formVisible; }

  scrollToForm(): void {
    this.formVisible = true;
    setTimeout(() => {
      document.getElementById('formSection')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  // ── Getters para detectar errores en el template ───────────────────────────
  hasError(fieldName: string, errorType: string): boolean {
    const field = this.perfilForm.get(fieldName);
    return !!(field && field.hasError(errorType) && (field.dirty || field.touched));
  }

  getErrorMessage(fieldName: string): string {
    const field = this.perfilForm.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.hasError('required')) return 'Este campo es requerido';
    if (field.hasError('min')) return `Valor mínimo: ${field.getError('min').min}`;
    if (field.hasError('max')) return `Valor máximo: ${field.getError('max').max}`;
    if (field.hasError('email')) return 'Email inválido';

    return 'Campo inválido';
  }
}