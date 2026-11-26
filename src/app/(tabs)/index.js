import { useCallback, useEffect, useRef, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  Vibration,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
// [MUDOU] entrou o usePathname
import { Ionicons } from "@expo/vector-icons";
import { createAudioPlayer, setAudioModeAsync } from "expo-audio";
import { router, useFocusEffect, usePathname } from "expo-router";
import Botao from "../../components/Botao";
import { useApp } from "../../context/AppContext";
import { CHAVES, lerDados, salvarDados } from "../../utils/storage";
import { ehHoje, formatarContador, formatarRelogio } from "../../utils/tempo";

// Nome de cada modo para mostrar na tela
const NOMES_MODO = {
  foco: "Foco",
  pausaCurta: "Pausa curta",
  pausaLonga: "Pausa longa",
};

// Executa uma ação de áudio sem deixar um erro derrubar o Timer
function seguro(acao) {
  try {
    acao();
  } catch (e) {
    console.log("Aviso de áudio:", e);
  }
}

export default function Timer() {
  const { config, tema } = useApp();
  const pathname = usePathname(); // [F] qual tela está aberta agora
  const [modo, setModo] = useState("foco");
  const [ciclo, setCiclo] = useState(0); // pomodoros concluídos no ciclo
  const [aviso, setAviso] = useState("");
  const [agora, setAgora] = useState(new Date());
  const [tarefas, setTarefas] = useState([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [sessoes, setSessoes] = useState([]);
  // Música e som escolhidos na tela de humor
  const [audio, setAudio] = useState({ musica: null, som: null });

  const [rodando, setRodando] = useState(false);
  // null = ainda não começou (mostra o tempo cheio do modo)
  const [restante, setRestante] = useState(null);
  // Guarda o horário em que o tempo termina. useRef não redesenha a tela.
  const fimRef = useRef(0);
  // Trava: impede finalizar o mesmo modo duas vezes (toque duplo)
  const finalizandoRef = useRef(false);
  // Guarda o tocador de áudio atual (null = nada tocando)
  const playerRef = useRef(null);

  // Relógio: atualiza a hora atual a cada segundo
  useEffect(() => {
    const intervalo = setInterval(() => {
      setAgora(new Date());
    }, 1000);
    return () => clearInterval(intervalo);
  }, []);

  // Lê o ciclo salvo, uma vez, quando a tela abre
  useEffect(() => {
    async function carregarCiclo() {
      const salvo = await lerDados(CHAVES.ciclo, 0);
      setCiclo(salvo);
    }
    carregarCiclo();
  }, []);

  // Configura o áudio ao abrir a tela e libera o tocador ao sair
  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true, // toca mesmo com o celular no silencioso
      shouldPlayInBackground: true, // tenta continuar com a tela bloqueada
      interruptionMode: "doNotMix",
    }).catch((e) => console.log("Aviso de áudio:", e));

    return () => pararAudio();
  }, []);

  // Lê tarefas, histórico e o áudio escolhido toda vez que esta aba ganha foco
  useFocusEffect(
    useCallback(() => {
      async function carregar() {
        const lista = await lerDados(CHAVES.tarefas, []);
        setTarefas(lista);

        const historico = await lerDados(CHAVES.historico, []);
        setSessoes(historico);

        const escolhidos = await lerDados(CHAVES.audio, {
          musica: null,
          som: null,
        });
        setAudio(escolhidos);
      }
      carregar();
    }, []),
  );

  // Contagem: só existe enquanto "rodando" for verdadeiro
  useEffect(() => {
    if (!rodando) {
      return;
    }

    const intervalo = setInterval(() => {
      const faltam = Math.max(
        0,
        Math.ceil((fimRef.current - Date.now()) / 1000),
      );
      setRestante(faltam);
      if (faltam === 0) {
        setRodando(false); // acabou o tempo
      }
    }, 250);

    return () => clearInterval(intervalo);
  }, [rodando]);

  // Toca uma faixa (música ou som) em repetição
  function tocarAudio(item) {
    try {
      pararAudio();
      const player = createAudioPlayer(item.url);
      player.loop = true;
      player.play();
      playerRef.current = player;

      // Mostra o crédito na tela de bloqueio e ajuda a manter o áudio no fundo
      seguro(() =>
        player.setActiveForLockScreen(true, {
          title: item.titulo,
          artist: item.autor,
        }),
      );
    } catch (e) {
      console.log("Erro ao tocar áudio:", e);
    }
  }

  // Para o áudio e libera o tocador
  function pararAudio() {
    const player = playerRef.current;
    if (!player) {
      return;
    }
    playerRef.current = null;
    seguro(() => player.pause());
    seguro(() => player.setActiveForLockScreen(false));
    seguro(() => player.remove());
  }

  // Registra um foco concluído (tarefa + histórico)
  async function registrarSessao(minutos) {
    // 1) Soma 1 pomodoro na tarefa ativa
    const salvas = await lerDados(CHAVES.tarefas, []);
    const ativa = salvas.find((t) => t.selecionada);

    if (ativa) {
      const atualizadas = salvas.map((t) =>
        t.id === ativa.id ? { ...t, pomodoros: t.pomodoros + 1 } : t,
      );
      await salvarDados(CHAVES.tarefas, atualizadas);
      setTarefas(atualizadas);
    }

    // 2) Grava a sessão no INÍCIO do histórico (mais recente primeiro)
    const historico = await lerDados(CHAVES.historico, []);
    const nova = {
      id: Date.now().toString(),
      tarefa: ativa ? ativa.titulo : "Sem tarefa",
      duracao: minutos,
      dataHora: new Date().toISOString(),
    };
    const novaLista = [nova, ...historico];
    await salvarDados(CHAVES.historico, novaLista);
    setSessoes(novaLista);

    return nova.id; // [F] devolve o id para a tela de humor saber qual sessão atualizar
  }

  // Sem argumentos (fim natural do tempo), usa config.foco e manual = false.
  async function finalizarModo({ minutos = config.foco, manual = false } = {}) {
    // Se já está finalizando, ignora o segundo chamado
    if (finalizandoRef.current) {
      return;
    }
    finalizandoRef.current = true;

    try {
      pararAudio(); // o modo terminou, o áudio também

      // Só vibra quando o tempo acaba sozinho
      if (!manual) {
        Vibration.vibrate(500);
      }

      let sessaoParaHumor = null; // [F] só ganha valor quando um foco termina

      if (modo === "foco") {
        // [MUDOU] antes o resultado não era guardado
        sessaoParaHumor = await registrarSessao(minutos);

        const novoCiclo = ciclo + 1;
        const metaAtingida = config.meta !== null && novoCiclo >= config.meta;

        let proximo = "pausaCurta";
        if (metaAtingida || novoCiclo % config.pausaLongaACada === 0) {
          proximo = "pausaLonga";
        }

        // Meta atingida: o ciclo recomeça do zero
        const cicloSalvo = metaAtingida ? 0 : novoCiclo;
        setCiclo(cicloSalvo);
        await salvarDados(CHAVES.ciclo, cicloSalvo);

        setModo(proximo);

        let mensagem = "Pomodoro concluído! Hora de descansar.";
        if (metaAtingida) {
          mensagem = "Meta do ciclo atingida! Você merece uma pausa longa.";
        } else if (manual) {
          mensagem = "Foco finalizado. Hora de descansar.";
        }
        setAviso(mensagem);
      } else {
        setModo("foco");
        setAviso(
          manual
            ? "Pausa pulada. Hora de focar!"
            : "Pausa encerrada. Hora de focar!",
        );
      }

      setRestante(null);

      // [F] Foco concluído: abre sozinha a tela de humor, ligada à sessão.
      // Se ela já estiver aberta (pelo link manual), não abre outra por cima.
      if (sessaoParaHumor !== null && pathname !== "/humor") {
        router.push({
          pathname: "/humor",
          params: { sessaoId: sessaoParaHumor },
        });
      }
    } finally {
      // Destrava, aconteça o que acontecer
      finalizandoRef.current = false;
    }
  }

  // Quando o restante chega a 0, passa para o próximo modo
  useEffect(() => {
    if (restante === 0) {
      finalizarModo();
    }
  }, [restante]);

  // Escolhe a tarefa ativa. id = null significa "sem tarefa".
  async function escolherTarefa(id) {
    const atualizadas = tarefas.map((t) => ({
      ...t,
      selecionada: t.id === id,
    }));
    setTarefas(atualizadas);
    await salvarDados(CHAVES.tarefas, atualizadas);
    setModalAberto(false);
  }

  const corModo = modo === "foco" ? tema.foco : tema.descanso;
  const segundosTotais = config[modo] * 60;
  const segundosExibidos = restante === null ? segundosTotais : restante;

  // true enquanto nenhum segundo foi descontado do modo atual
  const nadaDecorrido = segundosExibidos === segundosTotais;

  const pomodorosHoje = sessoes.filter((s) => ehHoje(s.dataHora)).length;

  const tarefaAtiva = tarefas.find((t) => t.selecionada) || null;
  const pendentes = tarefas.filter((t) => !t.concluida);

  // O que toca no modo atual: música no foco, som nas pausas
  const itemAtual = modo === "foco" ? audio.musica : audio.som;

  function iniciar() {
    fimRef.current = Date.now() + segundosExibidos * 1000;
    setAviso("");
    setRodando(true);

    // Continua o áudio pausado, ou começa o do modo atual
    if (playerRef.current) {
      seguro(() => playerRef.current.play());
    } else if (itemAtual) {
      tocarAudio(itemAtual);
    }
  }

  function pausar() {
    // Fixa o valor exato do momento da pausa
    const faltam = Math.max(0, Math.ceil((fimRef.current - Date.now()) / 1000));
    setRestante(faltam);
    setRodando(false);

    seguro(() => playerRef.current && playerRef.current.pause());
  }

  // Reinicia só o tempo do modo atual (o ciclo não é mexido)
  function resetar() {
    setRodando(false);
    setRestante(null);
    setAviso("");
    pararAudio();
  }

  // Botão Finalizar (no foco) e Pular pausa (nas pausas)
  function finalizarAgora() {
    setRodando(false);

    if (modo === "foco") {
      // Minutos que realmente passaram, com mínimo de 1
      const decorridos = segundosTotais - segundosExibidos;
      const minutos = Math.max(1, Math.round(decorridos / 60));
      finalizarModo({ minutos, manual: true });
    } else {
      finalizarModo({ manual: true });
    }
  }

  // Texto do botão principal
  let textoPrincipal = "Iniciar";
  if (rodando) {
    textoPrincipal = "Pausar";
  } else if (restante !== null) {
    textoPrincipal = "Continuar";
  }

  const textoCiclo =
    config.meta === null
      ? `Ciclo: ${ciclo} pomodoros (sem meta)`
      : `Ciclo: ${ciclo} de ${config.meta} pomodoros`;

  // Sem tarefa, o texto convida a tocar para escolher
  let textoTarefa = "Toque para escolher uma tarefa";
  if (tarefaAtiva) {
    const total = tarefaAtiva.pomodoros;
    textoTarefa = `${tarefaAtiva.titulo} · ${total} ${
      total === 1 ? "pomodoro" : "pomodoros"
    }`;
  }

  // Desenha UMA opção da lista de tarefas da janela
  function renderOpcao({ item }) {
    return (
      <Pressable
        onPress={() => escolherTarefa(item.id)}
        style={[
          styles.opcao,
          { borderColor: item.selecionada ? tema.foco : tema.borda },
        ]}
      >
        <Text
          style={[styles.opcaoTitulo, { color: tema.texto }]}
          numberOfLines={1}
        >
          {item.titulo}
        </Text>
        <Text style={[styles.opcaoDetalhe, { color: tema.textoSecundario }]}>
          {item.pomodoros} {item.pomodoros === 1 ? "pomodoro" : "pomodoros"}
        </Text>
      </Pressable>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: tema.fundo }]}
      edges={["top"]}
    >
      <Text style={[styles.relogio, { color: tema.textoSecundario }]}>
        {formatarRelogio(agora)}
      </Text>

      <View
        style={[
          styles.card,
          { backgroundColor: tema.card, borderColor: tema.borda },
        ]}
      >
        <View style={styles.linhaModo}>
          <Text style={[styles.modo, { color: corModo }]}>
            {NOMES_MODO[modo]}
          </Text>
          <View style={[styles.bolinha, { backgroundColor: corModo }]} />
        </View>

        <Text style={[styles.contador, { color: tema.texto }]}>
          {formatarContador(segundosExibidos)}
        </Text>

        <Text style={[styles.ciclo, { color: tema.texto }]}>{textoCiclo}</Text>

        {/* A linha da tarefa é tocável e tem uma setinha */}
        <Pressable
          onPress={() => setModalAberto(true)}
          hitSlop={8}
          style={styles.linhaTarefa}
        >
          <Text
            style={[styles.tarefa, { color: tema.textoSecundario }]}
            numberOfLines={1}
          >
            {textoTarefa}
          </Text>
          <Ionicons
            name="chevron-down"
            size={16}
            color={tema.textoSecundario}
          />
        </Pressable>

        {/* Crédito da faixa enquanto o tempo corre */}
        {rodando && itemAtual && (
          <Text
            style={[styles.audioAtual, { color: tema.descanso }]}
            numberOfLines={1}
          >
            ♪ {itemAtual.titulo} · {itemAtual.autor}
          </Text>
        )}

        {aviso !== "" && (
          <Text style={[styles.aviso, { color: corModo }]}>{aviso}</Text>
        )}
      </View>

      <Text style={[styles.hoje, { color: tema.texto }]}>
        Pomodoros hoje: {pomodorosHoje}
      </Text>

      {/* Acesso manual à tela de humor */}
      <Pressable
        onPress={() => router.push("/humor")}
        style={styles.linhaHumor}
      >
        <Ionicons name="happy-outline" size={18} color={tema.descanso} />
        <Text style={[styles.textoHumor, { color: tema.descanso }]}>
          Como você está?
        </Text>
      </Pressable>

      <View style={styles.botoes}>
        <Botao
          titulo={textoPrincipal}
          onPress={rodando ? pausar : iniciar}
          desabilitado={segundosExibidos === 0}
        />

        <View style={styles.linhaBotoes}>
          <View style={styles.metade}>
            <Botao
              titulo="Resetar"
              variante="contorno"
              onPress={resetar}
              desabilitado={restante === null && !rodando}
            />
          </View>
          <View style={styles.metade}>
            <Botao
              titulo={modo === "foco" ? "Finalizar" : "Pular pausa"}
              variante="contorno"
              cor="descanso"
              onPress={finalizarAgora}
              desabilitado={modo === "foco" && nadaDecorrido}
            />
          </View>
        </View>
      </View>

      {/* Janela para escolher a tarefa */}
      <Modal
        visible={modalAberto}
        transparent
        animationType="fade"
        onRequestClose={() => setModalAberto(false)}
      >
        <View style={styles.fundoModal}>
          <View
            style={[
              styles.caixaModal,
              { backgroundColor: tema.card, borderColor: tema.borda },
            ]}
          >
            <Text style={[styles.tituloModal, { color: tema.texto }]}>
              Escolher tarefa
            </Text>

            <FlatList
              data={pendentes}
              keyExtractor={(item) => item.id}
              renderItem={renderOpcao}
              style={styles.listaModal}
              contentContainerStyle={styles.conteudoModal}
              ListHeaderComponent={
                <Pressable
                  onPress={() => escolherTarefa(null)}
                  style={[
                    styles.opcao,
                    { borderColor: tarefaAtiva ? tema.borda : tema.foco },
                  ]}
                >
                  <Text style={[styles.opcaoTitulo, { color: tema.texto }]}>
                    Sem tarefa
                  </Text>
                </Pressable>
              }
              ListEmptyComponent={
                <Text
                  style={[styles.vazioModal, { color: tema.textoSecundario }]}
                >
                  Nenhuma tarefa pendente. Crie uma na aba Tarefas.
                </Text>
              }
            />

            <Botao
              titulo="Fechar"
              variante="contorno"
              cor="descanso"
              onPress={() => setModalAberto(false)}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center", gap: 24 },
  relogio: { fontSize: 18, textAlign: "center", fontVariant: ["tabular-nums"] },
  card: {
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 32,
    paddingHorizontal: 20,
    gap: 12,
  },
  linhaModo: { flexDirection: "row", alignItems: "center", gap: 8 },
  modo: { fontSize: 18, fontWeight: "600" },
  bolinha: { width: 10, height: 10, borderRadius: 5 },
  contador: {
    fontSize: 72,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  ciclo: { fontSize: 15, fontWeight: "600" },
  linhaTarefa: { flexDirection: "row", alignItems: "center", gap: 6 },
  tarefa: { fontSize: 15, flexShrink: 1 },
  audioAtual: { fontSize: 13, fontWeight: "600" },
  aviso: { fontSize: 14, fontWeight: "600", textAlign: "center" },
  hoje: { fontSize: 16, fontWeight: "600", textAlign: "center" },
  linhaHumor: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  textoHumor: { fontSize: 15, fontWeight: "600" },
  botoes: { gap: 12 },
  linhaBotoes: { flexDirection: "row", gap: 12 },
  metade: { flex: 1 },
  fundoModal: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  caixaModal: {
    maxHeight: "70%",
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  tituloModal: { fontSize: 18, fontWeight: "bold" },
  listaModal: { flexGrow: 0 },
  conteudoModal: { gap: 10 },
  opcao: { borderWidth: 2, borderRadius: 12, padding: 12 },
  opcaoTitulo: { fontSize: 16, fontWeight: "600" },
  opcaoDetalhe: { fontSize: 13, marginTop: 2 },
  vazioModal: { textAlign: "center", paddingVertical: 20, fontSize: 14 },
});
