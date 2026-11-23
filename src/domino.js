// Dominó — partida para 2 jogadores (jogo de 28 peças, do 0-0 ao 6-6)

const MAIOR_NUMERO = 6;
const PECAS_POR_JOGADOR = 7;

function criarPecas() {
  const pecas = [];
  for (let a = 0; a <= MAIOR_NUMERO; a++) {
    for (let b = a; b <= MAIOR_NUMERO; b++) {
      pecas.push({ a, b });
    }
  }
  return pecas;
}

function embaralharAleatorio(pecas) {
  const copia = [...pecas];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

const ehBucha = (peca) => peca.a === peca.b; // bucha (ou carroça): peça com os dois lados iguais
const pontosPeca = (peca) => peca.a + peca.b;
const somaMao = (mao) => mao.reduce((total, peca) => total + pontosPeca(peca), 0);

// Quem começa: quem tiver a maior bucha; se ninguém tiver bucha, quem tiver a peça de maior soma
function definirInicio(maos) {
  let melhor = null;
  maos.forEach((mao, jogador) => {
    mao.forEach((peca, indice) => {
      const valor = ehBucha(peca) ? 1000 + peca.a : pontosPeca(peca) * 10 + Math.max(peca.a, peca.b);
      if (!melhor || valor > melhor.valor) melhor = { jogador, indice, valor };
    });
  });
  return { jogador: melhor.jogador, peca: maos[melhor.jogador][melhor.indice] };
}

class Partida {
  constructor({ embaralhar = embaralharAleatorio } = {}) {
    const pecas = embaralhar(criarPecas());
    this.maos = [pecas.slice(0, PECAS_POR_JOGADOR), pecas.slice(PECAS_POR_JOGADOR, PECAS_POR_JOGADOR * 2)];
    this.monte = pecas.slice(PECAS_POR_JOGADOR * 2);
    this.mesa = [];
    this.estado = 'jogando';
    this.vencedor = null;
    this.pontos = 0;
    this.motivo = null;

    const inicio = definirInicio(this.maos);
    this.vez = inicio.jogador;
    this.pecaInicial = inicio.peca;
  }

  get pontas() {
    if (this.mesa.length === 0) return null;
    return { esquerda: this.mesa[0].a, direita: this.mesa[this.mesa.length - 1].b };
  }

  encaixa(peca, lado) {
    const ponta = this.pontas[lado];
    return peca.a === ponta || peca.b === ponta;
  }

  podeJogar(jogador) {
    if (this.mesa.length === 0) return true;
    return this.maos[jogador].some((peca) => this.encaixa(peca, 'esquerda') || this.encaixa(peca, 'direita'));
  }

  jogar(jogador, indicePeca, lado = 'direita') {
    this.validarVez(jogador);
    if (lado !== 'esquerda' && lado !== 'direita') throw new Error('Lado inválido: use esquerda ou direita');

    const peca = this.maos[jogador][indicePeca];
    if (!peca) throw new Error('Peça inválida');

    if (this.mesa.length === 0) {
      if (peca !== this.pecaInicial) throw new Error('A primeira jogada deve ser feita com a peça inicial');
      this.mesa.push({ ...peca });
    } else {
      if (!this.encaixa(peca, lado)) throw new Error('A peça não encaixa nesta ponta');
      this.colocarNaMesa(peca, lado);
    }

    this.maos[jogador].splice(indicePeca, 1);

    if (this.maos[jogador].length === 0) {
      this.finalizar(jogador, 'batida');
      return;
    }
    this.proximoJogador();
  }

  // Gira a peça para que o lado igual fique encostado na ponta
  colocarNaMesa(peca, lado) {
    const { esquerda, direita } = this.pontas;
    if (lado === 'direita') {
      this.mesa.push(peca.a === direita ? { a: peca.a, b: peca.b } : { a: peca.b, b: peca.a });
    } else {
      this.mesa.unshift(peca.b === esquerda ? { a: peca.a, b: peca.b } : { a: peca.b, b: peca.a });
    }
  }

  comprar(jogador) {
    this.validarVez(jogador);
    if (this.podeJogar(jogador)) throw new Error('Só é possível comprar quando não há peça que encaixe');
    if (this.monte.length === 0) throw new Error('O monte está vazio');
    const peca = this.monte.shift();
    this.maos[jogador].push(peca);
    return peca;
  }

  passar(jogador) {
    this.validarVez(jogador);
    if (this.podeJogar(jogador)) throw new Error('Não é possível passar tendo peça que encaixa');
    if (this.monte.length > 0) throw new Error('É preciso comprar do monte antes de passar');
    this.proximoJogador();
  }

  proximoJogador() {
    this.vez = 1 - this.vez;
    const trancado = this.monte.length === 0 && !this.podeJogar(0) && !this.podeJogar(1);
    if (trancado) this.finalizarTrancado();
  }

  // Jogo trancado: vence quem tiver menos pontos na mão
  finalizarTrancado() {
    const [soma0, soma1] = this.maos.map(somaMao);
    if (soma0 === soma1) {
      this.finalizar(null, 'trancado');
    } else {
      this.finalizar(soma0 < soma1 ? 0 : 1, 'trancado');
    }
  }

  // O vencedor marca a soma dos pontos que ficaram na mão do adversário
  finalizar(vencedor, motivo) {
    this.estado = 'finalizada';
    this.vencedor = vencedor;
    this.motivo = motivo;
    this.pontos = vencedor === null ? 0 : somaMao(this.maos[1 - vencedor]);
  }

  validarVez(jogador) {
    if (this.estado === 'finalizada') throw new Error('A partida já terminou');
    if (jogador !== this.vez) throw new Error('Não é a vez deste jogador');
  }
}

module.exports = {
  PECAS_POR_JOGADOR,
  criarPecas,
  embaralharAleatorio,
  ehBucha,
  pontosPeca,
  somaMao,
  definirInicio,
  Partida,
};