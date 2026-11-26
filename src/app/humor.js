import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Botao from "../components/Botao";
import SecaoBusca from "../components/SecaoBusca";
import { useApp } from "../context/AppContext";
import useBusca from "../hooks/useBusca";
import { buscarMusicas, buscarSons } from "../utils/api";
import { BUSCAS, HUMORES } from "../utils/humor";
import { CHAVES, lerDados, salvarDados } from "../utils/storage";

export default function Humor() {
  // Todos os hooks ficam aqui em cima, no corpo do componente
  const { tema } = useApp();
  // O Timer manda o id da sessão quando abre a tela sozinho
  const { sessaoId } = useLocalSearchParams();
  const [humor, setHumor] = useState(null); // id do humor escolhido
  // Cada seção tem o seu contador, para repetir só a busca dela
  const [contadorSom, setContadorSom] = useState(0);
  const [contadorMusica, setContadorMusica] = useState(0);

  // Duas buscas independentes, cada uma com seu loading e seu erro
  const som = useBusca(
    buscarSons,
    humor ? BUSCAS[humor].som : null,
    contadorSom,
  );
  const musica = useBusca(
    buscarMusicas,
    humor ? BUSCAS[humor].musica : null,
    contadorMusica,
  );

  // Guarda o que foi escolhido, para o Timer tocar depois
  useEffect(() => {
    const somEscolhido = som.itens.find((i) => i.id === som.escolhido) || null;
    const musicaEscolhida =
      musica.itens.find((i) => i.id === musica.escolhido) || null;

    if (somEscolhido === null && musicaEscolhida === null) {
      return; // nada novo para guardar
    }

    async function guardar() {
      const atual = await lerDados(CHAVES.audio, { musica: null, som: null });
      await salvarDados(CHAVES.audio, {
        musica: musicaEscolhida || atual.musica,
        som: somEscolhido || atual.som,
      });
    }
    guardar();
  }, [som.escolhido, musica.escolhido]);

  // Grava o humor na sessão que acabou de terminar (quando há uma)
  async function gravarHumorNaSessao(idHumor) {
    if (!sessaoId) {
      return; // abriu pelo link manual: nenhuma sessão para atualizar
    }
    const historico = await lerDados(CHAVES.historico, []);
    const atualizado = historico.map((s) =>
      s.id === sessaoId ? { ...s, humor: idHumor } : s,
    );
    await salvarDados(CHAVES.historico, atualizado);
  }

  // Escolher um humor (ou tocar de novo no mesmo) refaz as duas buscas
  function escolherHumor(id) {
    setHumor(id);
    setContadorSom(contadorSom + 1);
    setContadorMusica(contadorMusica + 1);
    gravarHumorNaSessao(id);
  }

  // Volta para a tela anterior. Se não houver (tela aberta direto), vai para o Timer.
  function voltar() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: tema.fundo }]}
      edges={["bottom"]}
    >
      <ScrollView contentContainerStyle={styles.conteudo}>
        <Text style={[styles.pergunta, { color: tema.texto }]}>
          Como você está agora?
        </Text>

        <View style={styles.humores}>
          {HUMORES.map((h) => (
            <Pressable
              key={h.id}
              onPress={() => escolherHumor(h.id)}
              style={[
                styles.humor,
                {
                  backgroundColor: tema.card,
                  borderColor: humor === h.id ? tema.foco : tema.borda,
                },
              ]}
            >
              <Text style={styles.emoji}>{h.emoji}</Text>
              <Text style={[styles.rotuloHumor, { color: tema.texto }]}>
                {h.rotulo}
              </Text>
            </Pressable>
          ))}
        </View>

        {humor === null && (
          <Text style={[styles.dica, { color: tema.textoSecundario }]}>
            Escolha como você está para receber sugestões.
          </Text>
        )}

        {humor !== null && (
          <>
            <SecaoBusca
              titulo="Som para a pausa"
              icone="leaf-outline"
              textoCarregando="Buscando sons..."
              carregando={som.carregando}
              erro={som.erro}
              onTentarDeNovo={() => setContadorSom(contadorSom + 1)}
              itens={som.itens}
              escolhidoId={som.escolhido}
              onEscolher={som.setEscolhido}
              credito="Sons via Freesound, com licença Creative Commons."
            />

            <SecaoBusca
              titulo="Música para o próximo foco"
              icone="musical-notes-outline"
              textoCarregando="Buscando músicas..."
              carregando={musica.carregando}
              erro={musica.erro}
              onTentarDeNovo={() => setContadorMusica(contadorMusica + 1)}
              itens={musica.itens}
              escolhidoId={musica.escolhido}
              onEscolher={musica.setEscolhido}
              credito="Músicas via Jamendo, com licença Creative Commons."
            />
          </>
        )}
      </ScrollView>

      <View style={styles.rodape}>
        <Botao titulo={humor === null ? "Pular" : "Pronto"} onPress={voltar} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  conteudo: { padding: 20, gap: 12 },
  pergunta: { fontSize: 22, fontWeight: "bold" },
  humores: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  humor: {
    width: "48%",
    alignItems: "center",
    gap: 4,
    borderWidth: 2,
    borderRadius: 12,
    paddingVertical: 14,
  },
  emoji: { fontSize: 28 },
  rotuloHumor: { fontSize: 15, fontWeight: "600" },
  dica: { fontSize: 14 },
  rodape: { padding: 20, paddingTop: 8 },
});
