import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  // O Stack é o navegador principal. Ele contém dois "destinos":
  // 1) o grupo (tabs), que é o conjunto das 4 abas
  // 2) a tela de motivação, que abre por cima das abas
  return (
    <>
      <StatusBar style="dark" />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="motivacao" options={{ title: "Motivação" }} />
      </Stack>
    </>
  );
}
