import { StyleSheet, Text, TextInput, View } from "react-native";
import { useApp } from "../context/AppContext";

export default function CampoNumerico({
  rotulo,
  ajuda,
  valor,
  onChangeText,
  placeholder,
}) {
  const { tema } = useApp();

  return (
    <View style={styles.container}>
      <Text style={[styles.rotulo, { color: tema.texto }]}>{rotulo}</Text>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: tema.card,
            borderColor: tema.borda,
            color: tema.texto,
          },
        ]}
        value={valor}
        onChangeText={onChangeText}
        keyboardType="number-pad"
        placeholder={placeholder}
        placeholderTextColor={tema.textoSecundario}
      />
      <Text style={[styles.ajuda, { color: tema.textoSecundario }]}>
        {ajuda}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  rotulo: { fontSize: 15, fontWeight: "600", marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
  },
  ajuda: { fontSize: 13, marginTop: 4 },
});
