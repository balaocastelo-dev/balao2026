"""Testes do vigia sem Bling nem site de verdade: python -m unittest discover -s testes"""
import datetime as dt
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
import vigia  # noqa: E402

# Pedido e proposta reais da conta (12/10/2026), com o cliente trocado.
PEDIDO = {
    "contato": {"id": 18443907915, "nome": "Cliente Teste", "tipoPessoa": "F"},
    "data": "2026-10-10", "id": 27096789495, "numero": 24775, "situacao": {"id": 6, "valor": 0},
    "total": 398, "vendedor": {"id": 11463282606},
    "itens": [{"descricao": "ROTEADOR TPLINK 300MBPS", "quantidade": 1, "valor": 219}],
}
PROPOSTA = {
    "contato": {"id": 17202791839}, "data": "2026-10-09", "id": 27091123569, "numero": 14301,
    "situacao": "Rascunho", "total": 11343, "vendedor": {"id": 15596536241},
    "itens": [{"produto": {"descricao": "LICENÇA MICROSOFT WINDOWS 11 PRO ORIGINAL E VITALICIO ", "id": 0},
               "quantidade": 1, "valor": 349}],
}


class TestDocumentos(unittest.TestCase):
    def test_venda(self):
        d = vigia.documento_de_venda(PEDIDO)
        self.assertEqual(d["tipo"], "venda")
        self.assertEqual(d["blingId"], "27096789495")
        self.assertEqual(d["vendedorBlingId"], "11463282606")
        self.assertEqual(d["situacaoId"], 6)
        self.assertEqual(d["itens"][0]["descricao"], "ROTEADOR TPLINK 300MBPS")

    def test_proposta_le_o_nome_dentro_de_produto(self):
        d = vigia.documento_de_orcamento(PROPOSTA)
        self.assertEqual(d["tipo"], "orcamento")
        self.assertEqual(d["vendedorBlingId"], "15596536241")
        self.assertIn("WINDOWS 11", d["itens"][0]["descricao"])
        self.assertEqual(d["situacao"], "Rascunho")

    def test_vendedor_zero_vira_nada(self):
        self.assertIsNone(vigia._id(0))
        self.assertIsNone(vigia._id(None))


class TestJanela(unittest.TestCase):
    def setUp(self):
        self.cfg = dict(vigia.PADRAO, pasta_dados=tempfile.mkdtemp())
        self.est = vigia.Estado(self.cfg["pasta_dados"])
        self.hoje = dt.date(2026, 10, 12)

    def test_primeira_carga_pega_tres_meses(self):
        self.assertEqual(vigia.desde_da_volta(self.cfg, self.est, self.hoje, None, None), ("2026-07-01", "primeira carga"))

    def test_volta_normal_pega_tres_dias(self):
        self.est.d["primeira_feita"] = True
        self.est.d["ultima_completa"] = vigia.time.time()
        self.assertEqual(vigia.desde_da_volta(self.cfg, self.est, self.hoje, None, None)[0], "2026-10-09")

    def test_de_hora_em_hora_revisa_40_dias(self):
        self.est.d["primeira_feita"] = True
        self.est.d["ultima_completa"] = vigia.time.time() - 4000
        self.assertEqual(vigia.desde_da_volta(self.cfg, self.est, self.hoje, None, None)[0], "2026-09-02")

    def test_pedido_do_painel_vence(self):
        self.est.d["primeira_feita"] = True
        self.assertEqual(vigia.desde_da_volta(self.cfg, self.est, self.hoje, "2026-01-01", None)[0], "2026-01-01")


class FakeBling:
    """Bling de mentira: lista e detalhe, contando as chamadas de detalhe."""
    def __init__(self):
        self.detalhes = 0
        self.chamadas = 0

    def listar(self, caminho, params, teto_paginas=60):
        if caminho == "pedidos/vendas":
            return iter([{k: PEDIDO[k] for k in ("id", "numero", "data", "total", "situacao", "contato")}])
        return iter([{k: PROPOSTA[k] for k in ("id", "numero", "data", "total", "situacao", "contato")}])

    def get(self, caminho, params=None):
        self.detalhes += 1
        return {"data": PEDIDO if caminho.startswith("pedidos") else PROPOSTA}


class TestColeta(unittest.TestCase):
    def test_so_abre_detalhe_do_que_mudou(self):
        est = vigia.Estado(tempfile.mkdtemp())
        b = FakeBling()
        mud = vigia.coletar(b, est, "2026-10-01", "2026-10-12", lambda *a: None)
        self.assertEqual(len(mud), 2)
        self.assertEqual(b.detalhes, 2)
        mud = vigia.coletar(b, est, "2026-10-01", "2026-10-12", lambda *a: None)
        self.assertEqual(mud, [])
        self.assertEqual(b.detalhes, 2)


if __name__ == "__main__":
    unittest.main()


class TestSiteForaDoAr(unittest.TestCase):
    def test_guarda_e_reenvia_na_proxima_volta(self):
        pasta = tempfile.mkdtemp()
        chave = Path(pasta) / "chave.txt"
        chave.write_text("arena_" + "x" * 40, encoding="utf-8")
        cfg = dict(vigia.PADRAO, pasta_dados=pasta, arquivo_chave=str(chave), bling_tokens=str(Path(pasta) / "t.json"))
        original = (vigia.pedir, vigia.Bling)
        respostas = []

        def pedir_falso(url, metodo="GET", dados=None, cabecalhos=None, espera=30):
            if metodo == "GET":
                return {"ok": True, "varrerDesde": None}
            respostas.append(dados)
            if len(respostas) == 1:
                raise vigia.ErroHttp(503, "fora do ar")
            return {"gravados": len(dados["documentos"])}

        class BlingFalso(FakeBling):
            def __init__(self, *a, **k):
                super().__init__()

        try:
            vigia.pedir = pedir_falso
            vigia.Bling = BlingFalso
            self.assertEqual(vigia.uma_volta(cfg), 1)
            est = vigia.Estado(pasta)
            self.assertEqual(len(est.d["docs"]), 2)
            self.assertTrue(all(not v.get("enviado") for v in est.d["docs"].values()))
            self.assertEqual(vigia.uma_volta(cfg), 0)
            self.assertEqual(len(respostas[-1]["documentos"]), 2)
        finally:
            vigia.pedir, vigia.Bling = original


class TestParear(unittest.TestCase):
    def test_pede_espera_e_grava_a_chave(self):
        pasta = tempfile.mkdtemp()
        cfg = dict(vigia.PADRAO, pasta_dados=pasta, arquivo_chave=str(Path(pasta) / "k" / "chave.txt"))
        chamadas = []

        def pedir_falso(url, metodo="GET", dados=None, cabecalhos=None, espera=30):
            chamadas.append((metodo, url))
            if metodo == "POST":
                return {"pedido": "p1", "token": "t1", "codigo": "4821"}
            self.assertEqual(cabecalhos["Authorization"], "Bearer t1")
            return {"aprovado": True, "chave": "arena_" + "z" * 48} if len(chamadas) > 2 else {"aprovado": False}

        original = vigia.pedir
        try:
            vigia.pedir = pedir_falso
            self.assertEqual(vigia.parear(cfg, espera_max_s=5, intervalo_s=0.01), 0)
        finally:
            vigia.pedir = original
        self.assertTrue(Path(cfg["arquivo_chave"]).read_text().startswith("arena_"))
