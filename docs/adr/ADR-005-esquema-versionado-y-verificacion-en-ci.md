# ADR-005 — Esquema versionado con Alembic y verificacion automatica en CI

- **Estado:** aceptada
- **Fecha:** 2026-09-05
- **Ambito:** backend, base de datos, integracion continua
- **Decide:** rol de Backend, Cloud DevOps & Database

## Contexto

El esqueleto inicial creaba las tablas al arrancar la aplicacion (`Base.metadata.create_all`).
Funciona la primera vez y falla en silencio despues: si alguien anade una columna a un modelo,
`create_all` no altera la tabla existente, de modo que el entorno desplegado sigue con el esquema
viejo y el error aparece como un fallo de consulta a mitad de la jornada.

El equipo son cuatro personas trabajando en paralelo sobre una base de datos compartida, con dos
hitos de entrega y un esquema que se congela a las 11:00. Un cambio de modelo que no llega al
entorno desplegado bloquea al frontend sin dejar rastro.

## Decision

1. **El esquema lo aplica Alembic**, con una revision inicial versionada en el repositorio. La
   aplicacion ya no crea tablas al arrancar; el contenedor ejecuta `alembic upgrade head` antes de
   servir peticiones.
2. **Las pruebas corren sobre el esquema que produce Alembic**, no sobre `create_all`. Una
   migracion desincronizada de los modelos hace fallar la suite en lugar de aparecer en produccion.
3. **CI verifica que no haya desincronizacion** con `alembic check`, que compara los modelos contra
   el esquema migrado y falla si detecta diferencias sin migrar.
4. **La URL de la base de datos se lee de la variable de entorno**, nunca de `alembic.ini`: la
   misma migracion corre sobre SQLite en local y sobre PostgreSQL en produccion, y no hay
   credenciales en el repositorio.
5. **Solo tipos genericos de SQLAlchemy** (`Uuid`, `JSON`, `String`) en los modelos, de modo que la
   misma definicion compila a DDL de PostgreSQL y de SQLite. Se verifico que las 20 tablas del
   nucleo compilan contra el dialecto de PostgreSQL.

Acompanan a la decision dos comprobaciones mas en CI, por el mismo motivo de coste bajo y senal
alta: `ruff check` (linter) y `ruff format --check` (formato), que corren en cada pull request.

## Consecuencias

**A favor**

- Un cambio de modelo sin su migracion no llega a `main`: lo detiene CI, no el despliegue.
- El entorno local, el de CI y el desplegado aplican exactamente el mismo esquema.
- El historial de migraciones documenta la evolucion del modelo de datos sin esfuerzo adicional.
- Cada pull request muestra checks en verde, lo que hace la revision entre companeros mas rapida.

**En contra**

- Anadir una columna pasa a ser dos pasos: editar el modelo y generar la revision
  (`alembic revision --autogenerate -m "..."`). Son treinta segundos, y es el paso que evita la
  desincronizacion.
- `alembic check` obliga a mantener la migracion al dia; una revision generada a medias rompe CI
  para todo el equipo hasta que se corrija.

## Alternativas descartadas

- **Seguir con `create_all`.** Es mas rapido el primer dia y falla el segundo. Con el esquema
  congelado a las 11:00 y cuatro personas dependiendo de el, el riesgo no compensa.
- **Migraciones escritas a mano en SQL.** Mas control, pero mas lento y sin verificacion
  automatica contra los modelos.
