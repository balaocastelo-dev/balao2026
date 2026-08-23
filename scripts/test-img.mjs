import https from 'https';

const urlOriginal = "https://images.kabum.com.br/produtos/fotos/1003732/fonte-msi-mag-a1200pls-pcie5-1200w-80-plus-platinum-modular-silent-pfc-ativo-com-cabo-preto-maga1200plspcie5_1782994129_m.jpg";
const urlGg = urlOriginal.replace('_m.jpg', '_gg.jpg');

function testUrl(u) {
  return new Promise((resolve) => {
    https.get(u, (res) => {
      resolve({ url: u, status: res.statusCode });
    }).on('error', () => resolve({ url: u, status: 500 }));
  });
}

async function run() {
  console.log(await testUrl(urlOriginal));
  console.log(await testUrl(urlGg));
}
run();
