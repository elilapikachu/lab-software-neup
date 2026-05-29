import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Navbar } from '../../layout/navbar/navbar';
import { Footer } from '../../layout/footer/footer';
import { AlertService } from '../../services/alert';
import { CorreoService } from '../../services/correo.service';

@Component({
  selector: 'app-aboutus',
  standalone: true,
  imports: [RouterLink, Navbar, Footer, ReactiveFormsModule, CommonModule],
  templateUrl: './aboutus.html',
  styleUrl: './aboutus.scss',
})
export class Aboutus {
  private alertService = inject(AlertService);
  private correoService = inject(CorreoService);
  private fb = inject(FormBuilder);

  cargando = false;
  showConfirmModal = false;

  contactForm: FormGroup = this.fb.group({
    email:   ['', [Validators.required, Validators.email]],
    nombre:  ['', [Validators.required, Validators.minLength(2)]],
    asunto:  ['', [Validators.required, Validators.minLength(3)]],
    mensaje: ['', [Validators.required, Validators.minLength(10)]],
  });

  get fEmail()   { return this.contactForm.get('email');   }
  get fNombre()  { return this.contactForm.get('nombre');  }
  get fAsunto()  { return this.contactForm.get('asunto');  }
  get fMensaje() { return this.contactForm.get('mensaje'); }

  onEnviarMensaje(): void {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }
    this.showConfirmModal = true;
  }

  onCancelarEnvio(): void {
    this.showConfirmModal = false;
  }

  onConfirmarEnvio(): void {
    this.showConfirmModal = false;
    this.cargando = true;

    this.correoService.enviarContacto(this.contactForm.value).subscribe({
      next: () => {
        this.cargando = false;
        this.alertService.success(
          '¡Mensaje enviado! Te responderemos en las próximas 24-48 horas.',
          { dismissible: true, autoDismiss: 5000 }
        );
        this.contactForm.reset();
      },
      error: () => {
        this.cargando = false;
        this.alertService.danger(
          'Error al enviar el mensaje. Intenta de nuevo.',
          { dismissible: true, autoDismiss: 4000 }
        );
      }
    });
  }
}
