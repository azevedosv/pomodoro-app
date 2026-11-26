// Os humores que a pessoa pode escolher
export const HUMORES = [
  { id: "cansado", rotulo: "Cansado", emoji: "😴" },
  { id: "estressado", rotulo: "Estressado", emoji: "😣" },
  { id: "neutro", rotulo: "Neutro", emoji: "😐" },
  { id: "animado", rotulo: "Animado", emoji: "😄" },
];

// Para cada humor: o que buscar na Jamendo (música) e na Freesound (som).
// Cada humor tem mais de uma opção, para variar a cada pomodoro.
export const BUSCAS = {
  cansado: {
    musica: ["ambient", "chill"],
    som: ["rain", "forest"],
  },
  estressado: {
    musica: ["relaxation", "piano"],
    som: ["ocean waves", "wind"],
  },
  neutro: {
    musica: ["instrumental", "chillout"],
    som: ["stream", "river"],
  },
  animado: {
    musica: ["electronic", "upbeat"],
    som: ["birds", "cafe"],
  },
};

// Sorteia um item de uma lista
export function termoAleatorio(lista) {
  const posicao = Math.floor(Math.random() * lista.length);
  return lista[posicao];
}
