import { useState } from "react";
import { ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Botao from "../../components/Botao";
import CampoNumerico from "../../components/CampoNumerico";
import { useApp } from "../../context/AppContext";
import { CONFIG_PADRAO } from "../../utils/storage";

// Os campos do texto guardam TEXTO, mas a configuração guarda NÚMEROS!
// Essa função converte a configuração em textos pra preencher os campos

function paraTextos(config) {
  return {
    foco: String(config.foco),
    pausaCurta: String(config.pausaCurta),
    pausaLonga: String(config.paulaLonga),
    meta: config.meta === null ? "" : String(config.meta),
    pausaLongaACada: String(config.paulaLongaACada),
  };
}

// Válido = só digitos e maior que zero
function inteiroValido(texto) {
  return /^\d+$/.test(texto) && Number(texto) > 0;
}

export default function Configuracoes() {
  const { config, tema, salvarConfig } = useApp();
  const [campos, setCampos] = useState(paraTextos(config));
  const [mensagem, setMensagem] = useState(null);

  function atualizarCampo(nome, texto) {
    setCampos({ ...campos, [nome]: texto });
    setMensagem(null);
  }

  async function salvar() {
    const obrigatorios = [
      "foco",
      "pausaCurta",
      "pausaLonga",
      "pausaLongaACada",
    ];
    const algumInvalido = obrigatorios.some(
      (nome) => !inteiroValido(campos[nome]),
    );
    const metaVazia = campos.meta.trim() === "";
    const metaInvalida = !metaVazia && !inteiroValido(campos.meta);

    if (algumInvalido || metaInvalida) {
      setMensagem({
        tipo: "erro",
        texto: "Use apenas números inteiros maiores que zero.",
      });
      return;
    }

    await salvarConfig({
      ...config,
      foco: Number(campos.foco),
      pausaCurta: Number(campos.pausaCurta),
      pausaLonga: Number(campos.pausaLonga),
      meta: metaVazia ? null : Number(campos.meta),
      pausaLongaACada: Number(campos.pausaLongaACada),
    });
    setMensagem({ tipo: "ok", texto: "Configurações salvas!" });
  }

  async function restaurar() {
    // Restaura os números, mas mantém o tema que a pessoa escolheu
    const restaurada = { ...CONFIG_PADRAO, temaEscuro: config.temaEscuro };
    await salvarConfig(restaurada);
    setCampos(paraTextos(restaurada));
    setMensagem({ tipo: "ok", texto: "Valores padrão restaurados." });
  }

  function alternarTema(valor) {
    salvarConfig({ ...config, temaEscuro: valor });
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: tema.fundo }]}
      edges={["top"]}
    >
      <ScrollView
        contentContainerStyle={styles.conteudo}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.titulo, { color: tema.texto }]}>
          Configurações
        </Text>

        <CampoNumerico
          rotulo="Duração do foco (min)"
          ajuda="Tempo de cada pomodoro."
          valor={campos.foco}
          onChangeText={(texto) => atualizarCampo("foco", texto)}
        />
        <CampoNumerico
          rotulo="Pausa curta (min)"
          ajuda="Descanso entre um foco e outro."
          valor={campos.pausaCurta}
          onChangeText={(texto) => atualizarCampo("pausaCurta", texto)}
        />
        <CampoNumerico
          rotulo="Pausa longa (min)"
          ajuda="Descanso maior, depois de vários focos."
          valor={campos.pausaLonga}
          onChangeText={(texto) => atualizarCampo("pausaLonga", texto)}
        />
        <CampoNumerico
          rotulo="Meta de pomodoros (opcional)"
          ajuda="Deixe em branco para não ter limite."
          valor={campos.meta}
          placeholder="Sem limite"
          onChangeText={(texto) => atualizarCampo("meta", texto)}
        />
        <CampoNumerico
          rotulo="Pausa longa a cada (focos)"
          ajuda="Quantos focos até a pausa longa."
          valor={campos.pausaLongaACada}
          onChangeText={(texto) => atualizarCampo("pausaLongaACada", texto)}
        />

        <View style={styles.linhaTema}>
          <Text style={[styles.rotulo, { color: tema.texto }]}>
            Tema escuro
          </Text>
          <Switch
            value={config.temaEscuro}
            onValueChange={alternarTema}
            trackColor={{ false: tema.borda, true: tema.descanso }}
          />
        </View>

        {mensagem && (
          <Text
            style={[
              styles.mensagem,
              { color: mensagem.tipo === "erro" ? tema.foco : tema.descanso },
            ]}
          >
            {mensagem.texto}
          </Text>
        )}

        <View style={styles.botoes}>
          <Botao titulo="Salvar" onPress={salvar} />
          <Botao
            titulo="Restaurar padrão"
            variante="contorno"
            cor="descanso"
            onPress={restaurar}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  conteudo: { padding: 20 },
  titulo: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  rotulo: { fontSize: 15, fontWeight: "600" },
  linhaTema: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  mensagem: { fontSize: 14, fontWeight: "600", marginBottom: 12 },
  botoes: { gap: 12 },
});
