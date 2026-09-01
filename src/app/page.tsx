import Image from "next/image";

import { RegistrationForm } from "@/components/registration-form";

export default function Home() {
  return (
    <main>
      <header className="site-header">
        <a className="wordmark" href="#inicio" aria-label="Chantelle, inicio">
          CHANTELLE
        </a>
        <span>Paris depuis 1876</span>
      </header>

      <section id="inicio" className="hero">
        <div className="hero__image">
          <Image
            src="/images/paris-editorial.jpg"
            alt="Vista editorial de París en blanco y negro"
            fill
            priority
            sizes="(max-width: 860px) 100vw, 52vw"
          />
        </div>
        <div className="hero__content">
          <p className="eyebrow">Chantelle × El Palacio de Hierro</p>
          <h1>Vive París</h1>
          <p className="hero__lead">
            Registra tu compra, sube una foto de tu ticket y recibe un folio para participar por una experiencia en París.
          </p>
          <a className="button" href="#registro">Registrar mi compra</a>
        </div>
      </section>

      <section className="mechanics" aria-labelledby="mecanica-title">
        <div>
          <p className="eyebrow">Una participación clara</p>
          <h2 id="mecanica-title">Tres pasos y tu folio queda listo</h2>
        </div>
        <ol>
          <li><span>01</span><strong>Completa tus datos</strong><p>Usa el mismo nombre y contacto que quieres asociar a tu participación.</p></li>
          <li><span>02</span><strong>Sube tu ticket</strong><p>La imagen viaja directamente al almacenamiento privado y no atraviesa nuestro servidor.</p></li>
          <li><span>03</span><strong>Recibe tu folio</strong><p>Validamos el registro y te mostramos una confirmación inmediata.</p></li>
        </ol>
      </section>

      <section id="registro" className="registration-section">
        <div className="registration-section__intro">
          <p className="eyebrow">Registro</p>
          <h2>Tu compra puede llevarte más lejos</h2>
          <p>Ten a la mano tu ticket de compra. El registro toma cerca de dos minutos.</p>
          <div className="privacy-note">
            <strong>Tu información se trata con cuidado.</strong>
            <p>La foto queda privada y los datos solo se usan para operar esta promoción.</p>
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
        <p>Parisian confidence, desde 1876.</p>
      </section>

      <footer>
        <span>© {new Date().getFullYear()} Chantelle</span>
        <nav aria-label="Legal">
          <a href="/bases">Bases</a>
          <a href="/privacidad">Privacidad</a>
        </nav>
      </footer>
    </main>
  );
}
