import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useApp } from "../context/AppContext";
import Botao from "./Botao";
import CardFaixa from "./CardFaixa";

// Uma seção da tela: título, loading, erro (com "Tentar de novo") e a lista
export default function SecaoBusca({
  titulo,
  icone,
  textoCarregando,
  carregando,
  erro,
  onTentarDeNovo,
  itens,
  escolhidoId,
  onEscolher,
  credito,
}) {
  const { tema } = useApp();

  return (
    <View style={styles.secao}>
      <Text style={[styles.titulo, { color: tema.texto }]}>{titulo}</Text>

      {carregando && (
        <View style={styles.centro}>
          <ActivityIndicator size="large" color={tema.foco} />
          <Text style={[styles.texto, { color: tema.textoSecundario }]}>
            {textoCarregando}
          </Text>
        </View>
      )}

      {erro !== "" && (
        <View style={styles.centro}>
          <Text style={[styles.erro, { color: tema.foco }]}>{erro}</Text>
          <Botao
            titulo="Tentar de novo"
            cor="descanso"
            onPress={onTentarDeNovo}
          />
        </View>
      )}

      {itens.map((item) => (
        <CardFaixa
          key={item.id}
          titulo={item.titulo}
          autor={item.autor}
          icone={icone}
          selecionado={escolhidoId === item.id}
          onPress={() => onEscolher(item.id)}
        />
      ))}

      {itens.length > 0 && (
        <Text style={[styles.credito, { color: tema.textoSecundario }]}>
          {credito}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  secao: { gap: 12 },
  titulo: { fontSize: 17, fontWeight: "600", marginTop: 8 },
  centro: { alignItems: "center", gap: 12, paddingVertical: 12 },
  texto: { fontSize: 14 },
  erro: { fontSize: 14, fontWeight: "600", textAlign: "center" },
  credito: { fontSize: 12, textAlign: "center" },
});
