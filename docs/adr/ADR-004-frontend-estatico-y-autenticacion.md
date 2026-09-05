# ADR-004 — Frontend estático en GitHub Pages, CORS por lista blanca y autenticación Bearer

- **Estado:** aceptada
- **Fecha:** 2026-09-05
- **Ámbito:** backend, seguridad, despliegue
- **Decide:** rol de Backend, Cloud DevOps & Database, en acuerdo con el rol de Frontend

## Contexto

El frontend se despliega en GitHub Pages, que sirve únicamente archivos estáticos por HTTPS bajo el dominio `<org>.github.io`. El backend se despliega aparte, con su propio dominio y su propio certificado. Son dos orígenes distintos.

Las bases exigen una URL de producción activa y un repositorio libre de credenciales expuestas. El sistema tiene además un caso de uso deliberadamente anónimo: el reclutador verifica un certificado sin crear cuenta.

## Decisión

1. **CORS con lista blanca explícita.** `CORS_ORIGINS` enumera los orígenes exactos (dominio de Pages y `http://localhost:5173` para desarrollo). No se usa el comodín `*`.
2. **Autenticación por token en encabezado.** JWT firmado con HS256 en `Authorization: Bearer`. Nada de cookies de sesión, y por tanto `allow_credentials=False`.
3. **Endpoints públicos sin autenticación** para catálogo de retos, certificado por código público, verificación por hash y perfil público. Son la propuesta de valor: validar en un clic sin registro.
4. **La URL del backend se fija antes del primer build del frontend.** Vite congela `VITE_API_URL` en tiempo de compilación; un cambio posterior obliga a reconstruir y volver a desplegar Pages.
5. **Enrutado por fragmento (`HashRouter`) en el frontend.** GitHub Pages devuelve 404 en rutas profundas al recargar. Los enlaces públicos de verificación se abren en frío desde fuera de la aplicación, así que deben resolver siempre.
6. **Ningún secreto en el bundle.** El frontend solo conoce la URL pública del backend. Claves de LLM, secreto de firma y cadena de conexión viven exclusivamente como variables de entorno del backend, con `.env` en `.gitignore` y `.env.example` sin valores reales.

## Consecuencias

**A favor**

- Se evita por completo la superficie de CSRF y las restricciones de cookies entre dominios de los navegadores actuales.
- El frontend es un artefacto estático: despliegue rápido, con timestamp auditable en el workflow de GitHub Actions.
- Los endpoints públicos permiten demostrar la verificación desde cualquier dispositivo del jurado, sin credenciales.

**En contra**

- Un token en almacenamiento del navegador es accesible desde JavaScript. Se acepta para el alcance del MVP; se mitiga con expiración de ocho horas y ausencia de datos sensibles en la carga útil del token.
- Renombrar el repositorio mueve la URL de Pages y rompe la lista blanca de CORS. Por eso el nombre del producto se cierra antes de crear el repositorio.
- El frontend no puede usar renderizado en servidor. Si emplea Next.js, debe ser exportación estática.

## Alternativas descartadas

- **Cookie `HttpOnly` con `SameSite=None; Secure`.** Más segura frente a robo de token, pero exige protección CSRF y tropieza con las restricciones de cookies de terceros de varios navegadores. No compensa en la jornada.
- **Desplegar el frontend junto al backend.** Elimina el problema de orígenes cruzados, pero contradice la decisión ya tomada por el rol de Frontend y añade responsabilidad de servir archivos estáticos al backend.
- **CORS con `*`.** Descartada: penaliza en el criterio de calidad técnica y no aporta nada, ya que los orígenes son conocidos.
