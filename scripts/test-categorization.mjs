import fs from 'fs';

const filePath = 'C:\\Users\\user\\Desktop\\PRODUTOS APENAS KABUM';
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n').map(l => l.trim()).filter(l => l.length > 0);

console.log(`Total lines: ${lines.length}`);

function categorize(name) {
  const n = name.toLowerCase();
  
  if (n.includes('notebook') || n.includes('laptop') || n.includes('macbook') || n.includes('chromebook')) {
    return 'Notebooks Seminovos';
  }
  if (n.includes('computador gamer') || n.includes('pc gamer') || n.includes('desktop gamer') || (n.includes('computador') && (n.includes('core') || n.includes('ryzen')))) {
    return 'Computadores';
  }
  if (n.includes('placa de vídeo') || n.includes('placa de video') || n.includes('geforce') || n.includes('radeon') || n.includes('rtx') || n.includes('gtx') || n.includes('rx 6') || n.includes('rx 7')) {
    return 'Hardware';
  }
  if (n.includes('processador') || n.includes('intel core') || n.includes('amd ryzen') || n.includes('placa-mãe') || n.includes('placa mae') || n.includes('placa mãe') || n.includes('memória ram') || n.includes('memoria ram') || n.includes('ddr4') || n.includes('ddr5') || n.includes('ssd') || n.includes('nvme') || n.includes('fonte ') || n.includes('water cooler') || n.includes('cooler') || n.includes('gabinete')) {
    return 'Hardware';
  }
  if (n.includes('monitor') || n.includes('displayport') || n.includes('144hz') || n.includes('165hz') || n.includes('240hz') || n.includes('ips') || n.includes('full hd') || n.includes('curvo')) {
    return 'Monitores';
  }
  if (n.includes('teclado') || n.includes('mouse') || n.includes('headset') || n.includes('fone') || n.includes('mousepad') || n.includes('microfone') || n.includes('webcam') || n.includes('som gamer') || n.includes('caixa de som')) {
    return 'Periféricos';
  }
  if (n.includes('cadeira gamer') || n.includes('console') || n.includes('playstation') || n.includes('ps5') || n.includes('ps4') || n.includes('xbox') || n.includes('nintendo') || n.includes('controle') || n.includes('gamepad') || n.includes('jogos')) {
    return 'Games';
  }
  if (n.includes('smartphone') || n.includes('celular') || n.includes('iphone') || n.includes('galaxy') || n.includes('xiaomi') || n.includes('redmi') || n.includes('motorola')) {
    return 'Smartphones';
  }
  if (n.includes('cabo') || n.includes('adaptador') || n.includes('filtro de linha') || n.includes('hub') || n.includes('suporte') || n.includes('pasta térmica') || n.includes('pendrive') || n.includes('carregador')) {
    return 'Acessórios';
  }
  if (n.includes('impressora') || n.includes('toner') || n.includes('cartucho') || n.includes('papel') || n.includes('scanner') || n.includes('filamento')) {
    return 'Impressão';
  }
  if (n.includes('roteador') || n.includes('switch') || n.includes('câmera') || n.includes('camera') || n.includes('dvr') || n.includes('nobreak') || n.includes('fechadura') || n.includes('alarme') || n.includes('sensor')) {
    return 'Segurança';
  }
  if (n.includes('windows') || n.includes('office') || n.includes('antivírus') || n.includes('licença')) {
    return '🔑  Licenças';
  }

  return 'Hardware';
}

const stats = {};
let validCount = 0;

for (let i = 1; i < lines.length; i++) {
  const parts = lines[i].split('\t');
  if (parts.length < 4) continue;
  const name = parts[2];
  const cat = categorize(name);
  stats[cat] = (stats[cat] || 0) + 1;
  validCount++;
}

console.log(`Valid products parsed: ${validCount}`);
console.log("Distribution by category:", stats);
