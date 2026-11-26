// Transforma 5 em "05"
export function doisDigitos(numero) {
  return String(numero).padStart(2, "0");
}

// Transforma uma data em "14:35:07" (relógio de 24h)
export function formatarRelogio(data) {
  const hora = doisDigitos(data.getHours());
  const minuto = doisDigitos(data.getMinutes());
  const segundo = doisDigitos(data.getSeconds());
  return `${hora}:${minuto}:${segundo}`;
}

// Transforma segundos em "MM:SS". Exemplo: 1500 vira "25:00"
export function formatarContador(segundosTotais) {
  const minutos = Math.floor(segundosTotais / 60);
  const segundos = segundosTotais % 60;
  return `${doisDigitos(minutos)}:${doisDigitos(segundos)}`;
}

// [P5] NOVO: diz se uma data (em texto ISO) é de hoje
export function ehHoje(iso) {
  const data = new Date(iso);
  const hoje = new Date();
  return (
    data.getFullYear() === hoje.getFullYear() &&
    data.getMonth() === hoje.getMonth() &&
    data.getDate() === hoje.getDate()
  );
}
