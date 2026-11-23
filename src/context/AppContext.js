import { createContext, useContext, useEffect, useState } from "react";
import {
  CHAVES,
  CONFIG_PADRAO,
  TEMA_CLARO,
  TEMA_ESCURO,
  lerDados,
  salvarDados,
} from "../utils/storage";

// Problema: várias telas precisam usar os mesmos dados. Sem o Context, os dados teriam que ser passados por props;
// O AppContext resolve esse problema.
// Ou seja, AppContext é uma caixa com três regras:
// >>> Quem precisa de um dado, vai lá e pega;
// >>> Quem muda o dado, atualiza o armazém;
// >>> As telas que usam o dado se atualizam sozinhas;

// 1) Cria o armazém (ainda vazio)
const AppContext = createContext();

// 2) O Provider enche o armazém e o disponibiliza para o app todo
export function AppProvider({ children }) {
  const [config, setConfig] = useState(CONFIG_PADRAO);
  const [carregado, setCarregado] = useState(false);

  // Roda UMA vez, quando o app abre: lê as configurações salvas
  useEffect(() => {
    async function carregar() {
      const salva = await lerDados(CHAVES.config, null);
      if (salva) {
        setConfig({ ...CONFIG_PADRAO, ...salva });
      }
      setCarregado(true);
    }
    carregar();
  }, []);

  // Atualiza na tela e grava no aparelho
  async function salvarConfig(novaConfig) {
    setConfig(novaConfig);
    await salvarDados(CHAVES.config, novaConfig);
  }

  // Escolhe a paleta conforme a configuração
  const tema = config.temaEscuro ? TEMA_ESCURO : TEMA_CLARO;

  // Enquanto não leu o aparelho, não desenha nada
  if (!carregado) {
    return null;
  }

  return (
    <AppContext.Provider value={{ config, tema, salvarConfig }}>
      {children}
    </AppContext.Provider>
  );
}

// 3) Atalho para as telas usarem o armazém com uma linha
export function useApp() {
  return useContext(AppContext);
}
