import { StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Configuracoes() {
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Text style={styles.titulo}>Configurações</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  titulo: { fontSize: 24, fontWeight: "bold" },
});
