import { router } from "expo-router";
import { Button, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useApp } from "../../context/AppContext";

export default function Timer() {
  const { config, tema, salvarConfig } = useApp();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: tema.fundo }]}
      edges={["top"]}
    >
      <Text style={[styles.titulo, { color: tema.texto }]}>Timer</Text>
      <Text style={{ color: tema.texto, marginBottom: 16 }}>
        Foco: {config.foco} min
      </Text>

      {/* TESTE: alterna o tema e salva no aparelho */}
      <Button
        title="Alternar tema"
        onPress={() =>
          salvarConfig({ ...config, temaEscuro: !config.temaEscuro })
        }
      />
      <Button
        title="Ir para Motivação"
        onPress={() => router.push("/motivacao")}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  titulo: { fontSize: 24, fontWeight: "bold", marginBottom: 16 },
});
