import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useApp } from "../context/AppContext";

export default function CardFaixa({
  titulo,
  autor,
  icone = "musical-notes-outline",
  selecionado = false,
  onPress,
}) {
  const { tema } = useApp();

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: tema.card,
          borderColor: selecionado ? tema.foco : tema.borda,
        },
      ]}
    >
      <Ionicons
        name={icone}
        size={22}
        color={selecionado ? tema.foco : tema.textoSecundario}
      />
      <View style={styles.textos}>
        <Text style={[styles.titulo, { color: tema.texto }]} numberOfLines={1}>
          {titulo}
        </Text>
        <Text
          style={[styles.autor, { color: tema.textoSecundario }]}
          numberOfLines={1}
        >
          {autor}
        </Text>
      </View>
      {selecionado && (
        <Ionicons name="checkmark-circle" size={22} color={tema.foco} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 2,
    borderRadius: 12,
    padding: 12,
  },
  textos: { flex: 1 },
  titulo: { fontSize: 15, fontWeight: "600" },
  autor: { fontSize: 13, marginTop: 2 },
});
