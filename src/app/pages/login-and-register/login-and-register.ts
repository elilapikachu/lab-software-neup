import { Component, signal, computed, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { AbstractControl, AsyncValidatorFn, FormBuilder, FormGroup, ValidationErrors, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { timer } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { AuthService } from '../../services/auth';
import { AlertService } from '../../services/alert';
type AuthMode = 'login' | 'register' | 'recuperar' | 'cambiar';

@Component({
  selector: 'app-login-and-register',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './login-and-register.html',
  styleUrl: './login-and-register.scss',
})
export class LoginAndRegister {
  private alertService = inject(AlertService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  readonly mode = signal<AuthMode>('login');
  readonly isLogin      = computed(() => this.mode() === 'login');
  readonly isRegister   = computed(() => this.mode() === 'register');
  readonly isRecuperar  = computed(() => this.mode() === 'recuperar');
  readonly isCambiar    = computed(() => this.mode() === 'cambiar');

  cargando = false;
  loginForm: FormGroup;
  registerForm: FormGroup;
  recuperarForm: FormGroup;
  cambiarForm: FormGroup;

  constructor() {
    this.loginForm = this.fb.group({
      usuario:  ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.registerForm = this.fb.group({
      usuario:  ['', [Validators.required, Validators.minLength(3)]],
      email:    ['', [Validators.required, Validators.email], [this.emailExisteValidator()]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });

    this.recuperarForm = this.fb.group({
      usuario: [''],
      email:   ['', [Validators.email]],
    });

    this.cambiarForm = this.fb.group({
      passwordActual:    ['', [Validators.required]],
      nuevaPassword:     ['', [Validators.required, Validators.minLength(8)]],
      confirmarPassword: ['', [Validators.required]],
    }, { validators: this.passwordsCoinciden });
  }

  private emailExisteValidator(): AsyncValidatorFn {
    return (control: AbstractControl) => {
      const email = control.value?.trim() ?? '';
      // Si el formato ya es inválido, dejar que el validador sincrónico lo maneje
      if (!email || control.hasError('email') || control.hasError('required')) {
        return of(null);
      }
      return timer(600).pipe(
        switchMap(() => this.authService.verificarEmail(email)),
        map(res => res.valido ? null : { emailNoExiste: true }),
        catchError(() => of(null)),
      );
    };
  }

  private passwordsCoinciden(group: AbstractControl): ValidationErrors | null {
    const nueva     = group.get('nuevaPassword')?.value;
    const confirmar = group.get('confirmarPassword')?.value;
    return nueva === confirmar ? null : { noCoinciden: true };
  }

  setMode(newMode: AuthMode): void {
    this.mode.set(newMode);
    this.recuperarForm.reset();
    if (newMode !== 'cambiar') this.cambiarForm.reset();
  }

  // ── Login getters ──
  get lUsuario()  { return this.loginForm.get('usuario');  }
  get lPassword() { return this.loginForm.get('password'); }

  // ── Register getters ──
  get rUsuario()  { return this.registerForm.get('usuario');  }
  get rEmail()    { return this.registerForm.get('email');    }
  get rPassword() { return this.registerForm.get('password'); }

  // ── Recuperar getters ──
  get recUsuario() { return this.recuperarForm.get('usuario'); }
  get recEmail()   { return this.recuperarForm.get('email');   }

  // ── Cambiar getters ──
  get cPasswordActual()    { return this.cambiarForm.get('passwordActual');    }
  get cNuevaPassword()     { return this.cambiarForm.get('nuevaPassword');     }
  get cConfirmarPassword() { return this.cambiarForm.get('confirmarPassword'); }

  private mostrarError(mensaje: string): void {
    this.alertService.danger(mensaje, { dismissible: true, autoDismiss: 3500 });
  }

  private mostrarExito(mensaje: string): void {
    this.alertService.success(mensaje, { dismissible: true, autoDismiss: 3500 });
  }

  // ── Exclusividad mutua en el formulario de recuperación ──
  onRecuperarInput(campo: 'usuario' | 'email'): void {
    const otro = campo === 'usuario' ? 'email' : 'usuario';
    const valor = this.recuperarForm.get(campo)?.value ?? '';

    if (valor) {
      this.recuperarForm.get(otro)?.setValue('');
      this.recuperarForm.get(otro)?.disable();
    } else {
      this.recuperarForm.get(otro)?.enable();
    }
  }

  onLoginSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.cargando = true;

    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        this.cargando = false;
        if (response.success) {
          this.authService.guardarSesion(response);

          if (response.passwordTemporal) {
            this.mostrarExito('Ingresaste con una contraseña temporal. Debes cambiarla para continuar.');
            setTimeout(() => this.setMode('cambiar'), 1500);
          } else {
            this.mostrarExito('¡Iniciaste sesión correctamente!');
            setTimeout(() => this.router.navigate(['/home']), 1000);
          }
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

  onRegisterSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.cargando = true;

    this.authService.registro(this.registerForm.value).subscribe({
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

  onRecuperarSubmit(): void {
    const usuario = this.recUsuario?.value?.trim() ?? '';
    const email   = this.recEmail?.value?.trim()   ?? '';

    if (!usuario && !email) {
      this.mostrarError('Ingresa tu usuario o tu email para recuperar la contraseña.');
      return;
    }

    if (email && this.recEmail?.invalid) {
      this.recuperarForm.markAllAsTouched();
      this.mostrarError('El email ingresado no tiene un formato válido.');
      return;
    }

    this.cargando = true;

    this.authService.recuperarPassword({ usuario, email }).subscribe({
      next: () => {
        this.cargando = false;
        this.mostrarExito('Te enviamos una contraseña temporal a tu email. Revisa tu bandeja de entrada.');
        this.recuperarForm.reset();
        setTimeout(() => this.setMode('login'), 3000);
      },
      error: (err) => {
        this.cargando = false;
        this.mostrarError(
          err.status === 404
            ? 'No encontramos ninguna cuenta con esos datos.'
            : 'Error al enviar el correo. Intenta de nuevo.'
        );
      },
    });
  }

  onCambiarSubmit(): void {
    if (this.cambiarForm.invalid) {
      this.cambiarForm.markAllAsTouched();
      return;
    }

    const usuarioId = this.authService.getUsuarioId();
    if (!usuarioId) {
      this.mostrarError('Sesión no encontrada. Vuelve a iniciar sesión.');
      this.setMode('login');
      return;
    }

    this.cargando = true;
    const { passwordActual, nuevaPassword } = this.cambiarForm.value;

    this.authService.cambiarPassword(usuarioId, passwordActual, nuevaPassword).subscribe({
      next: (res) => {
        this.cargando = false;
        if (res.success) {
          this.mostrarExito('¡Contraseña actualizada correctamente! Bienvenido.');
          setTimeout(() => this.router.navigate(['/home']), 1200);
        } else {
          this.mostrarError(res.message);
        }
      },
      error: () => {
        this.cargando = false;
        this.mostrarError('Error al cambiar la contraseña. Intenta de nuevo.');
      }
    });
  }
}
