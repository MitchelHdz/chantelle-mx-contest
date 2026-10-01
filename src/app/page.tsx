import Image from "next/image";
import { connection } from "next/server";

import { RegistrationForm } from "@/components/registration-form";
import { StructuredData } from "@/components/structured-data";
import { isRegistrationClosed } from "@/lib/config/campaign";

export default async function Home() {
  await connection();
  const registrationClosed = isRegistrationClosed();

  return (
    <main className="campaign-page">
      <StructuredData />
      <header className="site-header">
        <a className="brand-lockup" href="#inicio" aria-label="Chantelle y El Palacio de Hierro, inicio">
          <Image className="brand-lockup__chantelle" src="/brand/chantelle.svg" alt="Chantelle" width={280} height={34} priority />
          <span aria-hidden="true">×</span>
          <span className="brand-lockup__palacio-frame">
            <Image className="brand-lockup__palacio" src="/brand/el-palacio-de-hierro.png" alt="El Palacio de Hierro" width={240} height={240} priority />
          </span>
        </a>
      </header>

      <section id="inicio" className="hero">
        <div className="hero__content">
          <h1>Chantelle te lleva a París</h1>
          <p className="hero__lead">
            {registrationClosed
              ? "El registro ha cerrado. El sorteo tendrá lugar el 23 de noviembre."
              : "Registra tu compra Chantelle en El Palacio de Hierro y participa por una experiencia en París."}
          </p>
          {!registrationClosed && <a className="button" href="#registro">Registrar mi compra</a>}
        </div>
        <div className="hero__image">
          <Image
            src="/images/chantelle-night-editorial.jpg"
            alt="Modelo Chantelle con lencería negra frente a un muro de madera"
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
          <li><strong>Sube tu ticket</strong><p>Asegúrate de que tu ticket se vea claro en la foto.</p></li>
          <li><strong>Espera los resultados</strong><p>Conserva tu ticket físico; nos pondremos en contacto únicamente con la persona ganadora.</p></li>
        </ol>
      </section>

      <section className="paris-moment" aria-label="La experiencia en París">
        <Image
          src="/images/paris-alexandre-iii.jpg"
          alt="Puente Alejandro III iluminado al atardecer en París"
          fill
          sizes="(max-width: 767px) 100vw, (max-width: 1216px) 100vw, 1216px"
        />
        <p>Una experiencia inspirada en París.</p>
      </section>

      <section id="registro" className="registration-section">
        <div className="registration-section__intro">
          <h2>{registrationClosed ? "Registro cerrado" : "Registra tu compra"}</h2>
          {registrationClosed ? (
            <p>El registro cerró el 15 de noviembre a las 23:59 h. El sorteo tendrá lugar el 23 de noviembre.</p>
          ) : (
            <p>Regístrate hasta el 15 de noviembre a las 23:59 h (hora de la Ciudad de México). El sorteo tendrá lugar el 23 de noviembre. Ten a la mano tu ticket.</p>
          )}
          {!registrationClosed && (
            <div className="privacy-note">
              <strong>Tu información se resguarda.</strong>
              <p>La foto del ticket es privada.</p>
            </div>
          )}
        </div>
        <div className="registration-section__form">
          {registrationClosed ? null : <RegistrationForm />}
        </div>
      </section>

      <section className="editorial-close">
        <Image
          src="/images/chantelle-gold-editorial.jpg"
          alt="Modelo de la campaña Chantelle frente a un fondo dorado"
          fill
          sizes="(max-width: 1216px) 100vw, 1216px"
        />
        <p>Celebrando 150 años</p>
      </section>

      <footer>
        <span>© {new Date().getFullYear()} Chantelle y El Palacio de Hierro</span>
        <nav aria-label="Legal">
          <a href="/bases" target="_blank" rel="noopener noreferrer">Bases</a>
          <a href="/privacidad" target="_blank" rel="noopener noreferrer">Privacidad</a>
          <a href="/preferencias-de-medicion">Preferencias de medición</a>
        </nav>
      </footer>
    </main>
  );
}
