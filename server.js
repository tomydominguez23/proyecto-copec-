const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const express = require("express");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const bcrypt = require("bcryptjs");
const Database = require("better-sqlite3");

const SESSION_COOKIE = "copec_session";
const DEFAULT_ADMIN_EMAIL = "admin@copec.cl";
const DEFAULT_ADMIN_PASSWORD = "Copec123!";
const SESSION_DAYS = 7;

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function normalizeFileRow(row) {
  return {
    id: row.id,
    tipo: row.type,
    titulo: row.title,
    descripcion: row.description,
    nombreOriginal: row.original_name,
    mimeType: row.mime_type,
    tamano: row.size,
    url: row.url,
    fechaCreacion: row.created_at,
  };
}

function initializeDatabase(db, adminEmail, adminPassword) {
  db.pragma("foreign_keys = ON");

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token_hash TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS inspections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      numero TEXT NOT NULL UNIQUE,
      vehicle_name TEXT NOT NULL,
      plate TEXT NOT NULL,
      price TEXT NOT NULL,
      mileage TEXT NOT NULL,
      owners TEXT NOT NULL,
      score INTEGER NOT NULL,
      items_checked INTEGER NOT NULL,
      inspection_date TEXT NOT NULL,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS stations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      comuna TEXT NOT NULL,
      direccion TEXT NOT NULL,
      distancia TEXT NOT NULL,
      horario TEXT NOT NULL,
      cupos TEXT NOT NULL,
      disponibilidad TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS inspection_files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      inspection_id INTEGER NOT NULL,
      uploaded_by INTEGER,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      stored_name TEXT NOT NULL,
      original_name TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      size INTEGER NOT NULL,
      url TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (inspection_id) REFERENCES inspections(id) ON DELETE CASCADE,
      FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
    );
  `);

  const adminExists = db.prepare("SELECT id FROM users WHERE email = ?").get(adminEmail);

  if (!adminExists) {
    db.prepare(
      "INSERT INTO users (email, name, role, password_hash) VALUES (?, ?, 'admin', ?)",
    ).run(adminEmail, "Administrador Copec", bcrypt.hashSync(adminPassword, 12));
  }

  const inspectionExists = db.prepare("SELECT id FROM inspections WHERE numero = ?").get("CL-2026-0515-4821");

  if (!inspectionExists) {
    db.prepare(`
      INSERT INTO inspections (
        numero, vehicle_name, plate, price, mileage, owners, score, items_checked, inspection_date, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      "CL-2026-0515-4821",
      "Mazda CX-5 2.0 Skyactiv 2021",
      "LP-KT-58",
      "$18.990.000",
      "42.800 km",
      "1 dueño",
      87,
      98,
      "15 mayo 2026",
      "Aprobado Copec",
    );
  }

  const stationCount = db.prepare("SELECT COUNT(*) AS count FROM stations").get().count;

  if (stationCount === 0) {
    const insertStation = db.prepare(`
      INSERT INTO stations (name, comuna, direccion, distancia, horario, cupos, disponibilidad)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    [
      ["Copec Los Dominicos", "Las Condes", "Av. Padre Hurtado Sur 875", "2,4 km", "Lun a sáb · 09:00 a 18:30", "3 cupos hoy", "Disponible"],
      ["Copec Vitacura Kennedy", "Vitacura", "Av. Kennedy 5601", "4,1 km", "Lun a vie · 08:30 a 18:00", "Próximo cupo 10:30", "Disponible"],
      ["Copec Príncipe de Gales", "La Reina", "Av. Príncipe de Gales 6850", "5,7 km", "Lun a sáb · 09:30 a 17:30", "2 cupos mañana", "Disponible"],
      ["Copec Manquehue Sur", "Las Condes", "Manquehue Sur 1230", "3,8 km", "Lun a vie · 09:00 a 19:00", "Agenda semanal", "Alta demanda"],
    ].forEach((station) => insertStation.run(...station));
  }
}

function createApp(options = {}) {
  const rootDir = options.rootDir || __dirname;
  const dataDir = options.dataDir || path.join(rootDir, "data");
  const uploadDir = options.uploadDir || path.join(rootDir, "uploads");
  const dbPath = options.dbPath || path.join(dataDir, "copec.sqlite");
  const adminEmail = String(process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL).trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD;

  ensureDir(dataDir);
  ensureDir(uploadDir);

  const db = new Database(dbPath);
  initializeDatabase(db, adminEmail, adminPassword);

  const app = express();
  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${ext}`);
    },
  });
  const upload = multer({
    storage,
    limits: { fileSize: 250 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      const allowed = [
        "application/pdf",
        "application/json",
        "image/jpeg",
        "image/png",
        "image/webp",
        "text/plain",
        "video/mp4",
        "video/quicktime",
        "video/webm",
      ];

      cb(null, allowed.includes(file.mimetype));
    },
  });

  app.use(express.json({ limit: "2mb" }));
  app.use(cookieParser());
  app.use("/uploads", express.static(uploadDir));

  function setSessionCookie(res, token, expiresAt) {
    res.cookie(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      expires: expiresAt,
    });
  }

  function clearSessionCookie(res) {
    res.clearCookie(SESSION_COOKIE, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  }

  function getUserFromRequest(req) {
    const token = req.cookies[SESSION_COOKIE];

    if (!token) return null;

    const session = db
      .prepare(
        `SELECT users.id, users.email, users.name, users.role, sessions.expires_at
         FROM sessions
         JOIN users ON users.id = sessions.user_id
         WHERE sessions.token_hash = ?`,
      )
      .get(hashToken(token));

    if (!session) return null;

    if (new Date(session.expires_at).getTime() <= Date.now()) {
      db.prepare("DELETE FROM sessions WHERE token_hash = ?").run(hashToken(token));
      return null;
    }

    return {
      id: session.id,
      email: session.email,
      name: session.name,
      role: session.role,
    };
  }

  function requireAuth(req, res, next) {
    const user = getUserFromRequest(req);

    if (!user) {
      res.status(401).json({ error: "Debes iniciar sesión para realizar esta acción." });
      return;
    }

    req.user = user;
    next();
  }

  function getCurrentInspection() {
    return db.prepare("SELECT * FROM inspections ORDER BY id LIMIT 1").get();
  }

  function getFilesForInspection(inspectionId) {
    return db
      .prepare("SELECT * FROM inspection_files WHERE inspection_id = ? ORDER BY created_at DESC, id DESC")
      .all(inspectionId)
      .map(normalizeFileRow);
  }

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, database: "sqlite", uploads: true });
  });

  app.get("/api/auth/me", (req, res) => {
    const user = getUserFromRequest(req);
    res.json({ authenticated: Boolean(user), user });
  });

  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(String(email || "").trim().toLowerCase());

    if (!user || !bcrypt.compareSync(String(password || ""), user.password_hash)) {
      res.status(401).json({ error: "Correo o contraseña incorrectos." });
      return;
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

    db.prepare("INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)").run(
      hashToken(token),
      user.id,
      expiresAt.toISOString(),
    );

    setSessionCookie(res, token, expiresAt);
    res.json({
      authenticated: true,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  });

  app.post("/api/auth/logout", requireAuth, (req, res) => {
    const token = req.cookies[SESSION_COOKIE];
    db.prepare("DELETE FROM sessions WHERE token_hash = ?").run(hashToken(token));
    clearSessionCookie(res);
    res.json({ ok: true });
  });

  app.get("/api/inspection/current", (_req, res) => {
    const inspection = getCurrentInspection();
    const stations = db.prepare("SELECT * FROM stations ORDER BY id").all();

    res.json({
      inspection: {
        numero: inspection.numero,
        nombreAuto: inspection.vehicle_name,
        patente: inspection.plate,
        precio: inspection.price,
        km: inspection.mileage,
        duenos: inspection.owners,
        puntaje: inspection.score,
        itemsRevisados: inspection.items_checked,
        fechaInspeccion: inspection.inspection_date,
        estado: inspection.status,
      },
      estaciones: stations.map((station) => ({
        id: station.id,
        nombre: station.name,
        comuna: station.comuna,
        direccion: station.direccion,
        distancia: station.distancia,
        horario: station.horario,
        cupos: station.cupos,
        disponibilidad: station.disponibilidad,
      })),
      archivos: getFilesForInspection(inspection.id),
    });
  });

  app.get("/api/admin/files", requireAuth, (_req, res) => {
    const inspection = getCurrentInspection();
    res.json({ archivos: getFilesForInspection(inspection.id) });
  });

  app.post("/api/admin/files", requireAuth, upload.single("archivo"), (req, res) => {
    if (!req.file) {
      res.status(400).json({ error: "Debes seleccionar un archivo válido." });
      return;
    }

    const inspection = getCurrentInspection();
    const type = String(req.body.tipo || "documento").trim().toLowerCase();
    const title = String(req.body.titulo || req.file.originalname).trim();
    const description = String(req.body.descripcion || "").trim();
    const url = `/uploads/${req.file.filename}`;

    const result = db
      .prepare(
        `INSERT INTO inspection_files (
          inspection_id, uploaded_by, type, title, description, stored_name, original_name, mime_type, size, url
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        inspection.id,
        req.user.id,
        type,
        title,
        description,
        req.file.filename,
        req.file.originalname,
        req.file.mimetype,
        req.file.size,
        url,
      );

    const file = db.prepare("SELECT * FROM inspection_files WHERE id = ?").get(result.lastInsertRowid);
    res.status(201).json({ archivo: normalizeFileRow(file) });
  });

  app.delete("/api/admin/files/:id", requireAuth, (req, res) => {
    const file = db.prepare("SELECT * FROM inspection_files WHERE id = ?").get(req.params.id);

    if (!file) {
      res.status(404).json({ error: "Archivo no encontrado." });
      return;
    }

    db.prepare("DELETE FROM inspection_files WHERE id = ?").run(file.id);

    const filePath = path.join(uploadDir, file.stored_name);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({ ok: true });
  });

  app.get("/", (_req, res) => {
    res.sendFile(path.join(rootDir, "index.html"));
  });

  app.get("/index.html", (_req, res) => {
    res.sendFile(path.join(rootDir, "index.html"));
  });

  return { app, db };
}

function start() {
  const { app } = createApp();
  const port = Number(process.env.PORT || 3000);

  app.listen(port, () => {
    console.log(`Servidor Copec escuchando en http://localhost:${port}`);
    console.log(`Admin inicial: ${process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL}`);
  });
}

if (require.main === module) {
  start();
}

module.exports = { createApp };
