// variante: "sólido" (preenchido) ou "contorno" (só a borda)

import { Pressable, StyleSheet, Text } from "react-native";
import { useApp } from "../context/AppContext";

// cor : "foco" (vermelho) ou "descanso" (verde-água)
export default function Botao({
  titulo,
  onPress,
  variante = "solido",
  cor = "foco",
  desabilitado = false,
}) {
  const { tema } = useApp();

  const corPrincipal = tema[cor];
  const solido = variante === "solido";

  return (
    <Pressable
      onPress={onPress}
      disabled={desabilitado}
      style={({ pressed }) => [
        styles.botao,
        solido
          ? { backgroundColor: corPrincipal }
          : { borderColor: corPrincipal, borderWidth: 2 },
        pressed && styles.pressionado,
        desabilitado && styles.desabilitado,
      ]}
    >
      <Text
        style={[styles.texto, { color: solido ? "#FFFFFF" : corPrincipal }]}
      >
        {titulo}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  botao: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  texto: {
    fontSize: 16,
    fontWeight: "600",
  },
  pressionado: {
    opacity: 0.7,
  },
  desabilitado: {
    opacity: 0.4,
  },
});
