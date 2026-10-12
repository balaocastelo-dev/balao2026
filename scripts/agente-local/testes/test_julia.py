"""Testes do trabalhador da JUL.IA sem Ollama, sem Bling e sem VPS de verdade.

    cd scripts/agente-local && python -m unittest discover -s testes -v

O modelo de linguagem é trocado por um roteiro (FalsoOllama): a cada chamada
ele devolve a próxima "fala" combinada. Assim dá para provar as travas que não
dependem do modelo: preço inventado não sai, venda sem "sim" não sai, CPF
inválido não entra, Bling simulado no modo teste, etc.
"""
from __future__ import annotations

import json
import sys
import tempfile
import unittest
from pathlib import Path

AQUI = Path(__file__).resolve().parent
sys.path.insert(0, str(AQUI.parent))

import regras as R  # noqa: E402
from bling import Bling  # noqa: E402
from catalogo import Catalogo, preco, reais  # noqa: E402
from cerebro import Atendimento  # noqa: E402
from rede import ErroHttp  # noqa: E402

AMOSTRA = json.loads((AQUI / "catalogo-amostra.json").read_text(encoding="utf-8"))
CPF_BOM = "52998224725"  # CPF de exemplo com dígitos válidos (não é de ninguém)


def catalogo():
    c = Catalogo(tempfile.mkdtemp(), buscar_remoto=lambda: AMOSTRA)
    c.atualizar(forcar=True)
    return c


def chamada(_ferramenta, **args):
    return {"tool_calls": [{"function": {"name": _ferramenta, "arguments": args}}], "content": ""}


def fala(texto):
    return {"content": texto}


class FalsoOllama:
    def __init__(self, roteiro):
        self.roteiro = list(roteiro)
        self.recebidas = []

    def conversar(self, modelo, mensagens, ferramentas=None, **_):
        self.recebidas.append({"mensagens": [dict(m) for m in mensagens], "ferramentas": bool(ferramentas)})
        if not self.roteiro:
            return fala("")
        passo = self.roteiro.pop(0)
        return passo(mensagens) if callable(passo) else passo


def trabalho(*mensagens_do_cliente, dados=None, memoria=None, primeira=False, venda_auto=True):
    msgs = [{"id": f"m{i}", "de": "cliente", "tipo": "texto", "texto": t} for i, t in enumerate(mensagens_do_cliente)]
    return {
        "id": "t1", "chatId": "5519984515960@c.us", "nome": "Thiago", "numero": "5519984515960",
        "primeiraVez": primeira, "mensagens": msgs, "dados": dados or {}, "memoria": memoria or {},
        "config": {"modo": "automatico", "publico": "teste", "vendaAutomatica": venda_auto},
    }


def atender(t, roteiro, cat=None):
    o = FalsoOllama(roteiro)
    a = Atendimento(trabalho=t, ollama=o, modelo="qwen3:14b", catalogo=cat or catalogo(),
                    bling=Bling("/nao/existe.json", simular=True), registrar=lambda *_: None)
    return a.responder(), o


class TestRegras(unittest.TestCase):
    def test_documentos(self):
        self.assertTrue(R.cpf_valido(CPF_BOM))
        self.assertFalse(R.cpf_valido("52998224724"))
        self.assertFalse(R.cpf_valido("11111111111"))
        self.assertTrue(R.cnpj_valido("11222333000181"))
        self.assertFalse(R.cnpj_valido("11222333000182"))

    def test_extrair_dados(self):
        d = R.extrair_dados("meu cpf é 529.982.247-25, email Fulano@Exemplo.com e cep 13025-320")
        self.assertEqual(d, {"cpf_cnpj": CPF_BOM, "email": "fulano@exemplo.com", "cep": "13025320"})
        self.assertNotIn("cpf_cnpj", R.extrair_dados("meu número é 19 98751-0267"))

    def test_confirmacao(self):
        for t in ("sim", "Pode fechar!", "fechado", "quero sim", "ok pode ser", "bora"):
            self.assertTrue(R.confirmou_compra(t), t)
        for t in ("não", "vou pensar", "sim, mas tem desconto?", "talvez depois", "qual o preço?"):
            self.assertFalse(R.confirmou_compra(t), t)

    def test_problemas_da_resposta(self):
        self.assertEqual(R.problemas_da_resposta("Sai por R$ 4.786,67 no Pix", {4786.67}), [])
        self.assertTrue(R.problemas_da_resposta("Sai por R$ 3.999,00", {4786.67}))
        self.assertTrue(R.problemas_da_resposta("Na Kabum está mais caro", set()))
        self.assertTrue(R.problemas_da_resposta("nosso custo é baixo", set()))
        self.assertTrue(R.problemas_da_resposta("veja https://www.kabum.com.br/x", set()))
        self.assertEqual(R.problemas_da_resposta("veja https://www.balao.info/product/x", set()), [])


class TestCatalogo(unittest.TestCase):
    def test_busca_por_tipo_e_preco(self):
        c = catalogo()
        r = c.buscar("notebook")
        self.assertTrue(r)
        self.assertTrue(all("notebook" in x["nome"].lower() and not x["nome"].lower().startswith("mem") for x in r))
        self.assertEqual(c.buscar("notebook", preco_maximo=1000), [], "memória 'para notebook' não é notebook")
        self.assertEqual(c.buscar("mouse sem fio"), [], "não há mouse na amostra: vazio, não o PC com mouse")
        r = c.buscar("pc gamer rtx 4060")
        self.assertTrue(r and all("4060" in x["nome"] for x in r))
        r = c.buscar("placa de video", ordem="menor_preco")
        self.assertTrue(r and all(x["nome"].lower().startswith("placa") for x in r), "suporte de placa não é placa")

    def test_resumo_nao_tem_custo(self):
        c = catalogo()
        p = dict(c.produtos[0], cost="100", supplier="X")
        self.assertNotIn("cost", json.dumps(c.resumo(p)))
        self.assertNotIn("supplier", json.dumps(c.resumo(p)))

    def test_precos_de(self):
        c = catalogo()
        p = c.produtos[0]
        v = c.precos_de(p)
        self.assertIn(round(preco(p["price"]), 2), v)


class TestAtendimento(unittest.TestCase):
    def setUp(self):
        self.cat = catalogo()
        self.note = self.cat.buscar("notebook")[0]

    def test_busca_mostra_e_responde_com_preco_do_catalogo(self):
        nid, valor = self.note["id"], self.note["preco_a_vista_pix"]
        r, o = atender(trabalho("quero um notebook pra estudar"), [
            chamada("buscar_produtos", busca="notebook"),
            chamada("mostrar_produto", id=nid),
            fala(f"Separei esta opção: sai por {valor} à vista no Pix. Serve para você?"),
        ], self.cat)
        self.assertEqual(r["respostas"][0]["tipo"], "texto")
        self.assertIn(valor, r["respostas"][0]["texto"])
        self.assertEqual(r["respostas"][1], {"tipo": "produto", "produtoId": nid})
        self.assertIsNone(r["transferir"])
        self.assertIn(nid, r["memoria"]["produtos"])
        # O modelo recebeu o catálogo pela ferramenta, sem custo nem fornecedor.
        conteudo_ferramenta = [m for m in o.recebidas[1]["mensagens"] if m["role"] == "tool"][0]["content"]
        self.assertNotIn("cost", conteudo_ferramenta)

    def test_preco_inventado_nao_sai(self):
        r, _ = atender(trabalho("quanto custa o notebook?"), [
            chamada("buscar_produtos", busca="notebook"),
            fala("Sai por R$ 1.999,00!"),
            fala("Corrigindo: sai por R$ 1.500,00"),
        ], self.cat)
        texto = r["respostas"][0]["texto"]
        self.assertNotIn("1.999", texto)
        self.assertNotIn("1.500", texto)
        self.assertIn("vendedor", texto)
        self.assertTrue(r["transferir"])

    def test_preco_inventado_corrigido_na_segunda(self):
        valor = self.note["preco_a_vista_pix"]
        r, o = atender(trabalho("quanto custa o notebook?"), [
            chamada("buscar_produtos", busca="notebook"),
            fala("Sai por R$ 1.999,00!"),
            fala(f"Sai por {valor} no Pix."),
        ], self.cat)
        self.assertIn(valor, r["respostas"][0]["texto"])
        self.assertIsNone(r["transferir"])
        self.assertIn("não pode ir para o cliente", o.recebidas[-1]["mensagens"][-1]["content"])

    def test_primeira_resposta_se_apresenta(self):
        r, _ = atender(trabalho("oi", primeira=True), [fala("Em que posso ajudar?")], self.cat)
        self.assertTrue(r["respostas"][0]["texto"].startswith("Oi! Aqui é a JUL.IA"))
        self.assertTrue(r["memoria"]["apresentou"])

    def test_orcamento_simulado_vai_pronto(self):
        nid = self.note["id"]
        r, _ = atender(trabalho("quero esse"), [
            chamada("emitir_orcamento", itens=[{"id": nid, "quantidade": 2}]),
            fala("Prontinho! Posso fechar o pedido?"),
        ], self.cat)
        self.assertEqual(r["acoes"][0]["tipo"], "orcamento")
        self.assertTrue(r["acoes"][0]["numero"].startswith("TESTE-"))
        orc = r["respostas"][-1]["texto"]
        self.assertIn("Orçamento nº", orc)
        self.assertIn("(teste)", orc)
        total = round(preco(self.cat.produto(nid)["price"]) * 2, 2)
        self.assertIn(reais(total), orc)
        self.assertEqual(r["memoria"]["orcamento"]["total"], total)

    def test_produto_que_nao_existe_nao_vira_orcamento(self):
        r, _ = atender(trabalho("quero"), [chamada("emitir_orcamento", itens=[{"id": "999999"}]), fala("Vou verificar.")], self.cat)
        self.assertEqual(r["acoes"], [])

    def _com_orcamento(self):
        nid = self.note["id"]
        valor = round(preco(self.cat.produto(nid)["price"]), 2)
        return {"orcamento": {"numero": "TESTE-1", "id": "x", "itens": [{"id": nid, "nome": "Notebook", "quantidade": 1, "valor": valor}], "total": valor}}

    def test_venda_exige_sim_dados_e_orcamento(self):
        # Sem orçamento
        r, _ = atender(trabalho("pode fechar"), [chamada("emitir_venda"), fala("Antes, vou montar o orçamento.")], self.cat)
        self.assertEqual(r["acoes"], [])
        # Com orçamento, mas sem "sim" claro
        r, o = atender(trabalho("e quanto tempo de garantia?", memoria=self._com_orcamento()), [chamada("emitir_venda"), fala("Posso fechar?")], self.cat)
        self.assertEqual(r["acoes"], [])
        self.assertIn("não confirmou", [m for m in o.recebidas[1]["mensagens"] if m["role"] == "tool"][0]["content"])
        # Sim, mas faltam dados
        r, o = atender(trabalho("sim pode fechar", memoria=self._com_orcamento()), [chamada("emitir_venda"), fala("Me passa seu nome completo?")], self.cat)
        self.assertEqual(r["acoes"], [])
        self.assertIn("CPF", [m for m in o.recebidas[1]["mensagens"] if m["role"] == "tool"][0]["content"])

    def test_venda_completa_simulada_passa_para_vendedor(self):
        dados = {"nome": "Thiago Teste", "pagamento": "pix", "entrega": "retirada"}
        r, _ = atender(trabalho(f"meu cpf {CPF_BOM}", "sim, pode fechar", dados=dados, memoria=self._com_orcamento()), [
            chamada("emitir_venda"),
            fala("Obrigada pela compra!"),
        ], self.cat)
        self.assertEqual(r["dados"]["cpf_cnpj"], CPF_BOM, "CPF tirado da conversa pelo código")
        self.assertEqual(r["acoes"][0]["tipo"], "venda")
        self.assertIn("Pedido nº TESTE-", r["respostas"][-1]["texto"])
        self.assertIn("retirada", r["respostas"][-1]["texto"])
        self.assertIn("venda nº", r["transferir"]["motivo"])

    def test_pedido_inventado_pelo_modelo_nao_sai(self):
        r, _ = atender(trabalho("e a garantia?", memoria=self._com_orcamento()), [
            fala("O pedido está pronto! Venda nº 555."),
            fala("Pedido registrado com sucesso!"),
        ], self.cat)
        self.assertEqual(r["acoes"], [])
        self.assertNotIn("pronto", r["respostas"][0]["texto"])
        self.assertTrue(r["transferir"])

    def test_cliente_confirmou_e_o_modelo_esqueceu_a_venda(self):
        dados = {"nome": "Thiago Teste", "pagamento": "pix", "entrega": "retirada", "cpf_cnpj": CPF_BOM}
        r, _ = atender(trabalho("pode fechar sim", dados=dados, memoria=self._com_orcamento()), [
            chamada("salvar_dados", pagamento="pix"),
            fala("Seu pedido está pronto!"),
        ], self.cat)
        self.assertEqual([a["tipo"] for a in r["acoes"]], ["venda"], "o código registrou a venda")
        self.assertEqual(r["respostas"][0]["texto"], "Muito obrigada pela compra! 😊")
        self.assertIn("Pedido nº", r["respostas"][-1]["texto"])

    def test_desconto_vai_para_vendedor_sem_passar_pelo_modelo(self):
        r, o = atender(trabalho("faz por 4 mil? tem desconto no pix?"), [fala("Damos 10% de desconto!")], self.cat)
        self.assertEqual(o.recebidas, [], "o modelo nem é chamado")
        self.assertIn("vendedor", r["respostas"][0]["texto"])
        self.assertTrue(r["transferir"])

    def test_buscou_e_nao_mostrou_o_cliente_recebe_as_tres_primeiras(self):
        r, _ = atender(trabalho("quero um notebook"), [chamada("buscar_produtos", busca="notebook"), fala("Tenho estas opções. Qual prefere?")], self.cat)
        self.assertEqual(len([x for x in r["respostas"] if x["tipo"] == "produto"]), 3)
        self.assertEqual(len(r["memoria"]["mostrados"]), 3)

    def test_vou_buscar_sem_buscar_leva_um_empurrao(self):
        valor = self.note["preco_a_vista_pix"]
        mem = {"produtos": {self.note["id"]: {"nome": "N", "preco": valor, "precos": [preco(valor)]}}, "mostrados": [self.note["id"]]}
        r, o = atender(trabalho("qual tem mais armazenamento?", memoria=mem), [
            fala("Vou buscar as especificações, um momento!"),
            chamada("detalhes_do_produto", id=self.note["id"]),
            fala("O primeiro tem SSD de 512GB."),
        ], self.cat)
        self.assertEqual(r["respostas"][0]["texto"], "O primeiro tem SSD de 512GB.")
        self.assertIn("Não diga que vai fazer", o.recebidas[1]["mensagens"][-1]["content"])

    def test_resposta_longa_pede_para_encurtar_mas_nao_chama_vendedor(self):
        longo = "Este notebook é ótimo. " * 50
        r, _ = atender(trabalho("me fala do notebook", memoria={"mostrados": [self.note["id"]], "produtos": {self.note["id"]: {"nome": "N", "preco": "x", "precos": []}}}), [
            fala(longo), fala(longo)], self.cat)
        self.assertIsNone(r["transferir"])
        self.assertTrue(r["respostas"][0]["texto"].startswith("Este notebook"))

    def test_conserto_vai_para_a_equipe(self):
        r, o = atender(trabalho("[foto: notebook com a tela trincada] quanto fica pra trocar essa tela?"), [fala("Temos notebooks novos!")], self.cat)
        # A foto sozinha (com defeito na descrição) não é pedido de conserto.
        r2, o2 = atender(trabalho("[foto: notebook velho com a tela trincada] quero um novo parecido"), [
            fala("Entendi! Qual o seu orçamento?"), chamada("buscar_produtos", busca="notebook"), fala("Separei estes parecidos.")], self.cat)
        self.assertIsNone(r2["transferir"])
        self.assertTrue(o2.recebidas)
        self.assertEqual(o.recebidas, [])
        self.assertIn("assistência técnica", r["respostas"][0]["texto"])
        self.assertEqual(r["transferir"]["motivo"], "assistência técnica, conserto ou garantia")

    def test_markdown_vira_texto_de_whatsapp(self):
        valor = self.note["preco_a_vista_pix"]
        r, _ = atender(trabalho("e o notebook?", memoria={"produtos": {self.note["id"]: {"nome": "N", "preco": valor, "precos": [preco(valor)]}}, "mostrados": [self.note["id"]]}), [
            fala(f"**Notebook** por {valor}. [Ver no site](link_do_produto)"),
        ], self.cat)
        t = r["respostas"][0]["texto"]
        self.assertTrue(t.startswith("*Notebook*"))
        self.assertNotIn("](", t)

    def test_venda_no_cartao_usa_o_preco_de_cartao(self):
        dados = {"nome": "Thiago Teste", "pagamento": "cartao", "entrega": "retirada", "cpf_cnpj": CPF_BOM}
        r, _ = atender(trabalho("sim, pode fechar no cartão", dados=dados, memoria=self._com_orcamento()), [chamada("emitir_venda"), fala("Obrigada!")], self.cat)
        p = self.cat.produto(self.note["id"])
        self.assertEqual(r["acoes"][0]["total"], round(preco(p["price_card"]), 2))
        self.assertIn("Total no cartão: " + reais(preco(p["price_card"])), r["respostas"][-1]["texto"])

    def test_venda_automatica_desligada_chama_vendedor(self):
        r, _ = atender(trabalho("sim", memoria=self._com_orcamento(), venda_auto=False), [chamada("emitir_venda"), fala("Um vendedor já fala com você.")], self.cat)
        self.assertEqual(r["acoes"], [])
        self.assertTrue(r["transferir"])

    def test_salvar_dados_valida(self):
        r, o = atender(trabalho("meu cpf é 12345678900"), [
            chamada("salvar_dados", nome="  Maria   da Silva ", cpf_cnpj="123.456.789-00", uf="xx", hack="1"),
            fala("Pode conferir o CPF?"),
        ], self.cat)
        self.assertEqual(r["dados"].get("nome"), "Maria da Silva")
        self.assertNotIn("cpf_cnpj", r["dados"])
        self.assertNotIn("hack", r["dados"])
        self.assertNotIn("uf", r["dados"])

    def test_concorrente_e_custo_barrados(self):
        r, _ = atender(trabalho("na kabum é mais barato"), [fala("Na KaBuM o custo é outro."), fala("Na Kabum mesmo.")], self.cat)
        self.assertNotIn("abum", r["respostas"][0]["texto"])
        self.assertTrue(r["transferir"])

    def test_no_maximo_tres_cartoes(self):
        ids = [x["id"] for x in self.cat.buscar("notebook")][:5]
        roteiro = [chamada("buscar_produtos", busca="notebook")] + [chamada("mostrar_produto", id=i) for i in ids] + [fala("Olha essas!")]
        r, _ = atender(trabalho("notebooks"), roteiro, self.cat)
        self.assertEqual(len([x for x in r["respostas"] if x["tipo"] == "produto"]), 3)


class TestRapidez(unittest.TestCase):
    """O que deixa cada resposta mais rápida (12/10/2026: no PC da loja levava de 18 a 86 s)."""

    def setUp(self):
        self.cat = catalogo()

    def test_primeiro_pedido_de_produto_ja_vai_com_a_busca(self):
        nid = self.cat.buscar("notebook")[0]["id"]
        r, o = atender(trabalho("oi, quero um notebook pra estudar, até 3 mil"), [
            chamada("mostrar_produto", id=nid), fala("Este serve bem para estudar. Quer ver outros?")], self.cat)
        self.assertEqual(len(o.recebidas), 2, "mostrar + responder; sem pergunta antes e sem empurrão")
        busca = o.recebidas[0]["mensagens"][-2]["tool_calls"][0]["function"]["arguments"]
        self.assertEqual(busca["preco_maximo"], 3000.0, "'até 3 mil' vira preço máximo")
        self.assertEqual(r["respostas"][1], {"tipo": "produto", "produtoId": nid})

    def test_sem_tipo_de_produto_nao_busca_antes(self):
        _, o = atender(trabalho("bom dia, tudo bem?"), [fala("Bom dia! Como posso ajudar?")], self.cat)
        self.assertFalse(any(m["role"] == "tool" for m in o.recebidas[0]["mensagens"]))

    def test_resposta_comprida_e_encurtada_sem_outra_ida_ao_modelo(self):
        longo = "Este notebook é ótimo para o dia a dia. " * 20 + "Quer que eu faça o orçamento?"
        mem = {"mostrados": [], "produtos": {}}
        r, o = atender(trabalho("me fala mais", memoria=mem), [fala(longo), fala("não devia ser chamado")], self.cat)
        self.assertEqual(len(o.recebidas), 1)
        texto = r["respostas"][0]["texto"]
        self.assertLessEqual(len(texto), R.LIMITE_DE_TEXTO)
        self.assertTrue(texto.endswith("Quer que eu faça o orçamento?"), "a pergunta do fim fica")

    def test_passou_do_prazo_chama_vendedor_em_vez_de_deixar_esperando(self):
        def demora(_mensagens):
            raise TimeoutError("timed out")

        r, _ = atender(trabalho("bom dia, tudo bem?"), [demora], self.cat)
        self.assertIn("vendedor", r["respostas"][0]["texto"])
        self.assertIn("demorou", r["transferir"]["motivo"])

    def test_passou_do_prazo_depois_de_escolher_os_produtos_manda_os_produtos(self):
        nid = self.cat.buscar("notebook")[0]["id"]

        def demora(_mensagens):
            raise TimeoutError("timed out")

        r, _ = atender(trabalho("quero um notebook"), [chamada("mostrar_produto", id=nid), demora], self.cat)
        self.assertIsNone(r["transferir"])
        self.assertIn("opções", r["respostas"][0]["texto"])
        self.assertEqual(r["respostas"][1], {"tipo": "produto", "produtoId": nid})

    def test_historico_so_da_conversa_de_agora(self):
        from cerebro import conversa_atual

        hora = 3600 * 1000
        agora = 1_800_000_000_000
        msgs = [{"id": "velha", "de": "cliente", "texto": "mensagem de anteontem", "em": agora - 48 * hora}]
        msgs += [{"id": f"v{i}", "de": "loja", "texto": "lista de preços " * 100, "em": agora - hora + i} for i in range(3)]
        msgs += [{"id": f"c{i}", "de": "cliente", "texto": f"pergunta {i}", "em": agora - 30 * 60_000 + i} for i in range(20)]
        r = conversa_atual(msgs)
        ids = [m["id"] for m in r]
        self.assertNotIn("velha", ids, "mais de 24 h antes da última sai")
        self.assertLessEqual(len(r), 16)
        self.assertEqual(ids[-1], "c19")
        self.assertTrue(all(len(m["texto"]) <= 610 for m in r if m["de"] != "cliente"), "mensagem comprida de vendedor é cortada")
        self.assertEqual(msgs[1]["texto"], "lista de preços " * 100, "não mexe na lista recebida")

    def test_conversas_ao_mesmo_tempo_deixa_uma_vaga_para_a_ura(self):
        import julia

        self.assertEqual(julia.conversas_ao_mesmo_tempo({"paralelo": 2}, 3), 2)
        self.assertEqual(julia.conversas_ao_mesmo_tempo({"paralelo": 2}, 2), 1)
        self.assertEqual(julia.conversas_ao_mesmo_tempo({"paralelo": 2}, 0), 1, "sem saber, uma por vez")
        self.assertEqual(julia.conversas_ao_mesmo_tempo({"paralelo": 1}, 4), 1)

    def test_midia_que_falhou_nao_e_baixada_de_novo(self):
        from sentidos import Sentidos

        baixadas = []

        def baixar(ident):
            baixadas.append(ident)
            raise RuntimeError("não abriu")

        s = Sentidos({}, None, baixar=baixar, registrar=lambda *_: None)
        memoria = {}
        msgs = [{"id": "a1", "de": "cliente", "tipo": "ptt", "texto": "", "midia": {"id": "a1"}}]
        s.entender([dict(m) for m in msgs], memoria)
        s.entender([dict(m) for m in msgs], memoria)
        self.assertEqual(baixadas, ["a1"])
        self.assertEqual(memoria["midiaQueFalhou"], ["a1"])

    def test_audio_vai_pelo_ffmpeg_e_nao_pelo_pyav(self):
        import shutil
        import subprocess
        from sentidos import Sentidos

        if not shutil.which("ffmpeg"):
            self.skipTest("sem ffmpeg")
        # 1 s de tom em ogg/opus, como o áudio do WhatsApp.
        ogg = subprocess.run(["ffmpeg", "-loglevel", "error", "-f", "lavfi", "-i", "sine=frequency=440:duration=1",
                              "-c:a", "libopus", "-f", "ogg", "pipe:1"], capture_output=True, check=True).stdout
        amostras = Sentidos.amostras_de_audio(ogg)
        self.assertIsNotNone(amostras)
        self.assertTrue(15000 < len(amostras) < 17000, "16 mil amostras por segundo, mono")

        recebido = {}

        class WhisperFalso:
            def transcribe(self, entrada, **_):
                recebido["tipo"] = type(entrada).__name__
                return [type("S", (), {"text": " oi"})()], None

        s = Sentidos({}, None, baixar=None)
        s._whisper = WhisperFalso()
        self.assertEqual(s.transcrever(ogg), "oi")
        self.assertEqual(recebido["tipo"], "ndarray", "o Whisper recebe as amostras, não o arquivo")


class TestBling(unittest.TestCase):
    def setUp(self):
        self.tok = Path(tempfile.mkdtemp()) / "bling_tokens.json"
        self.tok.write_text(json.dumps({"access_token": "abc"}))
        self.chamadas = []
        self.respostas = []

    def http(self, url, metodo="GET", dados=None, cabecalhos=None, espera=30):
        self.chamadas.append((metodo, url, dados, cabecalhos))
        r = self.respostas.pop(0)
        if isinstance(r, Exception):
            raise r
        return r

    def bling(self):
        return Bling(str(self.tok), http=self.http, dormir=lambda s: None, vendedor_id=123)

    def test_proposta(self):
        self.respostas = [{"data": [{"id": 77}]}, {"data": {"id": 9}}, {"data": {"numero": 14400}}]
        b = self.bling()
        c = b.contato_para({"cpf_cnpj": CPF_BOM}, "5519984515960")
        p = b.criar_proposta(c, [{"id": "1", "nome": "Notebook", "quantidade": 1, "valor": 10.5}], observacoes="o", observacao_interna="i")
        self.assertEqual(p, {"id": 9, "numero": "14400"})
        metodo, url, corpo, cab = self.chamadas[1]
        self.assertEqual(metodo, "POST")
        self.assertTrue(url.endswith("/propostas-comerciais"))
        self.assertEqual(corpo["contato"], {"id": 77})
        self.assertEqual(corpo["itens"][0]["produto"], {"descricao": "Notebook"})
        self.assertEqual(corpo["itens"][0]["codigo"], "SITE-1")
        self.assertEqual(corpo["vendedor"], {"id": 123})
        self.assertEqual(cab["Authorization"], "Bearer abc")

    def test_pedido_com_parcela_quando_a_conta_exige(self):
        exige = ErroHttp(400, json.dumps({"error": {"description": "Informe as parcelas"}}), "x")
        self.respostas = [exige, {"data": [{"id": 5, "descricao": "PIX"}]}, {"data": {"id": 3}}, {"data": {"numero": 24900}}]
        p = self.bling().criar_pedido(1, [{"id": "1", "nome": "N", "quantidade": 2, "valor": 10}], observacoes="o",
                                      observacoes_internas="i", pagamento="pix")
        self.assertEqual(p["numero"], "24900")
        corpo = self.chamadas[2][2]
        self.assertEqual(corpo["parcelas"][0]["valor"], 20)
        self.assertEqual(corpo["parcelas"][0]["formaPagamento"], {"id": 5})

    def test_401_espera_a_sentinela_e_nunca_renova(self):
        self.respostas = [ErroHttp(401, "invalid_token", "x"), {"data": []}]
        self.bling().achar_contato(documento=CPF_BOM)
        self.assertEqual(len(self.chamadas), 2)
        self.assertNotIn("oauth", " ".join(c[1] for c in self.chamadas))
        self.assertEqual(json.loads(self.tok.read_text()), {"access_token": "abc"}, "o arquivo de tokens não é tocado")

    def test_mensagem_de_erro_legivel(self):
        from bling import mensagem_de_erro

        e = ErroHttp(400, json.dumps({"error": {"description": "Contato inválido", "fields": [{"msg": "CPF já existe"}]}}), "x")
        self.assertIn("Contato inválido; CPF já existe", mensagem_de_erro(e))

    def test_simulado_nao_chama_nada(self):
        b = Bling(str(self.tok), simular=True, http=self.http)
        self.assertTrue(b.criar_pedido(1, [], observacoes="", observacoes_internas="")["numero"].startswith("TESTE-"))
        self.assertEqual(self.chamadas, [])


class TestTrabalhador(unittest.TestCase):
    def test_rodada_completa_com_audio(self):
        import julia

        class VpsFalsa:
            def __init__(self):
                self.resultados = []
                self.batidas = []

            def trabalho(self):
                return {"trabalho": {**trabalho("oi"), "mensagens": [
                    {"id": "a1", "de": "cliente", "tipo": "ptt", "texto": "", "midia": {"id": "a1", "mimetype": "audio/ogg"}}]}}

            def resultado(self, r):
                self.resultados.append(r)
                return {"ok": True}

            def batida(self, info):
                self.batidas.append(info)
                return {}

            def catalogo(self):
                return AMOSTRA

            def midia(self, ident):
                return b"OggS-falso", "audio/ogg"

        cfg = {"ollama_url": "http://x", "modelo": "qwen3:14b", "pasta_dados": tempfile.mkdtemp(), "bling_tokens": "/x",
               "respeitar_placa": False, "contexto": 4096}
        vps = VpsFalsa()
        t = julia.Trabalhador(cfg, vps)
        nid = catalogo().buscar("notebook")[0]["id"]
        valor = catalogo().buscar("notebook")[0]["preco_a_vista_pix"]
        # O cliente disse "notebook" (no áudio): o código já busca antes de chamar o
        # modelo, e ele vai direto mostrar e responder.
        t.ollama = FalsoOllama([
            chamada("mostrar_produto", id=nid),
            fala(f"Separei este, {valor} no Pix. Para estudar ou jogar?"),
        ])
        t.ollama.carregados = lambda: []
        t.sentidos.transcrever = lambda conteudo, sufixo=".ogg": "quero um notebook"
        self.assertTrue(t.uma_rodada())
        r = vps.resultados[0]
        self.assertEqual(r["transcricoes"], [{"id": "a1", "texto": "quero um notebook"}])
        self.assertEqual(r["chatId"], "5519984515960@c.us")
        self.assertIn("Para estudar", r["respostas"][0]["texto"])
        self.assertEqual(r["respostas"][1], {"tipo": "produto", "produtoId": nid})
        self.assertEqual(len(t.ollama.recebidas), 2, "duas idas ao modelo, sem empurrão")
        primeira = t.ollama.recebidas[0]["mensagens"]
        self.assertIn("[áudio do cliente: quero um notebook]", primeira[-3]["content"])
        self.assertEqual(primeira[-2]["tool_calls"][0]["function"]["arguments"], {"busca": "quero um notebook"},
                         "a busca usa a fala do áudio, sem o rótulo")
        self.assertEqual(primeira[-1]["role"], "tool")
        self.assertEqual(vps.batidas[0]["modelo"], "qwen3:14b")

    def test_bling_simulado_no_modo_teste(self):
        import julia

        cfg = {"ollama_url": "http://x", "modelo": "m", "pasta_dados": tempfile.mkdtemp(), "bling_tokens": "/x", "respeitar_placa": False}
        t = julia.Trabalhador(cfg, None)
        self.assertTrue(t.bling_para({"config": {"publico": "teste"}}).simular)
        self.assertFalse(t.bling_para({"config": {"publico": "clientes"}}).simular)
        t.cfg["bling_no_teste"] = True
        self.assertFalse(t.bling_para({"config": {"publico": "teste"}}).simular)


if __name__ == "__main__":
    unittest.main()
