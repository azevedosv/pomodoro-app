import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { useApp } from "../context/AppContext";
import { HUMORES } from "../utils/humor"; // [F]

// Transforma 5 em "05"
function doisDigitos(numero) {
  return String(numero).padStart(2, "0");
}

// Transforma o texto ISO em "24/11 às 14:30"
function formatarDataHora(iso) {
  const data = new Date(iso);
  const dia = doisDigitos(data.getDate());
  const mes = doisDigitos(data.getMonth() + 1);
  const hora = doisDigitos(data.getHours());
  const minuto = doisDigitos(data.getMinutes());
  return `${dia}/${mes} às ${hora}:${minuto}`;
}

// [MUDOU] ganhou a prop "humor"
export default function CardSessao({ tarefa, duracao, dataHora, humor }) {
  const { tema } = useApp();

  // [F] Procura o humor da sessão. Sessões antigas não têm, e dão undefined.
  const humorSessao = HUMORES.find((h) => h.id === humor);

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: tema.card, borderColor: tema.borda },
      ]}
    >
      <View style={[styles.icone, { backgroundColor: tema.foco }]}>
        <Ionicons name="timer-outline" size={20} color="#FFFFFF" />
      </View>
      <View style={styles.textos}>
        <Text style={[styles.tarefa, { color: tema.texto }]} numberOfLines={1}>
          {tarefa}
        </Text>
        <Text style={[styles.detalhe, { color: tema.textoSecundario }]}>
          {duracao} min · {formatarDataHora(dataHora)}
        </Text>
      </View>
      {/* [F] Emoji do humor, só quando existe */}
      {humorSessao && <Text style={styles.emoji}>{humorSessao.emoji}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
  },
  icone: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  textos: { flex: 1 },
  tarefa: { fontSize: 16, fontWeight: "600" },
  detalhe: { fontSize: 13, marginTop: 2 },
  emoji: { fontSize: 24 }, // [F]
});
