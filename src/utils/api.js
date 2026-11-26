// As chaves vêm do arquivo .env
const JAMENDO_ID = process.env.EXPO_PUBLIC_JAMENDO_CLIENT_ID;
const FREESOUND_TOKEN = process.env.EXPO_PUBLIC_FREESOUND_TOKEN;

// Faz o pedido e devolve o JSON. Qualquer problema vira um erro com
// mensagem em português, que a tela mostra para a pessoa.
async function pedirJson(url) {
  let resposta;
  try {
    resposta = await fetch(url);
  } catch (e) {
    throw new Error("Sem conexão com a internet. Verifique e tente de novo.");
  }

  if (!resposta.ok) {
    throw new Error(`O servidor respondeu com erro (${resposta.status}).`);
  }

  return resposta.json();
}

// Busca músicas na Jamendo. Devolve uma lista no formato padrão do app.
export async function buscarMusicas(tag) {
  if (!JAMENDO_ID) {
    throw new Error(
      "Chave da Jamendo não encontrada. Confira o .env e reinicie o Expo.",
    );
  }

  const url =
    "https://api.jamendo.com/v3.0/tracks/" +
    `?client_id=${JAMENDO_ID}&format=json&limit=6` +
    `&fuzzytags=${encodeURIComponent(tag)}`;

  const dados = await pedirJson(url);

  // A Jamendo responde 200 mesmo quando dá erro. O status real está no cabeçalho.
  if (dados.headers.status !== "success") {
    throw new Error("A Jamendo não conseguiu atender o pedido. Tente de novo.");
  }
  if (dados.results.length === 0) {
    throw new Error("Nenhuma música encontrada. Toque em Tentar de novo.");
  }

  return dados.results.map((faixa) => ({
    id: String(faixa.id),
    titulo: faixa.name,
    autor: faixa.artist_name,
    url: faixa.audio,
  }));
}

// Busca sons na Freesound. Devolve uma lista no MESMO formato da Jamendo.
export async function buscarSons(termo) {
  if (!FREESOUND_TOKEN) {
    throw new Error(
      "Chave da Freesound não encontrada. Confira o .env e reinicie o Expo.",
    );
  }

  // Só sons de 20 segundos a 5 minutos (evita clipes muito curtos)
  const filtro = encodeURIComponent("duration:[20 TO 300]");
  const url =
    "https://freesound.org/apiv2/search/text/" +
    `?query=${encodeURIComponent(termo)}&token=${FREESOUND_TOKEN}` +
    `&fields=id,name,username,previews&page_size=6&filter=${filtro}`;

  const dados = await pedirJson(url);

  if (dados.results.length === 0) {
    throw new Error("Nenhum som encontrado. Toque em Tentar de novo.");
  }

  return dados.results.map((som) => ({
    id: String(som.id),
    // Tira a extensão do nome do arquivo (".wav", ".mp3"...)
    titulo: som.name.replace(/\.(wav|mp3|flac|aif|aiff|ogg)$/i, ""),
    autor: som.username,
    url: som.previews["preview-hq-mp3"],
  }));
}
