const { app, BrowserWindow, shell } = require("electron");
const path = require("path");
const { URL_PAINEL, podeFicarNaJanela, agenteSemElectron } = require("./enderecos");

const ID_DO_APP = "info.balao.mybots";
const ICONE = path.join(__dirname, "icon.png");

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.setAppUserModelId(ID_DO_APP);
  app.whenReady().then(() => {
    app.userAgentFallback = agenteSemElectron(app.userAgentFallback);
    const janela = criarJanela();
    app.on("second-instance", () => {
      if (janela.isMinimized()) janela.restore();
      janela.show();
      janela.focus();
    });
  });
  app.on("window-all-closed", () => app.quit());
}

function criarJanela() {
  const janela = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 800,
    minHeight: 600,
    title: "MyBots",
    icon: ICONE,
    autoHideMenuBar: true,
    backgroundColor: "#070414",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  janela.webContents.setUserAgent(agenteSemElectron(janela.webContents.getUserAgent()));
  janela.webContents.on("page-favicon-updated", () => {
    janela.setIcon(ICONE);
  });
  janela.webContents.setWindowOpenHandler(({ url }) => {
    if (podeFicarNaJanela(url)) return { action: "allow" };
    shell.openExternal(url);
    return { action: "deny" };
  });
  janela.webContents.on("will-navigate", (evento, url) => {
    if (podeFicarNaJanela(url)) return;
    evento.preventDefault();
    shell.openExternal(url);
  });

  janela.loadURL(URL_PAINEL);
  return janela;
}
