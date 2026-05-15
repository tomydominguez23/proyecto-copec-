import { useState } from "react";

const auto = {
  nombre: "Mazda CX-5 2.0 Skyactiv 2021",
  precio: "$18.990.000",
  km: "42.800 km",
  patente: "LP-KT-58",
  duenos: "1 dueño",
  fechaInspeccion: "15 mayo 2026",
  numeroInforme: "CL-2026-0515-4821",
  puntaje: 87,
  itemsRevisados: 98,
};

const fotos = [
  { label: "Frontal", color: "#0B5FAA", icono: "car-front" },
  { label: "Interior", color: "#1F2937", icono: "seat" },
  { label: "Motor", color: "#7A8799", icono: "engine" },
  { label: "Neumáticos", color: "#2B3440", icono: "wheel" },
  { label: "Chasis inferior", color: "#475569", icono: "chassis" },
  { label: "Tablero", color: "#0F766E", icono: "dashboard" },
];

const informe = [
  {
    categoria: "Motor y transmisión",
    items: [
      { nombre: "Arranque en frío", detalle: "Ralentí y vibraciones", estado: "ok" },
      { nombre: "Fugas de aceite", detalle: "Motor y caja", estado: "ok" },
      { nombre: "Caja automática", detalle: "Cambios y patinaje", estado: "ok" },
      { nombre: "Scanner OBD", detalle: "Códigos activos", estado: "warn" },
    ],
  },
  {
    categoria: "Frenos y suspensión",
    items: [
      { nombre: "Discos delanteros", detalle: "Desgaste medido", estado: "ok" },
      { nombre: "Pastillas traseras", detalle: "30% vida útil restante", estado: "warn" },
      { nombre: "Amortiguadores", detalle: "4 unidades", estado: "ok" },
      { nombre: "Dirección asistida", detalle: "Juego y fugas", estado: "ok" },
    ],
  },
  {
    categoria: "Carrocería",
    items: [
      { nombre: "Pintura exterior", detalle: "Scanner 3D completo", estado: "ok" },
      { nombre: "Techo y puertas", detalle: "Sellos y alineación", estado: "ok" },
      { nombre: "Airbag lateral izquierdo", detalle: "Sistema SRS", estado: "fail" },
    ],
  },
  {
    categoria: "Electricidad",
    items: [
      { nombre: "Batería", detalle: "Capacidad y carga", estado: "ok" },
      { nombre: "Luces y faros", detalle: "Delanteros y traseros", estado: "ok" },
      { nombre: "Climatizador", detalle: "Compresor y distribución", estado: "ok" },
    ],
  },
];

const videos = [
  { titulo: "Arranque en frío", duracion: "1:24", descripcion: "Motor al arrancar" },
  { titulo: "Prueba de frenos", duracion: "0:52", descripcion: "Frenada de emergencia" },
  { titulo: "Revisión chasis inferior", duracion: "2:10", descripcion: "Con cámara endoscópica" },
  { titulo: "Test en ruta", duracion: "3:45", descripcion: "Manejo y respuesta" },
];

const automotora = {
  nombre: "AutoMotora Los Andes",
  ubicacion: "Las Condes, Santiago",
  rating: 4.8,
  autosInspeccionados: 127,
  verificada: true,
};

const tabs = [
  { id: "fotos", label: "Fotos" },
  { id: "informe", label: "Informe" },
  { id: "videos", label: "Videos" },
  { id: "automotora", label: "Automotora" },
];

const estados = {
  ok: ["Óptimo", "Bueno", "Normal"],
  warn: ["Atención"],
  fail: ["Revisar"],
};

function ShieldCheckIcon({ className = "" }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 3 5 6v5.6c0 4.3 2.9 8.2 7 9.4 4.1-1.2 7-5.1 7-9.4V6l-7-3Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="m8.6 12.1 2.1 2.1 4.7-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function QrIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" aria-label="Código QR">
      <rect width="26" height="26" rx="6" fill="none" />
      <path d="M4 4h7v7H4V4Zm2 2v3h3V6H6Zm9-2h7v7h-7V4Zm2 2v3h3V6h-3ZM4 15h7v7H4v-7Zm2 2v3h3v-3H6Zm10-1h2v2h-2v-2Zm4-1h2v3h-2v-3Zm-6 5h4v2h-4v-2Zm6 0h2v2h-2v-2Zm-6-6h2v2h-2v-2Z" />
    </svg>
  );
}

function PhotoIcon({ type }) {
  return (
    <svg className="photo-icon" viewBox="0 0 64 64" aria-hidden="true">
      {type === "car-front" && (
        <>
          <path d="M15 35 20 21h24l5 14v12h-7v-5H22v5h-7V35Z" />
          <path d="M21 35h8m14 0h-8M23 25h18" />
        </>
      )}
      {type === "seat" && (
        <>
          <path d="M23 12h15c3 0 5 2 5 5v23H25l-5-16V15c0-2 1-3 3-3Z" />
          <path d="M23 41h23v8H18v-4c0-2 2-4 5-4Z" />
        </>
      )}
      {type === "engine" && (
        <>
          <path d="M18 25h29v20H18V25Z" />
          <path d="M25 25v-6h14v6M14 31h4m29 3h5M27 45v5h10v-5" />
        </>
      )}
      {type === "wheel" && (
        <>
          <circle cx="32" cy="32" r="20" />
          <circle cx="32" cy="32" r="8" />
          <path d="M32 12v12m0 16v12M12 32h12m16 0h12m-6-14-9 9m-10 10-9 9m28 0-9-9m-10-10-9-9" />
        </>
      )}
      {type === "chassis" && (
        <>
          <path d="M12 38h40M18 29h28l6 9H12l6-9Z" />
          <path d="M22 22h20M24 45h16M18 38v9m28-9v9" />
        </>
      )}
      {type === "dashboard" && (
        <>
          <path d="M14 38c2-12 9-20 18-20s16 8 18 20H14Z" />
          <path d="M32 31 43 24M24 39h16M21 32h5m12 0h5" />
        </>
      )}
    </svg>
  );
}

function Header() {
  return (
    <header className="header">
      <div className="header-top">
        <div>
          <div className="logo">COPEC</div>
          <div className="subtitle">INSPECCIÓN PRECOMPRA</div>
        </div>
        <div className="qr-box">
          <QrIcon />
        </div>
      </div>
      <div className="verified-badge">
        <ShieldCheckIcon />
        <span>Verificado · {auto.fechaInspeccion}</span>
      </div>
    </header>
  );
}

function CarInfoCard() {
  return (
    <section className="car-card elevated-card">
      <div className="car-title-row">
        <h1>{auto.nombre}</h1>
        <strong>{auto.precio}</strong>
      </div>
      <div className="car-stats">
        <Stat label="Kilometraje" value={auto.km} />
        <Stat label="Patente" value={auto.patente} />
        <Stat label="Dueños" value={auto.duenos} />
      </div>
    </section>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function ScoreCard() {
  return (
    <section className="score-card">
      <div>
        <div className="score-main">
          <strong>{auto.puntaje}</strong>
          <span>/100 puntos Copec</span>
        </div>
        <p>Evaluación general del vehículo</p>
      </div>
      <div className="score-side">
        <span className="approved">✓ Aprobado Copec</span>
        <small>{auto.itemsRevisados} ítems revisados</small>
      </div>
    </section>
  );
}

function TabNav({ tabActiva, setTabActiva }) {
  return (
    <nav className="tab-nav" aria-label="Secciones del informe">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={tabActiva === tab.id ? "active" : ""}
          onClick={() => setTabActiva(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}

function TabFotos() {
  return (
    <section className="tab-panel" aria-label="Fotos del vehículo">
      <div className="photos-grid">
        {fotos.map((foto) => (
          <article className="photo-thumb" style={{ backgroundColor: foto.color }} key={foto.label}>
            <PhotoIcon type={foto.icono} />
            <span>{foto.label}</span>
          </article>
        ))}
      </div>
      <button className="outline-button" type="button">
        Ver las {fotos.length} fotos
      </button>
    </section>
  );
}

function TabInforme() {
  let okIndex = 0;

  return (
    <section className="tab-panel report-panel" aria-label="Informe técnico">
      {informe.map((grupo) => (
        <div className="report-section" key={grupo.categoria}>
          <h2>{grupo.categoria}</h2>
          <div className="report-items">
            {grupo.items.map((item) => {
              const textoEstado =
                item.estado === "ok" ? estados.ok[okIndex++ % estados.ok.length] : estados[item.estado][0];

              return (
                <article className="report-item" key={`${grupo.categoria}-${item.nombre}`}>
                  <div>
                    <strong>{item.nombre}</strong>
                    <span>{item.detalle}</span>
                  </div>
                  <span className={`status-chip ${item.estado}`}>{textoEstado}</span>
                </article>
              );
            })}
          </div>
        </div>
      ))}
    </section>
  );
}

function TabVideos() {
  return (
    <section className="tab-panel video-list" aria-label="Videos de inspección">
      {videos.map((video) => (
        <article className="video-card" key={video.titulo}>
          <button className="play-button" type="button" aria-label={`Reproducir ${video.titulo}`}>
            ▶
          </button>
          <div>
            <strong>{video.titulo}</strong>
            <span>
              {video.duracion} · {video.descripcion}
            </span>
          </div>
        </article>
      ))}
    </section>
  );
}

function TabAutomotora() {
  return (
    <section className="tab-panel automotora-card" aria-label="Datos de la automotora">
      <div className="dealer-header">
        <div className="dealer-icon">A</div>
        <div>
          <h2>{automotora.nombre}</h2>
          <p>{automotora.ubicacion}</p>
          {automotora.verificada && <span className="dealer-badge">● Verificado Copec</span>}
        </div>
      </div>
      <div className="dealer-stats">
        <Stat label="Rating Google" value={`${automotora.rating} ★`} />
        <Stat label="Inspeccionados" value={automotora.autosInspeccionados} />
      </div>
      <button className="primary-button" type="button">
        Contactar automotora
      </button>
      <button className="secondary-button" type="button">
        Agendar visita
      </button>
    </section>
  );
}

function CopecSeal() {
  return (
    <aside className="copec-seal">
      <ShieldCheckIcon />
      <p>
        <strong>Informe Copec #{auto.numeroInforme}</strong>
        <span>Inspeccionado por técnico certificado Copec. Válido por 90 días.</span>
      </p>
    </aside>
  );
}

function ActiveTab({ tabActiva }) {
  if (tabActiva === "informe") return <TabInforme />;
  if (tabActiva === "videos") return <TabVideos />;
  if (tabActiva === "automotora") return <TabAutomotora />;

  return <TabFotos />;
}

export default function App() {
  const [tabActiva, setTabActiva] = useState("fotos");

  return (
    <main className="app-shell">
      <div
        className="mobile-frame"
        style={{
          width: 340,
          minHeight: 680,
          border: "2.5px solid #D1D5DB",
          borderRadius: 36,
          overflow: "hidden",
          margin: "0 auto",
          background: "#F4F6F9",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div className="notch-bar">
          <div />
        </div>

        <div className="phone-content">
          <Header />
          <div className="content-stack">
            <CarInfoCard />
            <ScoreCard />
            <TabNav tabActiva={tabActiva} setTabActiva={setTabActiva} />
            <ActiveTab tabActiva={tabActiva} />
            <CopecSeal />
          </div>
        </div>
      </div>
    </main>
  );
}
