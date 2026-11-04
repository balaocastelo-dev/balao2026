/**
 * Endereços do instalador Windows.
 *
 * Arquivo sem alias e sem outro import de propósito: o next.config.ts
 * importa daqui, e o compilador desse arquivo não resolve "@/".
 *
 * O .exe não mora em public/. O Electron empacotado passa de dezenas de MB
 * e o file tracer da Vercel já estourou 250 MB quando public/ entrou na
 * função. /downloads/MyBots-Setup.exe redireciona para a Release.
 */

export const URL_INSTALADOR_WINDOWS = "/downloads/MyBots-Setup.exe";
export const NOME_INSTALADOR_WINDOWS = "MyBots-Setup.exe";
export const URL_RELEASE_WINDOWS =
  "https://github.com/balaocastelo-dev/balao2026/releases/download/mybots-windows-1.0.0/MyBots-Setup.exe";
