import AsyncStorage from "@react-native-async-storage/async-storage";

// Etiquetas das "gavetas"
// Esses valores não serão trocados depois, por isso é const
export const CHAVES = {
  config: "@pomodoro_config",
  ciclo: "@pomodoro_ciclo",
  tarefas: "@pomodoro_tarefas",
  historico: "@pomodoro_historico",
  audio: "@pomodoro_audio", // NOVO: música e som escolhidos
};

// Valores iniciais (padrão) das configurações
// Se não tiver informação, essas são setadas por padrão
export const CONFIG_PADRAO = {
  foco: 25,
  pausaCurta: 5,
  pausaLonga: 15,
  meta: 8, // null = sem limite
  pausaLongaACada: 4,
  temaEscuro: false,
};

// Duas paletas com os MESMOS nomes de cor, mas valores diferentes.
// As telas pedem "a cor do fundo" e recebem a certa conforme o tema.
export const TEMA_CLARO = {
  fundo: "#F8FAFC",
  card: "#FFFFFF",
  texto: "#0F172A",
  textoSecundario: "#64748B",
  borda: "#E2E8F0",
  foco: "#E11D48", // vermelho: ciclos de foco
  descanso: "#0D9488", // verde-água: descansos e ações de apoio
};

export const TEMA_ESCURO = {
  fundo: "#0F172A",
  card: "#1E293B",
  texto: "#F1F5F9",
  textoSecundario: "#94A3B8",
  borda: "#334155",
  foco: "#F43F5E",
  descanso: "#2DD4BF",
};

// Guarda qualquer valor no aparelho. O AsyncStorage só aceita texto,
// então convertemos em texto com JSON.stringify.
export async function salvarDados(chave, valor) {
  // função assíncrona
  try {
    await AsyncStorage.setItem(chave, JSON.stringify(valor));
  } catch (erro) {
    console.log("Erro ao salvar", chave, erro);
  }
}

// Lê e converte de volta para objeto. Se não houver nada salvo
// (ou der erro), devolve o valor padrão informado.
export async function lerDados(chave, padrao) {
  try {
    const texto = await AsyncStorage.getItem(chave);
    return texto !== null ? JSON.parse(texto) : padrao;
  } catch (erro) {
    console.log("Erro ao ler", chave, erro);
    return padrao;
  }
}
