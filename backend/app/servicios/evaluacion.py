"""ServicioEvaluacion del UML.

Admite una entrega valida, solicita una evaluacion y la procesa con el evaluador. El actor de la
solicitud se valida antes del trabajo asincrono; el procesamiento posterior usa la identidad del
servicio y solicita certificacion al aprobar.
"""

import logging
import uuid

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.core.errors import ErrorDominio
from app.core.logging import evaluacion_id as ctx_evaluacion_id
from app.dominio.enums import (
    CondicionEjecucion,
    Dictamen,
    EstadoEvaluacion,
    OrigenEvento,
    ResultadoOperacion,
)
from app.models import Entrega, EspacioTrabajo, Evaluacion, Participacion, ResultadoPrueba, Usuario
from app.models._base import ahora
from app.servicios import auditoria, certificacion, seguridad
from app.servicios import workspace as servicio_workspace
from app.servicios.puertos import FalloEvaluador
from app.servicios.registro import obtener_evaluador

log = logging.getLogger("evaluacion")


def registrar_entrega(
    db: Session, participacion: Participacion, repositorio: str, commit: str, actor: Usuario
) -> Entrega:
    """RN-PART-03: exige reto habilitado y ausencia de credencial vigente en la participacion."""
    if not participacion.reto.admite_entregas():
        raise ErrorDominio(
            "RETO_NO_ADMITE_ENTREGAS",
            "El reto no admite nuevas entregas.",
            http=409,
            detalles={"estado": participacion.reto.estado},
        )

    if certificacion.credencial_vigente(db, participacion.id) is not None:
        raise ErrorDominio(
            "PARTICIPACION_YA_CERTIFICADA", "La participacion ya conserva una credencial vigente.", http=409
        )

    intentos = (
        db.scalar(select(func.count()).select_from(Entrega).where(Entrega.participacion_id == participacion.id)) or 0
    )

    entrega = Entrega(
        participacion_id=participacion.id,
        numero_intento=intentos + 1,
        repositorio=repositorio,
        commit=commit,
    )
    db.add(entrega)
    db.flush()
    auditoria.registrar(db, "entrega.registrada", auditoria.referencia("entrega", entrega.id), actor=actor)
    return entrega


def solicitar(db: Session, entrega: Entrega, actor: Usuario) -> Evaluacion:
    """RN-EVAL-01: una entrega admite muchas evaluaciones. Reevaluar no exige entrega nueva.

    Devuelve la evaluacion en PENDIENTE; el procesamiento ocurre fuera del ciclo de peticion.
    """
    participacion = entrega.participacion
    if not participacion.reto.admite_entregas():
        raise ErrorDominio("RETO_NO_ADMITE_ENTREGAS", "El reto esta cerrado y no admite nuevos inicios.", http=409)
    if certificacion.credencial_vigente(db, participacion.id) is not None:
        raise ErrorDominio(
            "PARTICIPACION_YA_CERTIFICADA", "La participacion ya conserva una credencial vigente.", http=409
        )

    en_curso = db.scalar(
        select(Evaluacion).where(
            Evaluacion.entrega_id == entrega.id,
            Evaluacion.estado_procesamiento.in_((EstadoEvaluacion.PENDIENTE, EstadoEvaluacion.EN_EJECUCION)),
        )
    )
    if en_curso:
        raise ErrorDominio(
            "EVALUACION_EN_CURSO",
            "Ya hay una evaluacion en curso para esa entrega.",
            http=409,
            detalles={"evaluacion_id": str(en_curso.id)},
        )

    evaluacion = Evaluacion(
        entrega_id=entrega.id, version_evaluador="", estado_procesamiento=EstadoEvaluacion.PENDIENTE
    )
    db.add(evaluacion)
    db.flush()
    auditoria.registrar(db, "evaluacion.solicitada", auditoria.referencia("evaluacion", evaluacion.id), actor=actor)
    return evaluacion


def procesar(evaluacion_id: uuid.UUID) -> None:
    """Trabajo en segundo plano, con la identidad del servicio. Abre su propia sesion."""
    testigo = ctx_evaluacion_id.set(str(evaluacion_id))
    try:
        _procesar(evaluacion_id)
    finally:
        ctx_evaluacion_id.reset(testigo)


def _procesar(evaluacion_id: uuid.UUID) -> None:
    with SessionLocal() as db:
        evaluacion = db.get(Evaluacion, evaluacion_id)
        if evaluacion is None or evaluacion.estado_procesamiento != EstadoEvaluacion.PENDIENTE:
            return  # ya fue tomada, o no existe

        # Una espera en cola no cuenta como inicio efectivo: el momento se fija aqui.
        evaluacion.estado_procesamiento = EstadoEvaluacion.EN_EJECUCION
        evaluacion.momento_inicio = ahora()
        db.commit()

        entrega = evaluacion.entrega
        pruebas = list(entrega.participacion.reto.pruebas)

        # El contenido que se ejecuta sale del espacio de trabajo de la participacion. El
        # evaluador simulado lo ignora; el de sandbox lo escribe y lo corre de verdad.
        espacio = db.get(EspacioTrabajo, entrega.participacion_id)
        archivos = servicio_workspace.leer_archivos(espacio.archivos) if espacio else []

        try:
            salida = obtener_evaluador().ejecutar(entrega.repositorio, entrega.commit, pruebas, archivos)
        except FalloEvaluador as fallo:
            # RN-EVAL-03: el fallo del entorno se distingue de una solucion desaprobada.
            # Queda sin dictamen, y por tanto no puede sustentar una credencial.
            _cerrar_con_error_tecnico(db, evaluacion.id, str(fallo))
            return
        except Exception as error:  # noqa: BLE001 -- ninguna excepcion puede dejar la fila colgada
            # Sin esta rama, cualquier fallo no previsto (un tiempo de espera agotado contra el
            # proveedor de sandbox, una desconexion) deja la evaluacion en EN_EJECUCION para
            # siempre, y el frontend consultando su estado sin fin.
            log.exception("fallo inesperado del evaluador")
            _cerrar_con_error_tecnico(db, evaluacion.id, f"Fallo inesperado del evaluador: {type(error).__name__}")
            return

        evaluacion.version_evaluador = salida.version_evaluador
        for resultado in salida.resultados:
            db.add(
                ResultadoPrueba(
                    evaluacion_id=evaluacion.id,
                    prueba_id=resultado.prueba_id,
                    condicion_ejecucion=resultado.condicion_ejecucion,
                    aprobada=resultado.aprobada,
                    valor_observado=resultado.valor_observado,
                    unidad=resultado.unidad,
                    duracion_ms=resultado.duracion_ms,
                    detalle=resultado.detalle,
                )
            )
        db.flush()

        dictamen = _dictaminar(pruebas, salida.resultados)
        if dictamen is None:
            # Una comprobacion fallo por el entorno. Se conservan los resultados obtenidos y la
            # evaluacion cierra sin dictamen: RN-EVAL-03 prohibe cargarselo al estudiante.
            db.commit()
            _cerrar_con_error_tecnico(
                db, evaluacion.id, "Una comprobacion de la bateria no pudo ejecutarse por un fallo del entorno."
            )
            return

        evaluacion.dictamen = dictamen
        evaluacion.estado_procesamiento = EstadoEvaluacion.FINALIZADA
        evaluacion.momento_fin = ahora()
        auditoria.registrar(
            db,
            "evaluacion.finalizada",
            auditoria.referencia("evaluacion", evaluacion.id),
            origen=OrigenEvento.SISTEMA,
            detalle=f"dictamen={dictamen}",
        )
        db.flush()

        if dictamen == Dictamen.APROBADO:
            try:
                certificacion.emitir(db, evaluacion)
            except ErrorDominio as error:
                # Que no se pueda emitir no invalida la evaluacion: queda aprobada y registrada.
                log.info("no se emitio credencial", extra={"codigo": error.codigo})

        db.commit()
        log.info(
            "evaluacion terminada",
            extra={
                "version_evaluador": salida.version_evaluador,
                "dictamen": dictamen,
                "pruebas": f"{sum(1 for r in salida.resultados if r.aprobada)}/{len(pruebas)}",
            },
        )


def _cerrar_con_error_tecnico(db: Session, evaluacion_id: uuid.UUID, motivo: str) -> None:
    """Cierra la evaluacion sin dictamen. Una evaluacion en ERROR_TECNICO no certifica.

    Se hace `rollback` primero porque la excepcion pudo dejar la sesion inutilizable, y en ese
    caso el propio registro del error no llegaria a escribirse.
    """
    db.rollback()
    evaluacion = db.get(Evaluacion, evaluacion_id)
    if evaluacion is None:
        return
    evaluacion.estado_procesamiento = EstadoEvaluacion.ERROR_TECNICO
    evaluacion.momento_fin = ahora()
    evaluacion.detalle_error = motivo
    auditoria.registrar(
        db,
        "evaluacion.error_tecnico",
        auditoria.referencia("evaluacion", evaluacion.id),
        ResultadoOperacion.ERROR,
        origen=OrigenEvento.SISTEMA,
        detalle=motivo,
    )
    db.commit()
    log.warning("evaluacion en error tecnico", extra={"motivo": motivo})


def _dictaminar(pruebas: list, resultados: list) -> str | None:
    """RN-EVAL-03: aprobar exige completar la bateria certificable y satisfacer todas las
    pruebas obligatorias.

    Devuelve `None` cuando alguna comprobacion fallo por el entorno: eso no es un veredicto
    sobre la solucion y quien llama lo traduce en ERROR_TECNICO. Una comprobacion que
    sencillamente no se ejecuto (`NO_EJECUTADA`) si desaprueba: la bateria quedo incompleta,
    pero la causa no es de infraestructura.
    """
    por_prueba = {r.prueba_id: r for r in resultados}

    if any(r.condicion_ejecucion == CondicionEjecucion.ERROR_TECNICO for r in resultados):
        return None
    if any(p.id not in por_prueba for p in pruebas):
        return Dictamen.NO_APROBADO  # bateria incompleta
    if any(r.condicion_ejecucion != CondicionEjecucion.EJECUTADA for r in resultados):
        return Dictamen.NO_APROBADO
    if any(not por_prueba[p.id].aprobada for p in pruebas if p.obligatoria):
        return Dictamen.NO_APROBADO
    return Dictamen.APROBADO


def exigir_entrega_propia(db: Session, actor: Usuario, entrega_id: uuid.UUID) -> Entrega:
    """Error critico de la suite: nadie evalua la entrega de otra persona."""
    entrega = db.get(Entrega, entrega_id)
    if entrega is None:
        raise ErrorDominio("ENTREGA_NO_ENCONTRADA", "No existe esa entrega.", http=404)
    seguridad.participacion_propia(db, actor, entrega.participacion_id)
    return entrega
