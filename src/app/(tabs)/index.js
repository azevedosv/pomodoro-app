import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Botao from "../../components/Botao";
import { useApp } from "../../context/AppContext";
import { CHAVES, lerDados } from "../../utils/storage";
import { formatarContador, formatarRelogio } from "../../utils/tempo";

// Nome de cada modo para mostrar na tela
const NOMES_MODO = {
  foco: "Foco",
  pausaCurta: "Pausa curta",
  pausaLonga: "Pausa longa",
};

export default function Timer() {
  const { config, tema } = useApp();
  const [modo] = useState("foco"); // o setModo entra na parte 3
  const [agora, setAgora] = useState(new Date());
  const [tarefaAtiva, setTarefaAtiva] = useState(null);

  // Relógio: atualiza a hora atual a cada segundo
  useEffect(() => {
    const intervalo = setInterval(() => {
      setAgora(new Date());
    }, 1000);

    // Limpeza: quando a tela sair, para o relógio
    return () => clearInterval(intervalo);
  }, []);

  // Lê a tarefa selecionada toda vez que esta aba ganha foco
  useFocusEffect(
    useCallback(() => {
      async function carregar() {
        const tarefas = await lerDados(CHAVES.tarefas, []);
        const ativa = tarefas.find((t) => t.selecionada);
        setTarefaAtiva(ativa || null);
      }
      carregar();
    }, []),
  );

  // Vermelho no foco, verde-água nas pausas
  const corModo = modo === "foco" ? tema.foco : tema.descanso;
  // Os nomes dos modos são iguais às chaves da config (foco, pausaCurta...)
  const segundosTotais = config[modo] * 60;

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
          {formatarContador(segundosTotais)}
        </Text>

        <Text
          style={[styles.tarefa, { color: tema.textoSecundario }]}
          numberOfLines={1}
        >
          {tarefaAtiva ? tarefaAtiva.titulo : "Nenhuma tarefa selecionada"}
        </Text>
      </View>

      <Botao
        titulo="Motivação"
        variante="contorno"
        cor="descanso"
        onPress={() => router.push("/motivacao")}
      />
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
  tarefa: { fontSize: 15 },
});
