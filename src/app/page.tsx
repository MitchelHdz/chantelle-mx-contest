import Image from "next/image";

import { RegistrationForm } from "@/components/registration-form";
import { StructuredData } from "@/components/structured-data";

export default function Home() {
  return (
    <main className="campaign-page">
      <StructuredData />
      <header className="site-header">
        <a className="brand-lockup" href="#inicio" aria-label="Chantelle y El Palacio de Hierro, inicio">
          <Image className="brand-lockup__chantelle" src="/brand/chantelle.svg" alt="Chantelle" width={280} height={34} priority />
          <span aria-hidden="true">×</span>
          <Image className="brand-lockup__palacio" src="/brand/el-palacio-de-hierro.png" alt="El Palacio de Hierro" width={240} height={240} priority />
        </a>
      </header>

      <section id="inicio" className="hero">
        <div className="hero__content">
          <h1>Chantelle te lleva a París</h1>
          <p className="hero__lead">
            Registra tu compra Chantelle en El Palacio de Hierro y participa por una experiencia en París.
          </p>
          <a className="button" href="#registro">Registrar mi compra</a>
        </div>
        <div className="hero__image">
          <Image
            src="/images/paris-editorial.jpg"
            alt="Vista de París en blanco y negro"
            fill
            priority
            sizes="(max-width: 767px) 100vw, 50vw"
          />
        </div>
      </section>

      <section className="mechanics" aria-labelledby="mecanica-title">
        <div>
          <h2 id="mecanica-title">Participar es muy sencillo</h2>
        </div>
        <ol>
          <li><strong>Completa tus datos</strong><p>Escribe los datos que usaste al hacer tu compra.</p></li>
          <li><strong>Sube tu ticket</strong><p>El número debe verse claro en la foto.</p></li>
          <li><strong>Guarda tu folio</strong><p>Al terminar verás el número de tu participación.</p></li>
        </ol>
      </section>

      <section id="registro" className="registration-section">
        <div className="registration-section__intro">
          <h2>Registra tu compra</h2>
          <p>Ten a la mano tu ticket. Completar el formulario toma pocos minutos.</p>
          <div className="privacy-note">
            <strong>Tu información se resguarda.</strong>
            <p>La foto del ticket es privada y tus datos se usan sólo para esta promoción.</p>
          </div>
        </div>
        <div className="registration-section__form">
          <RegistrationForm />
        </div>
      </section>

      <section className="editorial-close">
        <Image
          src="/images/editorial-still-life.jpg"
          alt="Detalle editorial de producto Chantelle"
          fill
          sizes="100vw"
        />
        <p>Celebrando 150 años</p>
      </section>

      <footer>
        <span>© {new Date().getFullYear()} Chantelle y El Palacio de Hierro</span>
        <nav aria-label="Legal">
          <a href="/bases">Bases</a>
          <a href="/privacidad">Privacidad</a>
        </nav>
      </footer>
    </main>
  );
}
