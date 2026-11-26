import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, Text, Vibration, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useApp } from "../../context/AppContext";
import { CHAVES, lerDados, salvarDados } from "../../utils/storage";
// [P5] MUDOU: entrou o ehHoje no import
import Botao from "../../components/Botao";
import { ehHoje, formatarContador, formatarRelogio } from "../../utils/tempo";

// Nome de cada modo para mostrar na tela
const NOMES_MODO = {
  foco: "Foco",
  pausaCurta: "Pausa curta",
  pausaLonga: "Pausa longa",
};

export default function Timer() {
  const { config, tema } = useApp();
  const [modo, setModo] = useState("foco");
  const [ciclo, setCiclo] = useState(0); // pomodoros concluídos no ciclo
  const [aviso, setAviso] = useState("");
  const [agora, setAgora] = useState(new Date());
  const [tarefaAtiva, setTarefaAtiva] = useState(null);
  const [sessoes, setSessoes] = useState([]); // [P5] NOVO: sessões do histórico

  const [rodando, setRodando] = useState(false);
  // null = ainda não começou (mostra o tempo cheio do modo)
  const [restante, setRestante] = useState(null);
  // Guarda o horário em que o tempo termina. useRef não redesenha a tela.
  const fimRef = useRef(0);

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

  // Lê tarefa selecionada e histórico toda vez que esta aba ganha foco
  useFocusEffect(
    useCallback(() => {
      async function carregar() {
        const tarefas = await lerDados(CHAVES.tarefas, []);
        const ativa = tarefas.find((t) => t.selecionada);
        setTarefaAtiva(ativa || null);

        // [P5] NOVO: lê o histórico (pode ter sido limpo na outra aba)
        const historico = await lerDados(CHAVES.historico, []);
        setSessoes(historico);
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

  // Registra um foco concluído (tarefa + histórico)
  async function registrarSessao() {
    // 1) Soma 1 pomodoro na tarefa ativa
    const tarefas = await lerDados(CHAVES.tarefas, []);
    const ativa = tarefas.find((t) => t.selecionada);

    if (ativa) {
      const atualizadas = tarefas.map((t) =>
        t.id === ativa.id ? { ...t, pomodoros: t.pomodoros + 1 } : t,
      );
      await salvarDados(CHAVES.tarefas, atualizadas);
      setTarefaAtiva({ ...ativa, pomodoros: ativa.pomodoros + 1 });
    }

    // 2) Grava a sessão no INÍCIO do histórico (mais recente primeiro)
    const historico = await lerDados(CHAVES.historico, []);
    const nova = {
      id: Date.now().toString(),
      tarefa: ativa ? ativa.titulo : "Sem tarefa",
      duracao: config.foco,
      dataHora: new Date().toISOString(),
    };
    // [P5] MUDOU: guardamos a lista nova numa variável para também
    // atualizar a tela (antes só gravava no aparelho)
    const novaLista = [nova, ...historico];
    await salvarDados(CHAVES.historico, novaLista);
    setSessoes(novaLista);
  }

  // Decide o que acontece quando o tempo de um modo termina
  async function finalizarModo() {
    Vibration.vibrate(500);

    if (modo === "foco") {
      await registrarSessao();

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
      setAviso(
        metaAtingida
          ? "Meta do ciclo atingida! Você merece uma pausa longa."
          : "Pomodoro concluído! Hora de descansar.",
      );
    } else {
      setModo("foco");
      setAviso("Pausa encerrada. Hora de focar!");
    }

    setRestante(null);
  }

  // Quando o restante chega a 0, passa para o próximo modo
  useEffect(() => {
    if (restante === 0) {
      finalizarModo();
    }
  }, [restante]);

  const corModo = modo === "foco" ? tema.foco : tema.descanso;
  const segundosTotais = config[modo] * 60;
  const segundosExibidos = restante === null ? segundosTotais : restante;

  // [P5] NOVO: conta calculada, não precisa de useState
  const pomodorosHoje = sessoes.filter((s) => ehHoje(s.dataHora)).length;

  function iniciar() {
    fimRef.current = Date.now() + segundosExibidos * 1000;
    setAviso("");
    setRodando(true);
  }

  function pausar() {
    // Fixa o valor exato do momento da pausa
    const faltam = Math.max(0, Math.ceil((fimRef.current - Date.now()) / 1000));
    setRestante(faltam);
    setRodando(false);
  }

  // Reinicia só o tempo do modo atual (o ciclo não é mexido)
  function resetar() {
    setRodando(false);
    setRestante(null);
    setAviso("");
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

  // Texto da tarefa ativa, com o total de pomodoros dela
  let textoTarefa = "Nenhuma tarefa selecionada";
  if (tarefaAtiva) {
    const total = tarefaAtiva.pomodoros;
    textoTarefa = `${tarefaAtiva.titulo} · ${total} ${
      total === 1 ? "pomodoro" : "pomodoros"
    }`;
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

        <Text
          style={[styles.tarefa, { color: tema.textoSecundario }]}
          numberOfLines={1}
        >
          {textoTarefa}
        </Text>

        {aviso !== "" && (
          <Text style={[styles.aviso, { color: corModo }]}>{aviso}</Text>
        )}
      </View>

      {/* [P5] NOVO: total do dia, entre o cartão e os botões */}
      <Text style={[styles.hoje, { color: tema.texto }]}>
        Pomodoros hoje: {pomodorosHoje}
      </Text>

      <View style={styles.botoes}>
        <Botao
          titulo={textoPrincipal}
          onPress={rodando ? pausar : iniciar}
          desabilitado={segundosExibidos === 0}
        />
        <Botao
          titulo="Resetar"
          variante="contorno"
          onPress={resetar}
          desabilitado={restante === null && !rodando}
        />
        <Botao
          titulo="Motivação"
          variante="contorno"
          cor="descanso"
          onPress={() => router.push("/motivacao")}
        />
      </View>
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
  tarefa: { fontSize: 15 },
  aviso: { fontSize: 14, fontWeight: "600", textAlign: "center" },
  hoje: { fontSize: 16, fontWeight: "600", textAlign: "center" }, // [P5] NOVO
  botoes: { gap: 12 },
});
