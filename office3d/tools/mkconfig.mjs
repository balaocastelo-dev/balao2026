import fs from 'fs';
import { DEFAULT_CONFIG } from '../src/config.js';
const body = JSON.stringify(DEFAULT_CONFIG, null, 2).replace(/"([a-zA-Z_]\w*)":/g, '$1:');
fs.writeFileSync('app/config.snippet.html', `<script>
/* ============================================================================
   CONFIGURAÇÃO DO ESCRITÓRIO  —  pode editar à vontade.
   - name / role / desc: textos que aparecem nas etiquetas e no cartão.
   - workLabel: o que a pessoa "está fazendo" quando está no posto.
   - errands: tarefas que ela faz fora da mesa (rótulo e duração em segundos).
   Não mexa em: id, avatar, seat, kind, spot, role dentro de errands.
   O motor 3D e os modelos ficam na pasta "office3d" ao lado deste arquivo.
   ========================================================================== */
window.OFFICE_CONFIG = ${body};
</script>`);
console.log('config ok', body.length);
