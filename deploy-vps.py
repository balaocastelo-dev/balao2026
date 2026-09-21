"""
Dispara o deploy do servidor de WhatsApp na VPS.

A SENHA NÃO MORA AQUI. Esta versão lia a senha de root escrita no próprio
arquivo — num repositório PÚBLICO, baixável por qualquer um em
raw.githubusercontent.com. Quem tivesse o link entrava na VPS como root:
as duas sessões de WhatsApp, as conversas dos clientes, a senha de app do
Gmail no /etc/balao.env.

Agora a senha vem, nesta ordem:
  1. da variável de ambiente VPS_SENHA, se existir;
  2. senão, é pedida na hora, sem aparecer na tela.

Nunca volte a escrever a senha neste arquivo. Se quiser automatizar de vez,
o caminho certo é chave SSH (sem senha nenhuma trafegando).
"""
import getpass
import os
import sys

import paramiko

SERVER_IP = os.environ.get("VPS_HOST", "179.199.148.87")
USERNAME = os.environ.get("VPS_USUARIO", "root")


def pegar_senha() -> str:
    senha = os.environ.get("VPS_SENHA", "").strip()
    if senha:
        return senha
    return getpass.getpass(f"Senha de {USERNAME}@{SERVER_IP}: ")


def deploy():
    senha = pegar_senha()
    if not senha:
        print("[!] Sem senha, sem deploy.")
        sys.exit(1)

    print(f"[*] Conectando a {USERNAME}@{SERVER_IP}...")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        ssh.connect(SERVER_IP, port=22, username=USERNAME, password=senha, timeout=15)
        print("[+] Conectado. Disparando deploy...")
        stdin, stdout, stderr = ssh.exec_command("bash /opt/balao2026/whatsapp-server/deploy-vps.sh")
        for line in iter(stdout.readline, ""):
            print(line, end="", flush=True)
        err = stderr.read().decode("utf-8", errors="replace").strip()
        if err:
            print("\n[STDERR]:", err)
        print("\n[ok] Deploy na VPS concluido.")
    except Exception as e:
        print(f"[!] Erro ao conectar ou executar deploy: {e}")
        sys.exit(1)
    finally:
        ssh.close()


if __name__ == "__main__":
    deploy()
