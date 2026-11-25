import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, FlatList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Botao from "../../components/Botao";
import CardSessao from "../../components/CardSessao";
import { useApp } from "../../context/AppContext";
import { CHAVES, lerDados, salvarDados } from "../../utils/storage";

export default function Historico() {
  const { tema } = useApp();
  const [historico, setHistorico] = useState([]);

  // Lê o histórico salvo toda vez que esta aba ganha foco
  useFocusEffect(
    useCallback(() => {
      async function carregar() {
        const salvo = await lerDados(CHAVES.historico, []);
        setHistorico(salvo);
      }
      carregar();
    }, []),
  );

  // Totais calculados a partir da lista
  const totalSessoes = historico.length;
  const totalMinutos = historico.reduce(
    (soma, sessao) => soma + sessao.duracao,
    0,
  );

  async function atualizarHistorico(novaLista) {
    setHistorico(novaLista);
    await salvarDados(CHAVES.historico, novaLista);
  }

  // TEMPORÁRIO: cria uma sessão de exemplo. Apagar quando o Timer existir.
  function adicionarTeste() {
    const nova = {
      id: Date.now().toString(),
      tarefa: "Estudar React Native",
      duracao: 25,
      dataHora: new Date().toISOString(),
    };
    atualizarHistorico([nova, ...historico]);
  }

  function confirmarLimpeza() {
    Alert.alert(
      "Limpar histórico",
      "Tem certeza? Isso apaga todas as sessões.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Limpar",
          style: "destructive",
          onPress: () => atualizarHistorico([]),
        },
      ],
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: tema.fundo }]}
      edges={["top"]}
    >
      <Text style={[styles.titulo, { color: tema.texto }]}>Histórico</Text>

      <View style={styles.resumo}>
        <View
          style={[
            styles.caixa,
            { backgroundColor: tema.card, borderColor: tema.borda },
          ]}
        >
          <Text style={[styles.numero, { color: tema.foco }]}>
            {totalSessoes}
          </Text>
          <Text style={[styles.rotulo, { color: tema.textoSecundario }]}>
            Sessões concluídas
          </Text>
        </View>
        <View
          style={[
            styles.caixa,
            { backgroundColor: tema.card, borderColor: tema.borda },
          ]}
        >
          <Text style={[styles.numero, { color: tema.descanso }]}>
            {totalMinutos}
          </Text>
          <Text style={[styles.rotulo, { color: tema.textoSecundario }]}>
            Minutos focados
          </Text>
        </View>
      </View>

      <FlatList
        data={historico}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CardSessao
            tarefa={item.tarefa}
            duracao={item.duracao}
            dataHora={item.dataHora}
          />
        )}
        contentContainerStyle={styles.lista}
        ListEmptyComponent={
          <Text style={[styles.vazio, { color: tema.textoSecundario }]}>
            Nenhuma sessão concluída ainda.
          </Text>
        }
      />

      <View style={styles.rodape}>
        {/* TEMPORÁRIO: sai quando o Timer estiver pronto */}
        <Botao
          titulo="Adicionar sessão de teste"
          variante="contorno"
          cor="descanso"
          onPress={adicionarTeste}
        />
        <Botao
          titulo="Limpar histórico"
          onPress={confirmarLimpeza}
          desabilitado={historico.length === 0}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  titulo: { fontSize: 24, fontWeight: "bold", marginBottom: 16 },
  resumo: { flexDirection: "row", gap: 12, marginBottom: 16 },
  caixa: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  numero: { fontSize: 32, fontWeight: "bold" },
  rotulo: { fontSize: 13, marginTop: 2 },
  lista: { gap: 10, paddingBottom: 12 },
  vazio: { textAlign: "center", marginTop: 40, fontSize: 15 },
  rodape: { gap: 10, paddingVertical: 12 },
});
