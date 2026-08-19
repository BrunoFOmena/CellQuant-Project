from tests.conftest import payload_exame


def test_post_recalcula_e_persiste(client):
    res = client.post("/exames", json=payload_exame())
    assert res.status_code == 201
    body = res.json()
    assert body["leucocitos_ul"] == 2.5
    assert body["hemacias_ul"] == 10.0
    assert body["poli_pct"] == 25.0
    assert body["mono_pct"] == 75.0
    assert body["id"] >= 1

    got = client.get(f"/exames/{body['id']}")
    assert got.status_code == 200
    assert got.json()["prontuario"] == "PR-TEST-001"


def test_post_422_bordas(client):
    vazio = payload_exame(operador="")
    assert client.post("/exames", json=vazio).status_code == 422

    quad = payload_exame(quadrantes_leuco=0)
    assert client.post("/exames", json=quad).status_code == 422

    dil = payload_exame(diluicao_hema=0)
    assert client.post("/exames", json=dil).status_code == 422

    neg = payload_exame(leucocitos=-3)
    assert client.post("/exames", json=neg).status_code == 422


def test_get_404(client):
    res = client.get("/exames/99999")
    assert res.status_code == 404


def test_listar_filtros(client):
    client.post("/exames", json=payload_exame(prontuario="PR-AAA", data_exame="2026-01-10"))
    client.post(
        "/exames",
        json=payload_exame(prontuario="PR-BBB", operador="Carlos", data_exame="2026-02-10"),
    )

    todos = client.get("/exames")
    assert len(todos.json()) == 2

    por_q = client.get("/exames", params={"q": "PR-AAA"})
    assert len(por_q.json()) == 1
    assert por_q.json()[0]["prontuario"] == "PR-AAA"

    por_data = client.get(
        "/exames",
        params={"data_inicial": "2026-02-01", "data_final": "2026-02-28"},
    )
    assert len(por_data.json()) == 1
    assert por_data.json()[0]["prontuario"] == "PR-BBB"


def test_export_csv(client):
    client.post("/exames", json=payload_exame(observacoes="linha1\nlinha2"))
    res = client.get("/exames/export/csv")
    assert res.status_code == 200
    assert "text/csv" in res.headers["content-type"]
    texto = res.text
    assert "prontuario" in texto
    assert ";" in texto
    assert "PR-TEST-001" in texto
    assert "\n" in texto or "linha1 linha2" in texto


def test_mesmo_prontuario_data_pode_duplicar(client):
    a = client.post("/exames", json=payload_exame())
    b = client.post("/exames", json=payload_exame())
    assert a.status_code == 201
    assert b.status_code == 201
    assert a.json()["id"] != b.json()["id"]
    lista = client.get("/exames", params={"q": "PR-TEST-001"})
    assert len(lista.json()) == 2
