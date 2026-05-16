const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { createApp } = require("../server");

async function main() {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "copec-smoke-"));
  const { app, db } = createApp({
    dataDir: path.join(tempDir, "data"),
    uploadDir: path.join(tempDir, "uploads"),
    dbPath: path.join(tempDir, "data", "test.sqlite"),
  });

  const server = app.listen(0);
  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  try {
    const health = await fetch(`${baseUrl}/api/health`).then((res) => res.json());
    assert.strictEqual(health.ok, true);

    const beforeLogin = await fetch(`${baseUrl}/api/auth/me`).then((res) => res.json());
    assert.strictEqual(beforeLogin.authenticated, false);

    const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@copec.cl", password: "Copec123!" }),
    });

    assert.strictEqual(loginResponse.status, 200);
    const cookie = loginResponse.headers.get("set-cookie");
    assert.ok(cookie && cookie.includes("copec_session"));

    const inspection = await fetch(`${baseUrl}/api/inspection/current`).then((res) => res.json());
    assert.strictEqual(inspection.inspection.numero, "CL-2026-0515-4821");
    assert.ok(inspection.estaciones.length >= 4);

    const form = new FormData();
    form.set("tipo", "informe");
    form.set("titulo", "Informe PDF de prueba");
    form.set("descripcion", "Archivo generado por smoke test");
    form.set("archivo", new Blob(["informe de prueba"], { type: "text/plain" }), "informe.txt");

    const uploadResponse = await fetch(`${baseUrl}/api/admin/files`, {
      method: "POST",
      headers: { Cookie: cookie.split(";")[0] },
      body: form,
    });

    assert.strictEqual(uploadResponse.status, 201);
    const uploaded = await uploadResponse.json();
    assert.strictEqual(uploaded.archivo.tipo, "informe");

    const files = await fetch(`${baseUrl}/api/admin/files`, {
      headers: { Cookie: cookie.split(";")[0] },
    }).then((res) => res.json());

    assert.strictEqual(files.archivos.length, 1);
    console.log("Smoke test OK");
  } finally {
    server.close();
    db.close();
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
