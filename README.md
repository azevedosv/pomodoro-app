## Créditos

**Integrantes:** Gabriel de Azevedo Silva e Paulo Victor Rodrigues Moraes
**Projeto:** Pomodoro App  
**Disciplina:** Desenvolvimento Mobile  
**Professor:** Vitor Vidigal

# Pomodoro App

Aplicativo mobile de produtividade baseado na técnica Pomodoro. O projeto combina um timer de foco, gerenciamento de tarefas, histórico de sessões, configurações personalizáveis e sugestões de música e sons de acordo com o humor informado pela pessoa usuária.

## Funcionalidades

### Timer Pomodoro

- Contagem regressiva para períodos de foco, pausas curtas e pausas longas.
- Ações para iniciar, pausar, continuar, resetar e finalizar antecipadamente uma sessão.
- Cálculo do tempo restante com base no horário previsto de término, mantendo a contagem coerente mesmo quando a tela fica bloqueada.
- Vibração ao término do período.
- Contabilização dos Pomodoros concluídos e dos Pomodoros realizados no dia.
- Opção de pular uma pausa sem registrar uma sessão.

### Gerenciamento de tarefas

- Cadastro, seleção, conclusão e exclusão de tarefas.
- Impede o cadastro de tarefas com título vazio.
- Permite manter apenas uma tarefa selecionada por vez.
- Não permite selecionar tarefas já concluídas.
- Exibe a lista com `FlatList` e uma mensagem quando não há tarefas.
- Associa os Pomodoros concluídos à tarefa ativa.

### Histórico

- Registro das sessões concluídas, com tarefa, duração, data e hora.
- Armazenamento do humor escolhido para a sessão, quando informado.
- Exibição das sessões mais recentes primeiro.
- Cálculo da quantidade total de sessões e do total de minutos focados.
- Opção de limpar o histórico com confirmação.

### Configurações e aparência

- Personalização da duração do foco, da pausa curta e da pausa longa.
- Configuração da meta de Pomodoros.
- Configuração da frequência das pausas longas.
- Validação dos campos numéricos: aceitam apenas inteiros maiores que zero.
- Meta opcional: quando deixada em branco, é tratada como `null` (sem limite).
- Tema claro e tema escuro, com atualização imediata.
- Opção para restaurar os valores padrão sem alterar o tema escolhido.

### Humor, música e sons

- Escolha entre quatro estados de humor: cansado, estressado, neutro e animado.
- Conversão do humor em termos de busca para música e sons ambientes.
- Integração com as APIs Jamendo (músicas) e Freesound (sons).
- Estados de carregamento, mensagens de erro e opção de tentar novamente.
- A música selecionada pode tocar durante o foco e o som durante as pausas.
- Reprodução em repetição; pausar, resetar, finalizar ou concluir o timer interrompe o áudio.
- Exibição dos créditos dos artistas.

## Tecnologias e bibliotecas

| Tecnologia / recurso | Utilização descrita                                  |
| -------------------- | ---------------------------------------------------- |
| React Native         | Desenvolvimento da aplicação mobile                  |
| Expo                 | Ambiente e ferramentas do aplicativo                 |
| Expo Router          | Navegação entre telas                                |
| Stack Navigator      | Navegação principal e abertura da tela de humor      |
| Tabs Navigator       | Navegação pelas abas principais                      |
| AsyncStorage         | Persistência local dos dados                         |
| React Context        | Compartilhamento de configurações e tema             |
| React Hooks          | Estado, efeitos, referências e atualização das telas |
| Jamendo API          | Busca de músicas                                     |
| Freesound API        | Busca de sons ambientes                              |
| `fetch`              | Requisições às APIs externas                         |
| Ionicons             | Ícones da navegação por abas                         |

## Telas e navegação

O aplicativo possui cinco telas:

1. **Timer:** controla os períodos de foco e pausa.
2. **Tarefas:** gerencia as tarefas e a tarefa ativa.
3. **Histórico:** apresenta as sessões registradas.
4. **Configurações:** personaliza tempos, metas e tema.
5. **Humor:** permite selecionar o humor e escolher música e sons sugeridos.

A navegação utiliza dois tipos de navegador:

- **Tabs:** organiza Timer, Tarefas, Histórico e Configurações em abas.
- **Stack:** fica na raiz da navegação e abre a tela Humor sobre o grupo de abas.

A tela Humor é aberta ao término de um período de foco. Ela recebe o identificador da sessão por parâmetro de rota, para associar o humor escolhido ao registro correto.

## Organização do projeto

A apresentação descreve a seguinte estrutura:

```text
src/
├── app/
│   ├── _layout.js
│   ├── humor.js
│   └── (tabs)/
│       ├── _layout.js
│       ├── index.js
│       ├── tarefas.js
│       ├── historico.js
│       └── configuracoes.js
├── components/
│   ├── Botao.js
│   ├── CampoNumerico.js
│   ├── CardSessao.js
│   ├── CardFaixa.js
│   └── SecaoBusca.js
├── context/
│   └── AppContext.js
├── hooks/
│   └── useBusca.js
└── utils/
    ├── storage.js
    ├── tempo.js
    ├── humor.js
    └── api.js
```

### Responsabilidade das pastas

- `app/`: rotas, telas e configuração dos navegadores.
- `app/(tabs)/`: telas que aparecem na barra de abas.
- `components/`: componentes visuais reutilizáveis.
- `context/`: estado compartilhado da aplicação.
- `hooks/`: lógica reutilizável, como a busca de conteúdo nas APIs.
- `utils/`: funções auxiliares de persistência, tempo, humor e comunicação com APIs.

No Expo Router, cada arquivo de tela dentro de `app` representa uma rota. O grupo `(tabs)` organiza as telas em abas sem fazer parte do endereço da rota.

## Persistência de dados

Os dados são armazenados localmente com **AsyncStorage**. Como o armazenamento trabalha com texto, os valores são convertidos com `JSON.stringify` antes de salvar e recuperados com `JSON.parse` ao ler.

A apresentação informa cinco chaves de armazenamento:

- `@pomodoro_config`
- `@pomodoro_ciclo` (identificada na apresentação como a chave `_ciclo` associada ao prefixo de configuração)
- `@pomodoro_tarefas` (identificada na apresentação como `_tarefas`)
- `@pomodoro_historico` (identificada na apresentação como `_historico`)
- `@pomodoro_audio` (identificada na apresentação como `_audio`)

> Confira os valores literais no arquivo `src/utils/storage.js` antes de depender desses nomes. A apresentação mostra os sufixos e a chave de configuração, mas não apresenta a declaração completa de `CHAVES`.

O `AppProvider` carrega as configurações na inicialização. As telas acessam os dados compartilhados por meio de `useApp()`, incluindo `config`, `tema` e `salvarConfig`. Ao salvar, o estado da interface é atualizado e os dados são gravados no dispositivo.

O aplicativo foi projetado para manter suas funções principais disponíveis sem internet. A busca de músicas e sons depende de conexão e das APIs externas.

## Como o timer funciona

O timer utiliza `setInterval` dentro de `useEffect` para atualizar a interface. O intervalo é limpo quando deixa de ser necessário.

Em vez de diminuir um contador independente a cada segundo, a lógica registra o horário de término e calcula o tempo restante usando `Date.now()`. O horário fica em um `useRef`, evitando uma renderização a cada alteração dessa referência.

Os modos são:

- `foco`
- `pausaCurta`
- `pausaLonga`

Ao concluir um foco, o ciclo é atualizado. A pausa longa é escolhida quando a meta é atingida ou quando a quantidade de focos alcança a frequência configurada para pausas longas. A finalização antecipada registra o tempo efetivamente decorrido, com duração mínima de um minuto, conforme descrito na apresentação.

## Integração com APIs

O projeto consulta duas APIs externas:

- **Jamendo:** pesquisa músicas.
- **Freesound:** pesquisa sons ambientes.

A camada `src/utils/api.js` realiza as requisições com `fetch` e normaliza os resultados para um formato comum, descrito com os campos `id`, `titulo`, `autor` e `url`.

O hook `src/hooks/useBusca.js` gerencia:

- lista de resultados;
- item selecionado;
- estado de carregamento;
- mensagem de erro;
- tentativa de nova busca.

A apresentação também descreve um controle para ignorar respostas antigas quando o humor muda durante uma busca, evitando que resultados de uma pesquisa anterior substituam os resultados atuais.

### Configuração das credenciais

As chaves das APIs são mantidas em um arquivo `.env`, que não deve ser enviado ao GitHub. O projeto possui um `.env.example` para indicar quais valores precisam ser preenchidos.

1. Localize o arquivo `.env.example` no repositório.
2. Crie seu arquivo `.env` seguindo exatamente os nomes de variáveis apresentados nele.
3. Preencha as credenciais obtidas nos serviços correspondentes.
4. Mantenha o `.env` fora do controle de versão.

Os nomes das variáveis e o processo de obtenção das credenciais não aparecem no HTML de apresentação; consulte os arquivos do projeto para obter esses detalhes.

## Componentes reutilizáveis

A apresentação destaca os seguintes componentes:

| Componente      | Responsabilidade                                  |
| --------------- | ------------------------------------------------- |
| `Botao`         | Botão visual reutilizado em diferentes telas      |
| `CampoNumerico` | Campo de entrada e validação de valores numéricos |
| `CardSessao`    | Apresentação de uma sessão no histórico           |
| `CardFaixa`     | Apresentação de uma música ou som                 |
| `SecaoBusca`    | Área de busca com resultados, carregamento e erro |

## Requisitos acadêmicos apresentados

O material relaciona as funcionalidades do aplicativo aos seguintes requisitos do trabalho:

| Requisito          | Implementação descrita                                       |
| ------------------ | ------------------------------------------------------------ |
| Navegação          | Cinco telas com Stack e Tabs                                 |
| API externa        | Jamendo e Freesound, com carregamento, erro e nova tentativa |
| Persistência local | AsyncStorage com cinco chaves                                |
| Hooks              | `useState` e `useEffect` no timer, contexto e buscas         |
| Componentização    | Componentes reutilizáveis em `src/components`                |
| Interface          | `StyleSheet`, Flexbox, `SafeAreaView` e temas claro/escuro   |
| Versionamento      | Repositório GitHub com commits por etapa                     |

## Executar o projeto

O HTML de apresentação não informa as versões do Node.js, Expo ou React Native, nem os scripts definidos em `package.json`. Para executar o aplicativo:

1. Obtenha o repositório do projeto.
2. Instale a versão de Node.js e as dependências compatíveis com o `package.json` do repositório.
3. Configure as variáveis de ambiente conforme o `.env.example`.
4. Inicie o projeto usando o script ou comando Expo definido na configuração do próprio repositório.

Não há informação suficiente no HTML para registrar comandos exatos de instalação ou execução sem correr o risco de indicar versões ou scripts incorretos.

## Limitações e observações

- As funcionalidades principais usam dados locais; pesquisas de música e sons dependem de internet.
- A disponibilidade dos resultados de áudio depende dos serviços Jamendo e Freesound.
- O HTML descreve o funcionamento esperado e trechos ilustrativos, não o código-fonte integral.
- Detalhes como versões de dependências, scripts, nomes exatos das variáveis de ambiente e licenças específicas dos arquivos de áudio devem ser conferidos no repositório e nas respectivas fontes.

As músicas e os sons são obtidos por meio das APIs Jamendo e Freesound. Os créditos dos artistas devem ser mantidos na interface, conforme as condições de uso e licenciamento de cada conteúdo.

---
