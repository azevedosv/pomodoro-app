import { Stack } from "expo-router";

export default function RootLayout() {
  // Stack é o navegador principal do app.
  // Mais para frente as abas e a tela de Motivação entram aqui.
  return <Stack screenOptions={{ headerShown: false }} />;
}
