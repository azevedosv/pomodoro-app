import { useEffect, useState } from "react";
import { termoAleatorio } from "../utils/humor";

// Controla uma busca: a lista, o item escolhido, o loading e o erro.
// - buscar: a função que faz o pedido (buscarMusicas ou buscarSons)
// - termos: a lista de termos do humor (ou null enquanto não há humor)
// - contador: muda para pedir uma nova busca
export default function useBusca(buscar, termos, contador) {
  const [itens, setItens] = useState([]);
  const [escolhido, setEscolhido] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (!termos) {
      return; // ainda não há humor escolhido
    }

    let ativo = true; // vira false se uma busca mais nova começar

    async function carregar() {
      setCarregando(true);
      setErro("");
      setItens([]);
      setEscolhido(null);

      try {
        const lista = await buscar(termoAleatorio(termos));
        if (!ativo) {
          return;
        }
        setItens(lista);
        setEscolhido(lista[0].id); // já deixa o primeiro selecionado
      } catch (e) {
        if (ativo) {
          setErro(e.message);
        }
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    }

    carregar();

    // Limpeza: se o humor mudar, ignora a resposta antiga
    return () => {
      ativo = false;
    };
  }, [termos, contador]);

  return { itens, escolhido, setEscolhido, carregando, erro };
}
