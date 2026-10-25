"""Testes da sentinela de vendas (sem rede): python -m unittest discover -s scripts/sentinela-vendas/testes"""
import importlib.util, io, json, os, sys, tempfile, unittest, urllib.error
from pathlib import Path

AQUI = Path(__file__).resolve().parent.parent
spec = importlib.util.spec_from_file_location("sentinela", AQUI / "sentinela-vendas-telegram.py")
s = importlib.util.module_from_spec(spec); spec.loader.exec_module(s)

RESPOSTA = {"de": "2026-10-25", "ate": "2026-10-25", "vendas": [
    {"id": 1, "cliente": "Maria Silva", "total": 1500.0, "cancelada": False, "vendedor": {"id": 1, "nome": "Julia Souza"}},
    {"id": 2, "cliente": "João", "total": 300.0, "cancelada": False, "vendedor": None},
    {"id": 3, "cliente": "Cancelado", "total": 9999.0, "cancelada": True, "vendedor": None}],
    "totais": {"quantidade": 2, "valor": 1800.0, "canceladas": 1,
               "porVendedor": [{"nome": "Julia Souza", "quantidade": 1, "valor": 1500.0}, {"nome": "Sem vendedor", "quantidade": 1, "valor": 300.0}]}}

class Falsa:
    def __init__(self, corpo): self.corpo = corpo
    def read(self): return self.corpo

class Testes(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory(); self.arq = os.path.join(self.tmp.name, "chave.txt")
        Path(self.arq).write_text("chave-de-teste\n", encoding="utf-8"); s.ARQ_CHAVE = self.arq
    def tearDown(self): self.tmp.cleanup()

    def test_pergunta_ao_site_com_a_chave_e_o_periodo(self):
        visto = {}
        def abrir(req, timeout):
            visto["url"] = req.full_url; visto["auth"] = req.get_header("Authorization")
            return Falsa(json.dumps(RESPOSTA).encode())
        r = s.vendas("2026-10-01", "2026-10-25", abrir=abrir)
        self.assertIn("/api/pc/sistema/vendas?de=2026-10-01&ate=2026-10-25", visto["url"])
        self.assertEqual(visto["auth"], "Bearer chave-de-teste")
        self.assertEqual(r["totais"]["valor"], 1800.0)

    def test_resumo_ignora_cancelada_e_mostra_vendedores(self):
        t = s.resumo(RESPOSTA, "Vendas de hoje")
        self.assertIn("R$ 1.800,00", t); self.assertIn("2 pedidos", t); self.assertIn("ticket R$ 900,00", t)
        self.assertIn("1 cancelada", t); self.assertIn("Maria Silva", t); self.assertNotIn("9.999", t)
        self.assertIn("Julia R$ 1.500,00", t)

    def test_dia_sem_venda(self):
        t = s.resumo({"vendas": [], "totais": {"quantidade": 0, "valor": 0, "canceladas": 0, "porVendedor": []}}, "Hoje")
        self.assertIn("R$ 0,00", t); self.assertIn("0 pedidos", t)

    def test_sem_chave_explica_o_que_fazer(self):
        os.remove(self.arq)
        with self.assertRaises(RuntimeError) as e: s.vendas("2026-10-25", "2026-10-25", abrir=lambda r, timeout: None)
        self.assertIn("chave do PC", str(e.exception))

    def test_erro_do_site_vira_mensagem(self):
        def abrir(req, timeout):
            raise urllib.error.HTTPError(req.full_url, 401, "x", {}, io.BytesIO(json.dumps({"erro": "Chave do PC inválida"}).encode()))
        with self.assertRaises(RuntimeError) as e: s.vendas("2026-10-25", "2026-10-25", abrir=abrir)
        self.assertEqual(str(e.exception), "Chave do PC inválida")

    def test_nao_fala_mais_com_o_bling(self):
        fonte = (AQUI / "sentinela-vendas-telegram.py").read_text(encoding="utf-8").lower()
        self.assertNotIn("bling.com.br", fonte); self.assertNotIn("bling_tokens", fonte)

if __name__ == "__main__": unittest.main()
