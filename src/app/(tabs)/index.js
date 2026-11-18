import { router } from "expo-router";
import { Button, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Timer() {
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Text style={styles.titulo}>Timer</Text>
      {/* Botão temporário, só para testar a navegação em Stack */}
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
