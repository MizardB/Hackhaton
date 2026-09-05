def test_health_verifica_la_base_de_datos(cliente):
    cuerpo = cliente.get("/health").json()
    assert cuerpo["estado"] == "ok"
    assert cuerpo["base_datos"] == "ok"


def test_meta_declara_las_implementaciones_de_los_puertos(cliente):
    """Transparencia deliberada: quien consulte la API sabe que produce los resultados."""
    cuerpo = cliente.get("/api/v1/meta").json()
    assert cuerpo["evaluador"] == "simulado"
    assert cuerpo["preparador"] == "reglas"
