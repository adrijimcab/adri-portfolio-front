import type { OnInit } from '@angular/core';
import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { SeoService } from '../../core/services/seo.service';
import { SectionHeaderComponent } from '../../shared/components/section-header/section-header.component';
import { ScrollAnimateDirective } from '../../shared/directives/scroll-animate.directive';

@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [SectionHeaderComponent, ScrollAnimateDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen pt-24 px-6">
      <div class="mx-auto max-w-3xl">
        <app-section-header title="Política de Privacidad" label="Legal" />

        <div
          class="prose prose-invert max-w-none space-y-6 text-white/70 leading-relaxed"
          appScrollAnimate
        >
          <p><strong>Última actualización:</strong> 10 de abril de 2026</p>

          <h2 class="text-lg font-semibold text-white">1. Responsable del tratamiento</h2>
          <p>
            Adrián Jiménez Cabello<br />
            Email: adrian.jimenez.cab&#64;hotmail.com<br />
            Sitio web: adrianjimenezcabello.dev
          </p>

          <h2 class="text-lg font-semibold text-white">2. Datos que recopilamos</h2>
          <p>Este sitio web recopila los siguientes datos:</p>
          <ul class="list-disc pl-6 space-y-1">
            <li>
              <strong>Formulario de contacto:</strong> nombre, email y mensaje que proporcionas
              voluntariamente.
            </li>
            <li>
              <strong>Libro de visitas:</strong> nombre de usuario y avatar de GitHub (vía OAuth).
            </li>
            <li><strong>Cookies técnicas:</strong> preferencia de tema (claro/oscuro) e idioma.</li>
            <li>
              <strong>Publicidad:</strong> Google AdSense puede utilizar cookies para mostrar
              anuncios personalizados.
            </li>
          </ul>

          <h2 class="text-lg font-semibold text-white">
            3. Google AdSense y cookies publicitarias
          </h2>
          <p>
            Este sitio utiliza Google AdSense para mostrar anuncios. Google puede utilizar cookies
            (como la cookie DART) para personalizar los anuncios en función de tus visitas a este y
            otros sitios web. Puedes inhabilitar el uso de la cookie DART visitando la
            <a
              href="https://www.google.com/settings/ads"
              target="_blank"
              rel="noopener noreferrer"
              class="text-indigo-400 hover:underline"
            >
              configuración de anuncios de Google </a
            >.
          </p>
          <p>
            Proveedores de publicidad externos, incluido Google, utilizan cookies para mostrar
            anuncios en función de las visitas previas del usuario a este sitio u otros sitios web.
            Puedes inhabilitar las cookies de publicidad personalizada en
            <a
              href="https://www.aboutads.info/choices/"
              target="_blank"
              rel="noopener noreferrer"
              class="text-indigo-400 hover:underline"
            >
              aboutads.info </a
            >.
          </p>

          <h2 class="text-lg font-semibold text-white">4. Finalidad del tratamiento</h2>
          <ul class="list-disc pl-6 space-y-1">
            <li>Responder a consultas enviadas por el formulario de contacto.</li>
            <li>Permitir la firma del libro de visitas.</li>
            <li>Mejorar la experiencia de usuario (tema e idioma).</li>
            <li>Mostrar publicidad relevante mediante Google AdSense.</li>
          </ul>

          <h2 class="text-lg font-semibold text-white">5. Base legal</h2>
          <p>
            El tratamiento de datos se basa en el consentimiento del usuario al enviar el formulario
            de contacto o firmar el libro de visitas, y en el interés legítimo para las cookies
            técnicas esenciales.
          </p>

          <h2 class="text-lg font-semibold text-white">6. Derechos del usuario</h2>
          <p>
            Puedes ejercer tus derechos de acceso, rectificación, supresión, limitación del
            tratamiento y portabilidad escribiendo a adrian.jimenez.cab&#64;hotmail.com.
          </p>

          <h2 class="text-lg font-semibold text-white">7. Seguridad</h2>
          <p>
            Implementamos medidas de seguridad técnicas y organizativas para proteger tus datos,
            incluyendo HTTPS, cabeceras de seguridad (HSTS, CSP, X-Frame-Options) y cifrado de datos
            en tránsito y reposo.
          </p>

          <h2 class="text-lg font-semibold text-white">8. Cambios en esta política</h2>
          <p>
            Nos reservamos el derecho de modificar esta política. Cualquier cambio será publicado en
            esta página con la fecha de actualización.
          </p>
        </div>
      </div>
    </div>
  `,
})
export class PrivacyComponent implements OnInit {
  private readonly seo = inject(SeoService);

  ngOnInit() {
    this.seo.updateMeta({
      title: 'Política de Privacidad — Adrián Jiménez Cabello',
      description:
        'Política de privacidad del portfolio de Adrián Jiménez Cabello. Información sobre cookies, Google AdSense y derechos del usuario.',
      url: 'https://adrianjimenezcabello.dev/privacy',
      type: 'website',
    });
    this.seo.setBreadcrumbList([
      { name: 'Home', url: 'https://adrianjimenezcabello.dev/' },
      { name: 'Política de Privacidad', url: 'https://adrianjimenezcabello.dev/privacy' },
    ]);
  }
}
