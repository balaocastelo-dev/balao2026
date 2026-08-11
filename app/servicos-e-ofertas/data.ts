import { 
  Wrench, 
  Cpu, 
  HardDrive, 
  Wifi, 
  Database, 
  Smartphone, 
  Droplets,
  ShieldCheck,
  Zap,
  Monitor,
  Printer,
  FileCode,
  Mail,
  Server,
  Thermometer,
  Layers,
  Settings,
  Lock,
  Share2,
  Disc,
  Stethoscope,
  Activity,
  Palette,
  Headphones,
  ClipboardList,
  FileText
} from 'lucide-react'

export const SERVICE_CATEGORIES = [
  {
    id: 'software',
    title: 'Software e Sistema Operacional',
    description: 'Soluções completas para manter seu sistema rápido, seguro e atualizado.',
    icon: FileCode
  },
  {
    id: 'hardware',
    title: 'Hardware e Reparo Físico',
    description: 'Consertos especializados em componentes eletrônicos e estruturais.',
    icon: Wrench
  },
  {
    id: 'network',
    title: 'Redes e Conectividade',
    description: 'Infraestrutura de rede estável para sua casa ou empresa.',
    icon: Wifi
  },
  {
    id: 'performance',
    title: 'Otimização e Performance',
    description: 'Extraia o máximo desempenho do seu equipamento.',
    icon: Zap
  },
  {
    id: 'corporate',
    title: 'Corporativo e Consultoria',
    description: 'Serviços profissionais para empresas e seguradoras.',
    icon: Server
  }
]

export const ALL_SERVICES = [
  // Software e Sistema
  {
    categoryId: 'software',
    title: "Formatação com Backup Completo",
    shortDescription: "Instalação limpa do sistema mantendo todos os seus arquivos seguros.",
    icon: Database,
    details: ["Backup de Arquivos", "Instalação de Drivers", "Atualização do Windows", "Programas Básicos"],
    longDescription: "A formatação profissional não é apenas apagar tudo. Realizamos um backup meticuloso de seus documentos, fotos, downloads e até favoritos do navegador antes de qualquer procedimento. Após a formatação, devolvemos os arquivos organizados nas pastas originais, garantindo que você não perca nada importante.",
    symptoms: ["Windows lento ou travando", "Erros de tela azul", "Muitos programas desnecessários", "Vírus persistentes"],
    process: ["Backup completo dos dados do usuário", "Formatação de baixo nível (Zero Fill) se necessário", "Instalação limpa do Sistema Operacional", "Restauração dos dados", "Instalação de drivers atualizados"],
    time: "1 dia útil",
    warranty: "30 dias (Software)",
    image: "/images/services/formatacao.jpg"
  },
  {
    categoryId: 'software',
    title: "Instalação do Windows 11/10",
    shortDescription: "Sistema operacional original, atualizado e ativado.",
    icon: FileCode,
    details: ["Licença Original", "Última Versão (23H2)", "Otimização Inicial", "Remoção de Bloatware"],
    longDescription: "Instalamos a versão mais recente e estável do Windows 10 ou 11, compatível com seu hardware. Configuramos a privacidade, desativamos telemetria desnecessária e removemos softwares pré-instalados (bloatware) que deixam o computador lento. Garantimos a ativação correta com sua licença digital ou chave de produto.",
    symptoms: ["Computador sem sistema", "Upgrade do Windows 7/8", "Erro de ativação do Windows", "Necessidade de reinstalação limpa"],
    process: ["Verificação de requisitos de hardware (TPM 2.0)", "Criação de mídia de instalação atualizada", "Instalação do sistema", "Configuração de conta Microsoft/Local", "Atualização via Windows Update"],
    time: "4 horas",
    warranty: "30 dias (Garantia de funcionamento do sistema)",
    image: "/images/services/windows.jpg"
  },
  {
    categoryId: 'software',
    title: "Remoção de Vírus e Malware",
    shortDescription: "Limpeza profunda de ameaças digitais e proteção.",
    icon: ShieldCheck,
    details: ["Varredura Profunda", "Remoção de Spyware", "Proteção Ransomware", "Instalação de Antivírus"],
    longDescription: "Utilizamos ferramentas profissionais para detectar e eliminar vírus, trojans, spyware, adware e ransomware que antivírus comuns deixam passar. Após a limpeza, verificamos a integridade dos arquivos do sistema e instalamos soluções de proteção para prevenir novas infecções.",
    symptoms: ["Pop-ups de propaganda constantes", "Arquivos encriptados ou renomeados", "Navegador redirecionando sozinho", "Lentidão extrema repentina"],
    process: ["Isolamento da máquina da rede", "Varredura com múltiplos motores de detecção", "Remoção manual de entradas de registro maliciosas", "Correção de políticas de grupo alteradas", "Instalação de proteção"],
    time: "1 dia útil",
    warranty: "7 dias (Reinfecção depende do uso)",
    image: "/images/services/virus.jpg"
  },
  {
    categoryId: 'software',
    title: "Instalação de Pacote Office",
    shortDescription: "Word, Excel, PowerPoint configurados e prontos para uso.",
    icon: FileText,
    details: ["Office 365/2021", "Configuração de Conta", "Atualizações", "Suporte a Erros"],
    longDescription: "Instalação completa e configuração da suíte Microsoft Office (Word, Excel, PowerPoint, Outlook). Resolvemos problemas de ativação, erros de instalação e conflitos com versões anteriores. Auxiliamos na configuração da sua conta Microsoft 365 para sincronização na nuvem (OneDrive).",
    symptoms: ["Office não abre", "Erro de ativação", "Arquivos não salvam", "Necessidade da versão mais nova"],
    process: ["Remoção de versões antigas/conflitantes", "Download da versão oficial", "Instalação personalizada", "Login e Ativação", "Teste de todos os aplicativos"],
    time: "2 horas",
    warranty: "30 dias",
    image: "/images/services/office.jpg"
  },
  {
    categoryId: 'software',
    title: "Configuração de Outlook/E-mail",
    shortDescription: "Seus e-mails sincronizados, organizados e com backup.",
    icon: Mail,
    details: ["POP3/IMAP/Exchange", "Migração de E-mails", "Backup de PST", "Assinatura HTML"],
    longDescription: "Configuração profissional de contas de e-mail corporativo ou pessoal no Microsoft Outlook, Thunderbird ou Mail do Mac. Resolvemos problemas de sincronização, erro de envio/recebimento, configuração de portas SSL/TLS e realizamos backup de arquivos de dados (.PST) para evitar perda de histórico.",
    symptoms: ["Outlook não conecta", "Senha pedindo toda hora", "Caixa de entrada cheia", "E-mails somem do servidor"],
    process: ["Análise das configurações do servidor", "Configuração correta de portas e criptografia", "Criação de novo perfil se necessário", "Importação de backups antigos", "Teste de envio e recebimento"],
    time: "2 a 4 horas",
    warranty: "30 dias",
    image: "/images/services/outlook.jpg"
  },
  {
    categoryId: 'software',
    title: "Atualização de BIOS",
    shortDescription: "Mantenha sua placa-mãe compatível e estável.",
    icon: Settings,
    details: ["Suporte a Novos CPUs", "Correção de Bugs", "Melhoria de RAM", "Segurança"],
    longDescription: "A atualização de BIOS/UEFI é crítica para garantir compatibilidade com novos processadores, melhorar a estabilidade da memória RAM e corrigir falhas de segurança. Realizamos o procedimento com nobreak para garantir total segurança durante a gravação do firmware.",
    symptoms: ["PC não reconhece processador novo", "Instabilidade com memória XMP", "Problemas de compatibilidade USB", "Correção de segurança recomendada"],
    process: ["Identificação exata do modelo da placa", "Download do firmware oficial", "Backup da BIOS atual", "Flash via utilitário seguro", "Reconfiguração otimizada da BIOS"],
    time: "1 hora",
    warranty: "Garantia de sucesso do procedimento",
    image: "/images/services/bios.jpg"
  },
  {
    categoryId: 'software',
    title: "Correção de BIOS Corrompida",
    shortDescription: "Recuperação de placa-mãe morta por falha de BIOS.",
    icon: Zap,
    details: ["Regravação de EPROM", "Programador CH341A", "Backup de Arquivo", "Ressolda de Chip"],
    longDescription: "Se uma atualização de BIOS falhou ou o chip corrompeu, o computador não liga. Utilizamos gravadores de EPROM externos para reprogramar o chip da BIOS diretamente na placa, recuperando placas-mãe que seriam descartadas.",
    symptoms: ["PC liga mas não dá vídeo", "Loop infinito de reinicialização", "Falha após atualização de BIOS", "Tela preta permanente"],
    process: ["Desmontagem da placa-mãe", "Identificação do chip BIOS", "Conexão com gravador externo", "Gravação de arquivo binário limpo", "Teste de post"],
    time: "1 a 2 dias úteis",
    warranty: "3 meses",
    image: "/images/services/bios-recovery.jpg"
  },

  // Hardware e Reparo Físico
  {
    categoryId: 'hardware',
    title: "Upgrade de Placa de Vídeo",
    shortDescription: "Instalação correta para máximo desempenho gráfico.",
    icon: Cpu,
    details: ["Verificação de Fonte", "Remoção de Drivers Antigos", "Instalação Física", "Teste de Stress"],
    longDescription: "Instalamos sua nova GPU garantindo que sua fonte de alimentação suporte a carga e que não haja gargalo (bottleneck) severo com o processador. Utilizamos DDU para limpar drivers antigos e instalamos os drivers mais recentes para garantir estabilidade em jogos.",
    symptoms: ["Quer rodar jogos mais pesados", "Placa atual queimou", "Artefatos na tela", "Upgrade para edição de vídeo"],
    process: ["Cálculo de consumo de energia (TDP)", "Troca física da placa", "Gerenciamento de cabos de energia", "Instalação limpa de drivers", "Benchmark (3DMark)"],
    time: "2 horas",
    warranty: "3 meses (Mão de obra)",
    image: "/images/services/gpu.jpg"
  },
  {
    categoryId: 'hardware',
    title: "Troca de Fonte de Alimentação",
    shortDescription: "Energia estável e segura para seu computador.",
    icon: Zap,
    details: ["Dimensionamento de Potência", "Instalação Modular", "Organização de Cabos", "Teste de Voltagens"],
    longDescription: "A fonte é o coração do PC. Trocamos fontes queimadas ou genéricas por modelos de qualidade (80 Plus/PFC Ativo). Realizamos o cálculo de consumo do seu setup para recomendar a potência ideal, evitando desligamentos e protegendo seus componentes.",
    symptoms: ["PC não liga", "Cheiro de queimado", "Desligamentos aleatórios", "Ruído elétrico alto"],
    process: ["Teste da fonte antiga", "Remoção e limpeza interna", "Instalação da nova fonte", "Cable Management profissional", "Teste de estabilidade"],
    time: "2 horas",
    warranty: "3 meses (Mão de obra)",
    image: "/images/services/psu.jpg"
  },
  {
    categoryId: 'hardware',
    title: "Reparo de Carcaça e Dobradiças",
    shortDescription: "Restauração estrutural de notebooks quebrados.",
    icon: Layers,
    details: ["Reconstrução com Resina", "Troca de Dobradiças", "Aperto Técnico", "Pintura Local"],
    longDescription: "Notebooks frequentemente quebram na região das dobradiças, impossibilitando abrir/fechar a tela. Realizamos a reconstrução das bases de fixação com resinas industriais de alta resistência ou a troca completa das peças, devolvendo a mobilidade e estética original do equipamento.",
    symptoms: ["Estalo ao abrir o notebook", "Carcaça abrindo na lateral", "Tela frouxa ou não para em pé", "Peças plásticas caindo"],
    process: ["Desmontagem total da tela/base", "Limpeza dos resíduos de plástico quebrado", "Reconstrução das buchas com resina epóxi", "Lubrificação das dobradiças", "Montagem e teste de abertura"],
    time: "2 a 3 dias úteis",
    warranty: "6 meses na reconstrução",
    image: "/images/services/hinge.jpg"
  },
  {
    categoryId: 'hardware',
    title: "Solda de Componentes SMD",
    shortDescription: "Substituição de conectores e componentes minúsculos.",
    icon: Cpu,
    details: ["Troca de Conector USB/HDMI", "Capacitores e Resistores", "Micro Soldagem", "Botões Power/Volume"],
    longDescription: "Reparo de precisão em nível de componente. Trocamos conectores USB, HDMI, Jack de Áudio, botões e componentes eletrônicos SMD (capacitores, resistores, mosfets) danificados. Utilizamos microscópio e estação de solda de ar quente para garantir perfeição.",
    symptoms: ["USB não funciona", "HDMI sem sinal", "Botão power afundado", "Componente visivelmente queimado"],
    process: ["Identificação do componente defeituoso", "Remoção com ar quente/ferro de solda", "Limpeza da área (wicks)", "Soldagem do componente novo", "Teste de continuidade e funcional"],
    time: "1 a 3 dias úteis",
    warranty: "3 meses",
    image: "/images/services/smd.jpg"
  },

  // Redes e Conectividade
  {
    categoryId: 'network',
    title: "Crimpagem de Cabos de Rede",
    shortDescription: "Cabos de rede sob medida e reparo de pontas.",
    icon: Settings,
    details: ["Padrão T568A/B", "Conectores RJ45 Blindados", "Teste de Continuidade", "Cabos Cat5e/Cat6"],
    longDescription: "Produzimos cabos de rede de qualquer tamanho sob medida ou reparamos pontas danificadas. Utilizamos conectores de alta qualidade e seguimos rigorosamente os padrões de crimpagem T568A ou T568B para garantir velocidade Gigabit e evitar interferências.",
    symptoms: ["Cabo de rede com mau contato", "Internet caindo", "Velocidade limitada a 100mbps (deveria ser 1000)", "Trava do conector quebrada"],
    process: ["Corte e decapagem do cabo", "Alinhamento dos fios no padrão", "Crimpagem com alicate profissional", "Teste com testador de cabos", "Validação de velocidade"],
    time: "Imediato (Balcão)",
    warranty: "3 meses",
    image: "/images/services/cabling.jpg"
  },
  {
    categoryId: 'network',
    title: "Configuração de Firewall Básico",
    shortDescription: "Proteção contra invasões e controle de acesso.",
    icon: Lock,
    details: ["Bloqueio de Portas", "Regras de Entrada/Saída", "Proteção DDoS Básica", "Filtro de Conteúdo"],
    longDescription: "Configuração de firewall no roteador ou Windows para proteger sua rede contra acessos não autorizados. Criamos regras para bloquear portas vulneráveis, restringir acesso a sites específicos e garantir que apenas tráfego legítimo entre e saia da sua rede.",
    symptoms: ["Preocupação com segurança", "Acessos estranhos na rede", "Necessidade de bloquear sites", "Controle parental"],
    process: ["Análise de vulnerabilidades", "Configuração do Firewall do Windows/Roteador", "Criação de regras de exceção", "Teste de penetração básico (Port Scan)", "Documentação das regras"],
    time: "2 horas",
    warranty: "Configuração entregue funcional",
    image: "/images/services/firewall.jpg"
  },
  {
    categoryId: 'network',
    title: "Compartilhamento de Impressoras",
    shortDescription: "Imprima de qualquer computador da rede.",
    icon: Share2,
    details: ["Servidor de Impressão", "Compartilhamento Windows", "Permissões de Usuário", "Fila de Impressão"],
    longDescription: "Configuramos sua impressora USB para ser acessada por todos os computadores da rede local (Wi-Fi ou Cabo). Resolvemos conflitos de driver e problemas de 'Spooler de Impressão' que travam a fila de documentos.",
    symptoms: ["Precisa imprimir de outro PC", "Impressora não aparece na rede", "Erro de acesso negado", "Impressão lenta"],
    process: ["Instalação local da impressora", "Ativação do compartilhamento de rede", "Configuração de permissões", "Adição da impressora nos clientes", "Teste de impressão remota"],
    time: "1 a 2 horas",
    warranty: "30 dias",
    image: "/images/services/print-share.jpg"
  },
  {
    categoryId: 'network',
    title: "Instalação de Impressoras Wi-Fi",
    shortDescription: "Configuração sem fio para imprimir do celular e notebook.",
    icon: Printer,
    details: ["Conexão WPS/IP Fixo", "Instalação de Drivers", "App Mobile", "Scanner Wi-Fi"],
    longDescription: "Instalação completa de impressoras Wi-Fi (HP, Epson, Canon, Brother). Configuramos a conexão com o roteador, definimos IP fixo para evitar perda de conexão e instalamos os aplicativos para imprimir direto do celular (Android/iOS).",
    symptoms: ["Impressora perde conexão Wi-Fi", "Não imprime do celular", "Scanner não envia para PC", "Trocou de roteador e parou"],
    process: ["Reset das configurações de rede da impressora", "Conexão na nova rede Wi-Fi", "Fixação de IP no roteador", "Instalação de software nos PCs", "Teste via Smartphone"],
    time: "1 hora",
    warranty: "30 dias",
    image: "/images/services/wifi-print.jpg"
  },

  // Otimização e Performance
  {
    categoryId: 'performance',
    title: "Otimização de Sistema Lento",
    shortDescription: "Deixe seu computador rápido como novo.",
    icon: Zap,
    details: ["Limpeza de Registro", "Desativação de Inicialização", "Ajustes de Memória Virtual", "Atualização de Drivers"],
    longDescription: "Uma bateria de ajustes finos para recuperar a velocidade do sistema. Removemos arquivos temporários, desfragmentamos discos (HDs), otimizamos o registro do Windows, desativamos serviços desnecessários e ajustamos as configurações de energia para máxima performance.",
    symptoms: ["PC demora para ligar", "Programas demoram para responder", "Lentidão geral", "Travadinhas no mouse"],
    process: ["Diagnóstico de gargalos", "Limpeza de disco e registro", "Gerenciamento de programas de inicialização", "Ajuste de efeitos visuais", "Relatório de antes/depois"],
    time: "2 a 3 horas",
    warranty: "Satisfação garantida",
    image: "/images/services/optimize.jpg"
  },
  {
    categoryId: 'performance',
    title: "Testes de Estabilidade (Stress Test)",
    shortDescription: "Valide se seu PC aguenta carga máxima sem travar.",
    icon: Activity,
    details: ["CPU/GPU Burn-in", "Teste de Memória RAM", "Monitoramento Térmico", "Log de Voltagens"],
    longDescription: "Submetemos seu computador a cargas de trabalho extremas (100% de uso) utilizando ferramentas como AIDA64, Prime95 e Furmark. Isso serve para identificar instabilidades, superaquecimento ou fontes defeituosas que só falham em alta demanda.",
    symptoms: ["PC desliga jogando", "Tela azul aleatória", "Dúvida sobre refrigeração", "Validação de Overclock"],
    process: ["Instalação de ferramentas de monitoramento", "Execução de testes de estresse (30min+)", "Análise de temperaturas e voltagens", "Verificação de erros de memória (MemTest86)", "Laudo técnico"],
    time: "2 a 4 horas",
    warranty: "Precisão do diagnóstico",
    image: "/images/services/stress.jpg"
  },
  {
    categoryId: 'performance',
    title: "Ajuste de Curva de Ventoinha",
    shortDescription: "Silêncio e refrigeração equilibrados.",
    icon: Thermometer,
    details: ["BIOS/Software Control", "Redução de Ruído", "Melhoria Térmica", "Perfil Zero RPM"],
    longDescription: "Configuramos a velocidade das ventoinhas (Fans) para reagir de forma inteligente à temperatura. Criamos perfis silenciosos para uso básico e perfis agressivos para jogos, ou o equilíbrio perfeito entre silêncio e temperatura.",
    symptoms: ["PC muito barulhento", "Ventoinhas aceleram e desaceleram toda hora", "Aquecimento sem aumento de rotação"],
    process: ["Identificação dos fans instalados (PWM/DC)", "Mapeamento térmico", "Criação de curva personalizada na BIOS ou Software", "Teste auditivo e térmico"],
    time: "1 hora",
    warranty: "N/A",
    image: "/images/services/fan-curve.jpg"
  },
  {
    categoryId: 'performance',
    title: "Undervolt de Processador/GPU",
    shortDescription: "Menos calor e consumo, mesma performance.",
    icon: Zap,
    details: ["Redução de Voltagem", "Menor Temperatura", "Maior Vida Útil", "Manutenção de Clock"],
    longDescription: "Técnica avançada onde reduzimos a voltagem fornecida ao processador ou placa de vídeo sem reduzir a frequência (clock). O resultado é uma diminuição drástica na temperatura (5°C a 15°C a menos) e no consumo de energia, muitas vezes até aumentando a performance por evitar o Thermal Throttling.",
    symptoms: ["Notebook esquentando muito", "Cooler fazendo muito barulho", "Throttling (queda de FPS) em jogos", "Economia de bateria"],
    process: ["Benchmark inicial", "Redução gradual de voltagem (mV)", "Testes de estabilidade a cada passo", "Definição do ponto ideal (Sweet Spot)", "Configuração para aplicar no boot"],
    time: "2 a 4 horas",
    warranty: "Garantia de estabilidade",
    image: "/images/services/undervolt.jpg"
  },
  {
    categoryId: 'performance',
    title: "Calibração de Cores de Monitor",
    shortDescription: "Cores reais e fiéis para designers e fotógrafos.",
    icon: Palette,
    details: ["Perfil ICC Personalizado", "Ajuste de Gama/Brilho", "Balanço de Branco", "Fidelidade de Cor"],
    longDescription: "Ajustamos as cores do seu monitor para garantir fidelidade profissional. Ideal para designers, fotógrafos e editores de vídeo que precisam garantir que o que veem na tela é o que será impresso ou visto em outros dispositivos.",
    symptoms: ["Cores parecem lavadas ou saturadas", "Impressão sai diferente da tela", "Branco amarelado ou azulado", "Trabalho profissional com cor"],
    process: ["Reset de fábrica do monitor", "Ajuste físico (OSD) de brilho/contraste", "Calibração via software/colorímetro", "Geração e instalação de perfil ICC", "Teste de comparação"],
    time: "1 hora",
    warranty: "N/A",
    image: "/images/services/calibration.jpg"
  },

  // Corporativo e Consultoria
  {
    categoryId: 'corporate',
    title: "Configuração de RAID 0/1/5",
    shortDescription: "Segurança ou velocidade extrema para seus dados.",
    icon: Server,
    details: ["Espelhamento (RAID 1)", "Performance (RAID 0)", "Paridade (RAID 5)", "Configuração na BIOS/NAS"],
    longDescription: "Configuramos múltiplos discos rígidos para trabalharem em conjunto. RAID 0 para somar velocidades (ideal para edição de vídeo), RAID 1 para espelhamento automático (segurança de dados) ou RAID 5/10 para servidores que precisam de equilíbrio entre segurança e performance.",
    symptoms: ["Precisa de backup automático em tempo real", "Precisa de muito mais velocidade de disco", "Servidor de arquivos", "Segurança contra falha de HD"],
    process: ["Backup prévio (se houver dados)", "Configuração da controladora RAID", "Criação do Array", "Formatação e inicialização no OS", "Teste de redundância (simulação de falha)"],
    time: "2 a 4 horas",
    warranty: "30 dias (Configuração)",
    image: "/images/services/raid.jpg"
  },
  {
    categoryId: 'corporate',
    title: "Suporte Remoto (AnyDesk/TeamViewer)",
    shortDescription: "Resolução de problemas de software sem sair de casa.",
    icon: Headphones,
    details: ["Atendimento Imediato", "Segurança Criptografada", "Instalação de Programas", "Diagnóstico Rápido"],
    longDescription: "Acesso remoto seguro para resolver problemas de software, e-mail, impressora e vírus. Você acompanha tudo pela tela do seu computador enquanto nosso técnico trabalha. Rápido, seguro e sem custo de deslocamento.",
    symptoms: ["Erro em programa", "Dúvida de configuração", "E-mail parou", "Problemas leves de software"],
    process: ["Agendamento via WhatsApp", "Conexão via ferramenta segura", "Diagnóstico e resolução", "Desconexão e relatório"],
    time: "Variável (Cobrado por hora)",
    warranty: "7 dias no serviço realizado",
    image: "/images/services/remote.jpg"
  },
  {
    categoryId: 'corporate',
    title: "Inventário de Hardware/Software",
    shortDescription: "Mapeamento completo do parque tecnológico da sua empresa.",
    icon: ClipboardList,
    details: ["Relatório de Ativos", "Licenças de Software", "Estado de Conservação", "Planejamento de Upgrade"],
    longDescription: "Levantamento detalhado de todos os computadores, especificações técnicas, números de série, sistemas operacionais e softwares instalados. Essencial para gestão de ativos, auditorias de licença e planejamento de renovação de equipamentos.",
    symptoms: ["Empresa não sabe o que tem", "Controle de patrimônio", "Planejamento orçamentário", "Auditoria de licenças"],
    process: ["Coleta de dados em cada estação (pode ser via rede)", "Identificação de hardware e serial", "Verificação de softwares instalados", "Compilação de relatório gerencial (PDF/Excel)"],
    time: "Variável (por estação)",
    warranty: "Precisão dos dados",
    image: "/images/services/inventory.jpg"
  },
  {
    categoryId: 'corporate',
    title: "Consultoria para Upgrades",
    shortDescription: "Saiba exatamente o que comprar para melhorar seu PC.",
    icon: Stethoscope,
    details: ["Análise de Custo-Benefício", "Compatibilidade", "Indicação de Peças", "Planejamento"],
    longDescription: "Não gaste dinheiro com peças erradas. Analisamos seu computador atual e seus objetivos (jogos, trabalho, renderização) para indicar o upgrade com melhor custo-benefício. Verificamos compatibilidade de processador, placa-mãe, fonte e gabinete.",
    symptoms: ["Quer melhorar o PC mas não sabe o que comprar", "Medo de peça incompatível", "Orçamento limitado", "Dúvida entre trocar tudo ou fazer upgrade"],
    process: ["Análise do hardware atual", "Entrevista sobre necessidades e orçamento", "Pesquisa de mercado", "Entrega de relatório com links e recomendações"],
    time: "1 dia útil",
    warranty: "Garantia de compatibilidade das indicações",
    image: "/images/services/consulting.jpg"
  },
  {
    categoryId: 'corporate',
    title: "Laudo Técnico para Seguradoras",
    shortDescription: "Documento oficial para ressarcimento de danos elétricos.",
    icon: FileText,
    details: ["Análise Técnica", "Fotos dos Danos", "Causa Raiz", "Orçamento de Reparo/Troca"],
    longDescription: "Emitimos laudo técnico oficial com ART (quando necessário) para acionamento de seguro residencial ou empresarial em casos de queima por raio, oscilação de energia ou danos físicos. Documento detalhado com fotos, testes realizados e condenação das peças.",
    symptoms: ["PC queimou após chuva/raio", "Acionamento de seguro", "Necessidade de documento formal", "Ressarcimento de prejuízo"],
    process: ["Análise forense do equipamento", "Identificação dos componentes queimados", "Registro fotográfico", "Elaboração do documento técnico formal", "Orçamento para reposição"],
    time: "2 a 3 dias úteis",
    warranty: "Aceitação por seguradoras (Documento Padrão)",
    image: "/images/services/laudo.jpg"
  }
]
