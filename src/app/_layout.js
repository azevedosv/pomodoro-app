import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AppProvider, useApp } from "../context/AppContext";

// Componente separado porque só quem está DENTRO do Provider pode usar o useApp
function Navegacao() {
  const { config, tema } = useApp();

  return (
    <>
      <StatusBar style={config.temaEscuro ? "light" : "dark"} />
      <Stack
        screenOptions={{
          statusBarStyle: config.temaEscuro ? "light" : "dark",
          contentStyle: { backgroundColor: tema.fundo },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        {/* NOVO: a tela de humor, que abre por cima das abas */}
        <Stack.Screen
          name="humor"
          options={{
            title: "Como você está?",
            headerStyle: { backgroundColor: tema.card },
            headerTintColor: tema.texto,
          }}
        />
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
