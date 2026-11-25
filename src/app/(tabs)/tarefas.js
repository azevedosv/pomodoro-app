import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Botao from "../../components/Botao";
import { useApp } from "../../context/AppContext";
import { CHAVES, lerDados, salvarDados } from "../../utils/storage";

export default function Tarefas() {
  const { tema } = useApp();
  const [tarefas, setTarefas] = useState([]);
  const [texto, setTexto] = useState("");
  const [erro, setErro] = useState("");

  // Lê as tarefas salvas toda vez que esta aba ganha foco
  useFocusEffect(
    useCallback(() => {
      async function carregar() {
        const salvas = await lerDados(CHAVES.tarefas, []);
        setTarefas(salvas);
      }
      carregar();
    }, []),
  );

  // Atualiza a tela E grava no aparelho (mesma ideia do salvarConfig)
  async function atualizarTarefas(novaLista) {
    setTarefas(novaLista);
    await salvarDados(CHAVES.tarefas, novaLista);
  }

  function adicionar() {
    const titulo = texto.trim();
    if (titulo === "") {
      setErro("Digite o nome da tarefa.");
      return;
    }
    const nova = {
      id: Date.now().toString(),
      titulo: titulo,
      concluida: false,
      pomodoros: 0,
      selecionada: false,
    };
    atualizarTarefas([...tarefas, nova]);
    setTexto("");
    setErro("");
  }

  // Só uma tarefa pode estar selecionada. Tocar de novo desmarca.
  function selecionar(id) {
    const alvo = tarefas.find((t) => t.id === id);
    if (alvo.concluida) {
      return; // tarefa concluída não pode ser a ativa
    }
    atualizarTarefas(
      tarefas.map((t) => ({
        ...t,
        selecionada: t.id === id ? !t.selecionada : false,
      })),
    );
  }

  function alternarConclusao(id) {
    atualizarTarefas(
      tarefas.map((t) =>
        t.id === id ? { ...t, concluida: !t.concluida, selecionada: false } : t,
      ),
    );
  }

  function excluir(id) {
    atualizarTarefas(tarefas.filter((t) => t.id !== id));
  }

  // Desenha UMA tarefa da lista
  function renderTarefa({ item }) {
    return (
      <Pressable
        onPress={() => selecionar(item.id)}
        style={[
          styles.item,
          {
            backgroundColor: tema.card,
            borderColor: item.selecionada ? tema.foco : tema.borda,
          },
        ]}
      >
        <View style={styles.textos}>
          <Text
            style={[
              styles.tituloTarefa,
              { color: item.concluida ? tema.textoSecundario : tema.texto },
              item.concluida && styles.riscado,
            ]}
          >
            {item.titulo}
          </Text>
          <Text style={[styles.detalhe, { color: tema.textoSecundario }]}>
            Pomodoros: {item.pomodoros}
          </Text>
        </View>

        <Pressable onPress={() => alternarConclusao(item.id)} hitSlop={8}>
          <Ionicons
            name={
              item.concluida ? "checkmark-circle" : "checkmark-circle-outline"
            }
            size={28}
            color={tema.descanso}
          />
        </Pressable>

        <Pressable onPress={() => excluir(item.id)} hitSlop={8}>
          <Ionicons
            name="trash-outline"
            size={24}
            color={tema.textoSecundario}
          />
        </Pressable>
      </Pressable>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: tema.fundo }]}
      edges={["top"]}
    >
      <Text style={[styles.titulo, { color: tema.texto }]}>Tarefas</Text>

      <View style={styles.linhaNova}>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: tema.card,
              borderColor: tema.borda,
              color: tema.texto,
            },
          ]}
          value={texto}
          onChangeText={(t) => {
            setTexto(t);
            setErro("");
          }}
          onSubmitEditing={adicionar}
          placeholder="Nova tarefa"
          placeholderTextColor={tema.textoSecundario}
        />
        <Botao titulo="Adicionar" cor="descanso" onPress={adicionar} />
      </View>

      {erro !== "" && (
        <Text style={[styles.erro, { color: tema.foco }]}>{erro}</Text>
      )}

      <FlatList
        data={tarefas}
        keyExtractor={(item) => item.id}
        renderItem={renderTarefa}
        contentContainerStyle={styles.lista}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <Text style={[styles.vazio, { color: tema.textoSecundario }]}>
            Nenhuma tarefa ainda. Adicione a primeira!
          </Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  titulo: { fontSize: 24, fontWeight: "bold", marginBottom: 16 },
  linhaNova: { flexDirection: "row", gap: 10, alignItems: "center" },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  erro: { fontSize: 14, fontWeight: "600", marginTop: 8 },
  lista: { paddingTop: 16, paddingBottom: 24, gap: 10 },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 2,
    borderRadius: 12,
    padding: 14,
  },
  textos: { flex: 1 },
  tituloTarefa: { fontSize: 16, fontWeight: "600" },
  riscado: { textDecorationLine: "line-through" },
  detalhe: { fontSize: 13, marginTop: 2 },
  vazio: { textAlign: "center", marginTop: 40, fontSize: 15 },
});
