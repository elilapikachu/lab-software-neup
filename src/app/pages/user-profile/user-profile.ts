import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Navbar } from '../navbar/navbar';
import { Footer } from '../footer/footer';
import { AuthService } from '../../services/auth';
import { PerfilData } from '../../models/perfil';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule, Navbar, Footer],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.scss',
})
export class UserProfile implements OnInit {

  private readonly DB_KEY = 'neup_perfil';

  nombreUsuario: string = '';
  email: string = '';
  avatarLetra: string = 'N';

  tabActiva: 'sec1' | 'sec2' = 'sec1';
  formVisible = false;
  toastVisible = false;
  toastMensaje = '';
  formTitulo = 'Completa tu perfil';
  perfilGuardado = false;
  completionPct = 0;

  perfil: PerfilData = {
    saved: false,
    edad: '', estatura: '', peso: '', objetivo: '',
    frecuencia: '', tipoActividad: '', dieta: '',
    alergias: '', comidas: '', comidaRapida: ''
  };

  statPeso = '—';
  statEstatura = '—';
  statObjetivo = '—';
  statActividad = '—';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.nombreUsuario = this.authService.getNombreUsuario() || 'Usuario';
    this.email = localStorage.getItem('email') || 'usuario@email.com';
    this.avatarLetra = this.nombreUsuario.charAt(0).toUpperCase();

    const perfilGuardado = this.loadProfile();
    if (perfilGuardado?.saved) {
      this.perfil = perfilGuardado;
      this.perfilGuardado = true;
      this.formTitulo = 'Editar perfil';
      this.updateStats();
      this.updateCompletion();
    }
  }

  switchTab(tab: 'sec1' | 'sec2'): void {
    this.tabActiva = tab;
  }

  toggleForm(): void {
    this.formVisible = !this.formVisible;
  }

  scrollToForm(): void {
    this.formVisible = true;
    setTimeout(() => {
      document.getElementById('formSection')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  guardarPerfil(): void {
    this.perfil.saved = true;
    this.saveProfile(this.perfil);
    this.perfilGuardado = true;
    this.formTitulo = 'Editar perfil';
    this.updateStats();
    this.updateCompletion();
    this.showToast('✅ Perfil guardado correctamente');
  }

  private updateStats(): void {
    this.statPeso = this.perfil.peso || '—';
    this.statEstatura = this.perfil.estatura || '—';
    const obj = this.perfil.objetivo || '—';
    this.statObjetivo = obj.length > 7 ? obj.slice(0, 6) + '…' : obj;
    this.statActividad = this.perfil.frecuencia
      ? this.perfil.frecuencia.split('–')[0]
      : '—';
  }

  private updateCompletion(): void {
    const fields: (keyof PerfilData)[] = [
      'edad', 'estatura', 'peso', 'objetivo', 'frecuencia',
      'tipoActividad', 'dieta', 'alergias', 'comidas', 'comidaRapida'
    ];
    const filled = fields.filter(f => this.perfil[f] && this.perfil[f] !== '').length;
    this.completionPct = Math.round(filled / fields.length * 100);
  }

  private loadProfile(): PerfilData | null {
    try {
      return JSON.parse(localStorage.getItem(this.DB_KEY) || 'null');
    } catch {
      return null;
    }
  }

  private saveProfile(data: PerfilData): void {
    localStorage.setItem(this.DB_KEY, JSON.stringify(data));
  }

  showToast(mensaje: string): void {
    this.toastMensaje = mensaje;
    this.toastVisible = true;
    setTimeout(() => this.toastVisible = false, 3200);
  }
}