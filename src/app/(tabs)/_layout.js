import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useApp } from "../../context/AppContext";

export default function TabsLayout() {
  const { tema } = useApp();
  return (
    <Tabs
      screenOptions={{
        headerShown: false, // cada tela terá seu próprio título
        tabBarActiveTintColor: tema.foco,
        tabBarInactiveTintColor: tema.textoSecundario,
        tabBarStyle: {
          backgroundColor: tema.card,
          borderTopColor: tema.borda,
        },
      }}
    >
      {/* "name" é o nome do arquivo, sem o .js */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Timer",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="timer-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="tarefas"
        options={{
          title: "Tarefas",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="checkbox-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="historico"
        options={{
          title: "Histórico",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="configuracoes"
        options={{
          title: "Config.",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
