# Flujo de trabajo con Git para el equipo

Destino sugerido en el repositorio: `/docs/flujo-git.md`.
Escrito para ejecutarse tal cual durante la jornada, sin conocimiento previo de ramas ni pull requests.

---

## Por qué esto cuenta para la nota

El criterio de Ingeniería de Software y Calidad Técnica (30%) evalúa "estructura del código en el repositorio de GitHub". Un repositorio con un solo commit de 4.000 líneas y un solo autor no muestra proceso; uno con ramas por módulo, pull requests revisados y cuatro autores distintos sí. Cuesta unos veinte minutos repartidos en toda la jornada.

Una condición previa, sin la que nada de esto vale: **cada persona hace sus propios commits desde su propia cuenta**. Nada de commits a nombre de otro ni de fechas retocadas. Lo que demuestra trabajo en equipo es que el trabajo ocurra en equipo; el historial solo lo registra.

---

## Antes de las 09:00 — preparación (20 minutos, una sola vez)

### 1. Crear el repositorio (lo hace una sola persona)

En GitHub: repositorio nuevo, **público**, sin README (el esqueleto ya trae uno). Nombre en minúsculas y con guiones, igual al nombre del producto ya decidido.

Después, Settings → Collaborators → añadir a los otros tres con permiso **Write**. Que los tres acepten la invitación por correo antes de las 09:00: si alguien no la acepta, no puede hacer push y lo descubrirá a las 10:30.

### 2. Cada integrante configura su identidad (los cuatro, en su propia laptop)

Es el paso que más se salta y el que rompe la evidencia de autoría. Si el correo no coincide con el de la cuenta de GitHub, los commits aparecen como de un fantasma sin foto y no cuentan como contribución.

```bash
git config --global user.name "Brian Alessandro Jara Ysidro"
git config --global user.email "el-correo-de-tu-cuenta-de-github@ejemplo.com"

# comprobar que quedó bien
git config --global --get user.email
```

El correo tiene que ser uno de los que figuran en <https://github.com/settings/emails>.

### 3. Subir el esqueleto

Desde la carpeta del esqueleto, en la laptop de quien creó el repositorio:

```bash
git init -b main
git add .
git commit -m "chore: esqueleto del proyecto, configuracion y suite de pruebas base"
git remote add origin https://github.com/<ORG>/<REPO>.git
git push -u origin main
```

### 4. Los otros tres clonan

```bash
git clone https://github.com/<ORG>/<REPO>.git
cd <REPO>
```

### 5. Qué NO activar

En Settings → Branches, **no** poner reglas de protección que exijan aprobaciones obligatorias. A las 16:25, con el reloj encima, una regla que bloquea el merge hasta que alguien apruebe se convierte en un problema en lugar de una garantía. La disciplina de pull request se sostiene por acuerdo, no por candado.

---

## El modelo de ramas

Solo dos niveles. Nada de `develop`, `release` ni `gitflow`: en siete horas eso solo genera merges que nadie necesita.

```
main ─────●─────────●──────────●───────────●────────●──── (siempre desplegable)
           \       /  \       /  \        /
            ●──●──●    ●──●──●    ●──●──●
         feat/auth   feat/catalogo  feat/entregas
```

**Regla de oro:** una rama por módulo, y la rama vive **menos de dos horas**. Una rama que sobrevive media jornada acumula conflictos que se pagan justo cuando no hay tiempo.

### Nombres de rama

```
feat/backend-auth
feat/backend-catalogo
feat/backend-entregas
feat/frontend-catalogo
feat/qa-tests-entregas
fix/cors-origen-pages
docs/adr-evaluador
```

Formato: `<tipo>/<area>-<detalle-corto>`. Tipos: `feat`, `fix`, `docs`, `chore`, `test`.

---

## Mensajes de commit

Se usa Conventional Commits. Es una convención real de la industria, se lee sola y ordena el historial sin esfuerzo.

```
<tipo>(<alcance>): <que hace, en imperativo y en minusculas>
```

Ejemplos reales para lo que toca hoy:

```
feat(auth): registro, login y emision de token JWT
feat(catalogo): listado y detalle de retos con filtros
feat(entregas): envio de solucion con respuesta 202 y evaluacion en segundo plano
feat(certificacion): emision de certificado con hash encadenado
fix(cors): agregar el origen de GitHub Pages a la lista blanca
test(entregas): casos de error critico del envio de solucion
docs(adr): decision sobre el evaluador conmutable
chore(deploy): dockerfile y variables de entorno para el PaaS
```

Tipos disponibles: `feat` (funcionalidad nueva), `fix` (corrección), `docs`, `test`, `refactor`, `chore` (configuración, dependencias, despliegue).

**Cadencia de commits.** Uno por unidad que funcione, no uno por hora ni uno por archivo. Referencia práctica: entre seis y doce commits por persona a lo largo del día. Si algo lleva cuarenta minutos sin un commit, casi seguro que dentro había dos commits.

---

## El ciclo completo, paso a paso

Es el mismo bucle todo el día. Ejemplo con el módulo de autenticación.

### Paso 1 — partir de `main` actualizado

```bash
git checkout main
git pull origin main
```

Siempre. Empezar una rama desde un `main` viejo es la causa número uno de conflictos.

### Paso 2 — crear la rama

```bash
git checkout -b feat/backend-auth
```

### Paso 3 — trabajar y hacer commits pequeños

```bash
git add app/api/v1/auth.py app/schemas/auth.py
git commit -m "feat(auth): esquemas de registro y login"

# ... más trabajo ...
git add app/core/security.py
git commit -m "feat(auth): hash de contrasena y emision de token"
```

`git add .` añade todo lo que haya cambiado. Es cómodo, pero mete archivos por accidente. Antes de usarlo, mirar qué va a entrar:

```bash
git status
```

### Paso 4 — subir la rama

```bash
git push -u origin feat/backend-auth
```

La primera vez lleva `-u origin <rama>`; después basta `git push`.

### Paso 5 — abrir el pull request

Al hacer push, GitHub imprime un enlace en la terminal. Abrirlo, o ir a la pestaña **Pull requests → New pull request**.

- **Base:** `main`. **Compare:** la rama.
- **Título:** el mismo formato que un commit, por ejemplo `feat(auth): registro, login y token JWT`.
- **Descripción:** el esqueleto trae plantilla; rellenarla lleva un minuto.
- **Reviewers:** asignar a una persona concreta, no a las tres.

Con GitHub CLI, si está instalado, es más rápido:

```bash
gh pr create --base main --title "feat(auth): registro, login y token JWT" --fill
```

### Paso 6 — revisión

El revisor abre la pestaña **Files changed**, mira el diff y hace una de dos cosas:

- **Review changes → Approve**, con un comentario de una línea.
- **Comment**, si ve algo que arreglar. Nada de `Request changes`: bloquea y hoy no hay tiempo para desbloqueos.

Una revisión de hackatón dura tres o cuatro minutos y busca tres cosas concretas: que no haya credenciales en el diff, que el diff toque solo los archivos anunciados, y que CI esté en verde. No es una auditoría de estilo.

Comentar sobre una línea concreta se hace pulsando el `+` azul al pasar el cursor por esa línea del diff. Eso deja constancia de revisión real, que es exactamente lo que se está evaluando.

### Paso 7 — merge

Botón **Merge pull request**, opción **Squash and merge**. Deja un commit limpio por funcionalidad en `main`. Después, **Delete branch**: no hace falta guardarla.

### Paso 8 — volver a empezar

```bash
git checkout main
git pull origin main
git checkout -b feat/backend-catalogo
```

---

## Cómo evitar conflictos entre cuatro personas

La mejor gestión de conflictos es no tenerlos. Cada rol es dueño de unos archivos y no toca los de otro sin avisar.

| Rol | Archivos propios |
| --- | --- |
| Backend y base de datos | `app/models/`, `app/api/`, `app/schemas/`, `app/services/`, `app/core/`, `seed.py`, `Dockerfile` |
| Frontend | `frontend/` completo |
| QA y testing | `tests/`, `.github/workflows/ci.yml` |
| Team leader | `README.md`, `docs/`, `docs/pitch.pdf` |

Tres archivos son de todos y por eso son los que más conflictos generan: `README.md`, `requirements.txt` y `.env.example`. Acuerdo simple: quien necesite tocarlos lo dice en voz alta, lo hace en un commit propio y lo mergea de inmediato.

Y una regla que ahorra la mitad de los problemas: **el esquema de base de datos se congela a las 11:00**. Después de esa hora, solo columnas nuevas y anulables. Cambiar un nombre de campo a las 14:00 rompe el frontend y el trabajo de QA a la vez.

---

## Cuando algo sale mal

### La rama quedó atrás y el PR dice "conflicts"

```bash
git checkout feat/backend-auth
git fetch origin
git merge origin/main
```

Git marca los conflictos dentro de los archivos así:

```
<<<<<<< HEAD
lo que hay en la rama
=======
lo que hay en main
>>>>>>> origin/main
```

Se edita el archivo dejando la versión correcta y borrando las tres líneas de marcas. Luego:

```bash
git add <archivo-arreglado>
git commit -m "chore: resolver conflicto con main"
git push
```

Se usa `merge`, no `rebase`. El rebase deja un historial más limpio, pero reescribe commits ya publicados y con poca práctica es fácil perder trabajo. Hoy no compensa.

### Se trabajó por error directamente sobre `main`, sin haber hecho push

```bash
git branch feat/backend-auth      # guarda el trabajo en una rama nueva
git reset --hard origin/main      # devuelve main a como estaba
git checkout feat/backend-auth    # sigue trabajando ahi
```

### El último commit tiene un mensaje mal escrito y aún no se ha subido

```bash
git commit --amend -m "feat(auth): mensaje correcto"
```

Solo si **no** se ha hecho push todavía.

### Se subió el `.env` por accidente

Actuar de inmediato: las bases penalizan credenciales expuestas.

```bash
git rm --cached .env
git commit -m "chore: retirar .env del control de versiones"
git push
```

Y después **rotar las claves que estuvieran dentro**, porque siguen en el historial. Regenerar el `JWT_SECRET`, la contraseña de la base de datos y la clave del LLM. El `.gitignore` del esqueleto ya excluye `.env`, así que esto no debería pasar.

### `main` quedó roto y hay que volver atrás

```bash
git checkout main
git pull
git revert <hash-del-commit-malo>
git push
```

`revert` crea un commit que deshace el anterior. No borra historial, y es lo correcto sobre una rama compartida. El hash se saca de `git log --oneline`.

### Panic button

Ver dónde se está y qué hay pendiente:

```bash
git status
git log --oneline --graph --all -15
```

Guardar cambios a medias sin hacer commit, para cambiar de rama:

```bash
git stash          # guarda
git stash pop      # recupera
```

---

## Issues: el otro rastro de trabajo en equipo

Las issues cuestan un minuto y hacen visible el reparto. Antes de las 09:30 conviene abrir entre ocho y doce, una por módulo, y asignarlas.

Título con el mismo formato: `[backend] Autenticacion: registro, login y token`.

Al abrir el PR, poner en la descripción `Closes #7`. GitHub cierra la issue sola al mergear y deja enlazados issue, rama, PR y commits. Eso es exactamente la trazabilidad que un jurado busca cuando abre el repositorio.

Si sobran cinco minutos, la pestaña **Projects** con un tablero de tres columnas (Por hacer / En curso / Hecho) hace el reparto visible de un vistazo. Es opcional.

---

## Los dos Releases

Las bases piden un Release de GitHub con un título exacto en cada hito. No es un tag suelto: es la pestaña **Releases → Draft a new release**.

**12:00 —** título exacto `Arquitectura - [Nombre del Proyecto]`, tag `v0.1.0-arquitectura`, target `main`. En la descripción, enlaces a `README.md` y a `docs/`.

**16:30 —** título exacto `Entrega Final - [Nombre del Proyecto]`, tag `v1.0.0`, target `main`. En la descripción: URL del frontend, URL del backend, cómo correr las pruebas y enlace a `docs/pitch.pdf`.

Publicar el Release exige que `main` esté al día. Conviene tener todos los PR mergeados **quince minutos antes** de cada hito, no en el minuto exacto.

---

## Ritmo sugerido de la jornada

| Hora | Backend | Qué queda en el repositorio |
| --- | --- | --- |
| 09:00 | Push del esqueleto a `main` | Repositorio vivo, CI en verde |
| 09:45 | `chore(deploy)`: despliegue con `/health` | **Requisito eliminatorio cubierto** |
| 10:30 | PR `feat/backend-modelos` | Esquema en `main`, frontend desbloqueado |
| 11:15 | PR `feat/backend-auth` | Autenticación operativa |
| 11:45 | PR `docs/arquitectura-y-adrs` | Listo para el Release de las 12:00 |
| 13:00 | PR `feat/backend-catalogo` | Catálogo con datos sembrados |
| 14:15 | PR `feat/backend-entregas` | Núcleo de la demo |
| 15:15 | PR `feat/backend-certificacion` | Certificado y verificación |
| 15:45 | PR `fix/*` de integración | `main` estable |
| 16:15 | Todo mergeado | **Release final a las 16:30** |

Nueve PR del backend a lo largo del día, cada uno con su rama, su revisión y su merge. Sumados a los de los otros tres roles, el historial muestra un equipo construyendo software, que es justamente lo que se evalúa.

---

## Resumen en una tarjeta

```bash
# empezar algo nuevo
git checkout main && git pull origin main
git checkout -b feat/backend-<modulo>

# trabajar
git status
git add <archivos>
git commit -m "feat(<modulo>): <que hace>"

# subir y abrir PR
git push -u origin feat/backend-<modulo>
#   -> abrir el enlace que imprime la terminal, asignar revisor

# tras el merge
git checkout main && git pull origin main
git branch -d feat/backend-<modulo>
```
