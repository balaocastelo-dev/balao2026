import sys
import paramiko

SERVER_IP = "179.199.148.87"
USERNAME = "root"
PASSWORD = "J6t2hybt26@@@56676009@@"

def deploy():
    print(f"[*] Conectando a {USERNAME}@{SERVER_IP}...")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        ssh.connect(SERVER_IP, port=22, username=USERNAME, password=PASSWORD, timeout=15)
        print("[+] Conectado com sucesso. Disparando deploy...")
        stdin, stdout, stderr = ssh.exec_command('bash /opt/balao2026/whatsapp-server/deploy-vps.sh')
        for line in iter(stdout.readline, ''):
            print(line, end='', flush=True)
        err = stderr.read().decode('utf-8', errors='replace').strip()
        if err:
            print("\n[STDERR]:", err)
        print("\n[✓] Deploy na VPS concluído com sucesso!")
    except Exception as e:
        print(f"[!] Erro ao conectar ou executar deploy: {e}")
        sys.exit(1)
    finally:
        ssh.close()

if __name__ == "__main__":
    deploy()
