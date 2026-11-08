# App Android do Balão da Informática

Casca **Capacitor** que abre `https://www.balao.info` ao vivo. Não tem conteúdo
embutido: o que muda no site já aparece no app, sem reenviar nada.

O app se identifica para a loja injetando `BalaoApp` no User-Agent
(`capacitor.config.ts` → `appendUserAgent`). Com isso a loja dá **15% a mais de
desconto no Pix** em qualquer produto, aplicado de verdade no servidor
(`lib/app-balao.ts` e `app/api/checkout/route.ts` no site).

## Como o APK é gerado

Pelo GitHub Actions: `.github/workflows/apk.yml`. A cada execução (manual ou ao
mexer em `app-mobile/**` na `main`), ele compila o APK na nuvem e publica numa
_release_ com o arquivo `balao-da-informatica.apk`. A página `/apk` do site
aponta sempre para a release mais nova.

Para rodar o workflow na mão: aba **Actions** do repositório → **Build APK do
app** → **Run workflow**.

## Build local (opcional)

Precisa de Node, JDK 17 e Android SDK.

```bash
cd app-mobile
npm install
npx cap add android     # só na primeira vez
npx cap sync android
cd android && ./gradlew assembleDebug
# APK em android/app/build/outputs/apk/debug/app-debug.apk
```

## Assinatura (quando quiser tirar o aviso de "debug")

O workflow gera um APK **debug**, que instala por download sem problema. Para um
APK **release** assinado (recomendado se um dia for para a Play Store), crie uma
keystore e guarde como secrets no GitHub; depois trocar `assembleDebug` por
`assembleRelease` com a assinatura. Peça que a gente configura.
