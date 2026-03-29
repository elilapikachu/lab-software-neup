import { Component, signal, computed } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';

type AuthMode = 'login' | 'register';

@Component({
  selector: 'app-login-and-register',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './login-and-register.html',
  styleUrl: './login-and-register.scss',
})
export class LoginAndRegister {

  readonly mode = signal<AuthMode>('login');
  readonly isLogin = computed(() => this.mode() === 'login');
  readonly isRegister = computed(() => this.mode() === 'register');

  cargando = false;
  errorMensaje = '';
  exitoMensaje = '';

  loginForm: FormGroup;
  registerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      usuario:  ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.registerForm = this.fb.group({
      usuario:  ['', [Validators.required, Validators.minLength(3)]],
      email:    ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      terminos: [false, Validators.requiredTrue]
    });
  }

  setMode(newMode: AuthMode): void {
    this.mode.set(newMode);
    this.limpiarMensajes();
  }

  get lUsuario()  { return this.loginForm.get('usuario');  }
  get lPassword() { return this.loginForm.get('password'); }

  get rUsuario()  { return this.registerForm.get('usuario');  }
  get rEmail()    { return this.registerForm.get('email');    }
  get rPassword() { return this.registerForm.get('password'); }
  get rTerminos() { return this.registerForm.get('terminos'); }

  private limpiarMensajes(): void {
    this.errorMensaje = '';
    this.exitoMensaje = '';
  }

  private mostrarError(mensaje: string): void {
    this.errorMensaje = mensaje;
    this.exitoMensaje = '';
    setTimeout(() => this.errorMensaje = '', 3500);
  }

  private mostrarExito(mensaje: string): void {
    this.exitoMensaje = mensaje;
    this.errorMensaje = '';
    setTimeout(() => this.exitoMensaje = '', 3500);
  }

  // ── Login ────────────────────────────────────────────────
  onLoginSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.cargando = true;
    this.limpiarMensajes();

    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        this.cargando = false;
        if (response.success) {
          this.authService.guardarSesion(response);
          this.router.navigate(['/home']);
        } else {
          this.mostrarError(response.message);
        }
      },
      error: (err) => {
        this.cargando = false;
        this.mostrarError(
          err.status === 401
            ? 'Usuario o contraseña incorrectos'
            : 'Error de conexión. Intenta de nuevo.'
        );
      }
    });
  }

  // ── Registro ─────────────────────────────────────────────
  onRegisterSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.cargando = true;
    this.limpiarMensajes();

    const { terminos, ...datosRegistro } = this.registerForm.value;

    this.authService.registro(datosRegistro).subscribe({
      next: (response) => {
        this.cargando = false;
        if (response.success) {
          this.mostrarExito('¡Registro exitoso! Inicia sesión.');
          this.registerForm.reset();
          setTimeout(() => this.setMode('login'), 1500);
        } else {
          this.mostrarError(response.message);
        }
      },
      error: (err) => {
        this.cargando = false;
        this.mostrarError(
          err.status === 400
            ? 'El usuario o email ya está registrado'
            : 'Error de conexión. Intenta de nuevo.'
        );
      }
    });
  }
}