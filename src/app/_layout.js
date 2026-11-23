import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AppProvider, useApp } from "../context/AppContext";

// Componente separado porque só quem está DENTRO do Provider pode usar o useApp
function Navegacao() {
  const { config, tema } = useApp();

  return (
    <>
      {/* Tema escuro: ícones da barra de status claros. Tema claro: escuros. */}
      <StatusBar style={config.temaEscuro ? "light" : "dark"} />
      <Stack
        screenOptions={{
          statusBarStyle: config.temaEscuro ? "light" : "dark",
          contentStyle: { backgroundColor: tema.fundo },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="motivacao" options={{ title: "Motivação" }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <AppProvider>
      <Navegacao />
    </AppProvider>
  );
}
