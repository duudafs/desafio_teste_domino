const {
  PECAS_POR_JOGADOR,
  criarPecas,
  embaralharAleatorio,
  ehBucha,
  pontosPeca,
  somaMao,
  definirInicio,
  Partida,
} = require('../src/domino');

// ---------- Auxiliares ----------

// Peça escrita sempre com o menor número primeiro, como no jogo criado por criarPecas()
const p = (x, y) => ({ a: Math.min(x, y), b: Math.max(x, y) });
const mesmaPeca = (peca, outra) => peca.a === outra.a && peca.b === outra.b;

// Monta uma partida em que cada jogador recebe exatamente as peças indicadas;
// o restante vai para o monte, na ordem do jogo
function partidaCom(mao0, mao1) {
  const escolhidas = [...mao0, ...mao1];
  const resto = criarPecas().filter((peca) => !escolhidas.some((e) => mesmaPeca(e, peca)));
  return new Partida({ embaralhar: () => [...escolhidas, ...resto] });
}

// Coloca a partida em um momento específico do jogo (mesa, mãos, monte e vez)
function partidaEmAndamento({ maos, mesa, monte = [], vez = 0 }) {
  const partida = new Partida();
  partida.maos = maos;
  partida.mesa = mesa;
  partida.monte = monte;
  partida.vez = vez;
  return partida;
}

// Jogador 0 tem a bucha de 6 (começa); jogador 1 não tem nenhuma peça com 6, exceto o 4-6
const MAO_0 = [p(6, 6), p(5, 6), p(4, 5), p(3, 4), p(2, 3), p(1, 2), p(0, 1)];
const MAO_1 = [p(5, 5), p(4, 6), p(4, 4), p(3, 3), p(2, 2), p(1, 1), p(0, 0)];

// Jogador 1 sem nenhuma peça com 6: depois do 6-6, ele precisa comprar
const MAO_1_SEM_SEIS = [p(5, 5), p(4, 4), p(3, 3), p(2, 2), p(1, 1), p(0, 0), p(0, 2)];

// ---------- RN01 - Peças ----------

describe('RN01 - Peças do dominó', () => {
  test('CT01 [RN01] - o jogo tem 28 peças', () => {
    expect(criarPecas()).toHaveLength(28);
  });

  test('CT02 [RN01] - todas as combinações de 0-0 a 6-6 aparecem uma única vez', () => {
    const pecas = criarPecas();
    const chaves = new Set(pecas.map((peca) => `${peca.a}-${peca.b}`));
    expect(chaves.size).toBe(28);
    expect(chaves.has('0-0')).toBe(true);
    expect(chaves.has('3-5')).toBe(true);
    expect(chaves.has('6-6')).toBe(true);
    expect(pecas.filter(ehBucha)).toHaveLength(7); // 0-0, 1-1, ..., 6-6
  });

  test('CT03 [RN01] - os pontos de uma peça são a soma dos dois lados', () => {
    expect(pontosPeca(p(6, 5))).toBe(11);
    expect(pontosPeca(p(0, 0))).toBe(0);
    expect(somaMao([p(6, 6), p(1, 2), p(0, 0)])).toBe(15);
  });

  test('CT04 [RN01] - embaralhar mantém as mesmas 28 peças', () => {
    const embaralhadas = embaralharAleatorio(criarPecas());
    expect(embaralhadas).toHaveLength(28);
    expect(new Set(embaralhadas.map((peca) => `${peca.a}-${peca.b}`)).size).toBe(28);
  });
});

// ---------- RN02 - Distribuição ----------

describe('RN02 - Distribuição das peças', () => {
  test('CT05 [RN02] - cada jogador recebe 7 peças e 14 ficam no monte', () => {
    const partida = new Partida();
    expect(PECAS_POR_JOGADOR).toBe(7);
    expect(partida.maos).toHaveLength(2);
    expect(partida.maos[0]).toHaveLength(7);
    expect(partida.maos[1]).toHaveLength(7);
    expect(partida.monte).toHaveLength(14);
  });

  test('CT06 [RN02] - nenhuma peça se repete entre as mãos e o monte', () => {
    const partida = new Partida();
    const todas = [...partida.maos[0], ...partida.maos[1], ...partida.monte];
    expect(new Set(todas.map((peca) => `${peca.a}-${peca.b}`)).size).toBe(28);
  });

  test('CT07 [RN02] - a partida começa com a mesa vazia e em andamento', () => {
    const partida = partidaCom(MAO_0, MAO_1);
    expect(partida.mesa).toEqual([]);
    expect(partida.pontas).toBeNull();
    expect(partida.estado).toBe('jogando');
    expect(partida.podeJogar(0)).toBe(true); // com a mesa vazia, a primeira peça sempre pode ser jogada
  });
});

// ---------- RN03 - Quem começa ----------

describe('RN03 - Quem começa', () => {
  test('CT08 [RN03] - começa quem tiver a maior bucha', () => {
    const partida = partidaCom(MAO_1, MAO_0); // agora o 6-6 está com o jogador 1
    expect(partida.vez).toBe(1);
    expect(partida.pecaInicial).toEqual(p(6, 6));
  });

  test('CT09 [RN03] - a maior bucha vale mais que qualquer peça comum', () => {
    const inicio = definirInicio([[p(5, 6), p(4, 6)], [p(1, 1), p(0, 2)]]);
    expect(inicio).toEqual({ jogador: 1, peca: p(1, 1) });
  });

  test('CT10 [RN03] - sem buchas, começa quem tiver a peça de maior soma', () => {
    const inicio = definirInicio([[p(0, 1), p(2, 3)], [p(4, 6), p(1, 5)]]);
    expect(inicio).toEqual({ jogador: 1, peca: p(4, 6) });
  });

  test('CT11 [RN03] - a primeira jogada deve ser feita com a peça inicial', () => {
    const partida = partidaCom(MAO_0, MAO_1);
    expect(() => partida.jogar(0, 1)).toThrow('A primeira jogada deve ser feita com a peça inicial');
    partida.jogar(0, 0);
    expect(partida.mesa).toEqual([p(6, 6)]);
    expect(partida.pontas).toEqual({ esquerda: 6, direita: 6 });
  });
});

// ---------- RN04 - Vez de jogar ----------

describe('RN04 - Vez de jogar', () => {
  test('CT12 [RN04] - jogador fora da vez não pode jogar', () => {
    const partida = partidaCom(MAO_0, MAO_1);
    expect(() => partida.jogar(1, 0)).toThrow('Não é a vez deste jogador');
  });

  test('CT13 [RN04] - depois de jogar, a vez passa para o outro jogador', () => {
    const partida = partidaCom(MAO_0, MAO_1);
    partida.jogar(0, 0);
    expect(partida.vez).toBe(1);
    expect(partida.maos[0]).toHaveLength(6);
  });
});

// ---------- RN05 - Encaixe das peças ----------

describe('RN05 - Encaixe das peças', () => {
  // Mesa com o 6 na ponta esquerda e o 4 na ponta direita
  const emAndamento = (mao) => partidaEmAndamento({
    mesa: [{ a: 6, b: 6 }, { a: 6, b: 4 }],
    maos: [mao, [p(0, 0), p(1, 1)]],
  });

  test('CT14 [RN05] - a peça encaixa quando tem o mesmo número da ponta', () => {
    const partida = emAndamento([p(4, 5), p(0, 1)]);
    partida.jogar(0, 0, 'direita');
    expect(partida.mesa[partida.mesa.length - 1]).toEqual({ a: 4, b: 5 });
    expect(partida.pontas).toEqual({ esquerda: 6, direita: 5 });
  });

  test('CT15 [RN05] - a peça é girada para encaixar na ponta direita', () => {
    const partida = emAndamento([p(1, 4), p(0, 1)]);
    partida.jogar(0, 0, 'direita');
    expect(partida.mesa[partida.mesa.length - 1]).toEqual({ a: 4, b: 1 });
    expect(partida.pontas.direita).toBe(1);
  });

  test('CT16 [RN05] - a peça encaixa na ponta esquerda', () => {
    const partida = emAndamento([p(3, 6), p(0, 1)]);
    partida.jogar(0, 0, 'esquerda');
    expect(partida.mesa[0]).toEqual({ a: 3, b: 6 });
    expect(partida.pontas).toEqual({ esquerda: 3, direita: 4 });
  });

  test('CT17 [RN05] - a peça é girada para encaixar na ponta esquerda', () => {
    const partida = partidaEmAndamento({ mesa: [{ a: 2, b: 4 }], maos: [[p(2, 5), p(0, 1)], [p(0, 0)]] });
    partida.jogar(0, 0, 'esquerda');
    expect(partida.mesa[0]).toEqual({ a: 5, b: 2 });
    expect(partida.pontas.esquerda).toBe(5);
  });

  test('CT18 [RN05] - peça que não encaixa na ponta escolhida não pode ser jogada', () => {
    const partida = emAndamento([p(4, 5), p(0, 1)]);
    expect(() => partida.jogar(0, 0, 'esquerda')).toThrow('A peça não encaixa nesta ponta');
    expect(() => partida.jogar(0, 1, 'direita')).toThrow('A peça não encaixa nesta ponta');
  });

  test('CT19 [RN05] - lado ou peça inválidos geram erro', () => {
    const partida = emAndamento([p(4, 5), p(0, 1)]);
    expect(() => partida.jogar(0, 0, 'meio')).toThrow('Lado inválido: use esquerda ou direita');
    expect(() => partida.jogar(0, 9, 'direita')).toThrow('Peça inválida');
  });
});

// ---------- RN06 - Compra no monte ----------

describe('RN06 - Compra no monte', () => {
  test('CT20 [RN06] - quem tem peça que encaixa não pode comprar', () => {
    const partida = partidaCom(MAO_0, MAO_1);
    partida.jogar(0, 0); // 6-6
    expect(partida.podeJogar(1)).toBe(true); // o jogador 1 tem o 4-6
    expect(() => partida.comprar(1)).toThrow('Só é possível comprar quando não há peça que encaixe');
  });

  test('CT21 [RN06] - sem peça que encaixe, o jogador compra uma peça do monte', () => {
    const partida = partidaCom(MAO_0, MAO_1_SEM_SEIS);
    partida.jogar(0, 0); // 6-6
    const primeiraDoMonte = partida.monte[0];
    const comprada = partida.comprar(1);
    expect(comprada).toBe(primeiraDoMonte);
    expect(partida.maos[1]).toHaveLength(8);
    expect(partida.monte).toHaveLength(13);
    expect(partida.vez).toBe(1); // comprar não passa a vez
  });

  test('CT22 [RN06] - o jogador compra até conseguir uma peça que encaixe e então joga', () => {
    const partida = partidaCom(MAO_0, MAO_1_SEM_SEIS);
    partida.jogar(0, 0); // 6-6
    let compras = 0;
    while (!partida.podeJogar(1)) {
      partida.comprar(1);
      compras++;
    }
    expect(compras).toBe(4); // a 4ª peça do monte é o 0-6
    partida.jogar(1, partida.maos[1].length - 1, 'direita');
    expect(partida.pontas.direita).toBe(0);
  });

  test('CT23 [RN06] - não é possível comprar com o monte vazio', () => {
    const partida = partidaCom(MAO_0, MAO_1_SEM_SEIS);
    partida.jogar(0, 0);
    partida.monte = [];
    expect(() => partida.comprar(1)).toThrow('O monte está vazio');
  });
});

// ---------- RN07 - Passar a vez ----------

describe('RN07 - Passar a vez', () => {
  test('CT24 [RN07] - não é possível passar tendo peça que encaixa', () => {
    const partida = partidaCom(MAO_0, MAO_1);
    partida.jogar(0, 0);
    expect(() => partida.passar(1)).toThrow('Não é possível passar tendo peça que encaixa');
  });

  test('CT25 [RN07] - não é possível passar enquanto houver peças no monte', () => {
    const partida = partidaCom(MAO_0, MAO_1_SEM_SEIS);
    partida.jogar(0, 0);
    expect(() => partida.passar(1)).toThrow('É preciso comprar do monte antes de passar');
  });

  test('CT26 [RN07] - sem peça que encaixe e com o monte vazio, o jogador passa a vez', () => {
    const partida = partidaCom(MAO_0, MAO_1_SEM_SEIS);
    partida.jogar(0, 0);
    partida.monte = [];
    partida.passar(1);
    expect(partida.vez).toBe(0);
    expect(partida.estado).toBe('jogando');
  });
});

// ---------- RN08 - Batida ----------

describe('RN08 - Batida', () => {
  test('CT27 [RN08] - quem joga a última peça bate e vence a partida', () => {
    const partida = partidaEmAndamento({ mesa: [{ a: 6, b: 6 }], maos: [[p(5, 6)], [p(1, 1), p(2, 2)]] });
    partida.jogar(0, 0, 'direita');
    expect(partida.estado).toBe('finalizada');
    expect(partida.motivo).toBe('batida');
    expect(partida.vencedor).toBe(0);
  });

  test('CT28 [RN08] - quem bate marca os pontos das peças que ficaram com o adversário', () => {
    const partida = partidaEmAndamento({ mesa: [{ a: 6, b: 6 }], maos: [[p(5, 6)], [p(1, 1), p(2, 2)]] });
    partida.jogar(0, 0, 'direita');
    expect(partida.pontos).toBe(6); // 1+1 + 2+2
  });
});

// ---------- RN09 - Jogo trancado ----------

describe('RN09 - Jogo trancado', () => {
  // Depois que o jogador 1 joga o 5-6, as pontas ficam 6 e 5 e ninguém mais consegue jogar
  const trancar = (mao0, restoMao1) => {
    const partida = partidaEmAndamento({ mesa: [{ a: 6, b: 6 }], maos: [mao0, [p(5, 6), ...restoMao1]], vez: 1 });
    partida.jogar(1, 0, 'direita');
    return partida;
  };

  test('CT29 [RN09] - com o monte vazio e ninguém podendo jogar, o jogo tranca', () => {
    const partida = trancar([p(0, 1)], [p(2, 3)]);
    expect(partida.estado).toBe('finalizada');
    expect(partida.motivo).toBe('trancado');
  });

  test('CT30 [RN09] - no jogo trancado vence quem tiver menos pontos na mão', () => {
    const vence0 = trancar([p(0, 1)], [p(2, 3)]); // 1 ponto x 5 pontos
    expect(vence0.vencedor).toBe(0);
    expect(vence0.pontos).toBe(5);

    const vence1 = trancar([p(2, 4)], [p(0, 1)]); // 6 pontos x 1 ponto
    expect(vence1.vencedor).toBe(1);
    expect(vence1.pontos).toBe(6);
  });

  test('CT31 [RN09] - no jogo trancado com pontos iguais, a partida empata', () => {
    const partida = trancar([p(0, 4)], [p(1, 3)]); // 4 pontos x 4 pontos
    expect(partida.vencedor).toBeNull();
    expect(partida.pontos).toBe(0);
  });

  test('CT32 [RN09] - o jogo não tranca enquanto houver peças no monte', () => {
    const partida = partidaEmAndamento({
      mesa: [{ a: 6, b: 6 }], maos: [[p(0, 1)], [p(5, 6), p(2, 3)]], monte: [p(0, 6)], vez: 1,
    });
    partida.jogar(1, 0, 'direita');
    expect(partida.estado).toBe('jogando');
  });
});

// ---------- RN10 - Fim de partida ----------

describe('RN10 - Fim de partida', () => {
  test('CT33 [RN10] - depois do fim não é possível jogar, comprar nem passar', () => {
    const partida = partidaEmAndamento({ mesa: [{ a: 6, b: 6 }], maos: [[p(5, 6)], [p(1, 1), p(2, 2)]] });
    partida.jogar(0, 0, 'direita');
    expect(() => partida.jogar(1, 0, 'direita')).toThrow('A partida já terminou');
    expect(() => partida.comprar(1)).toThrow('A partida já terminou');
    expect(() => partida.passar(1)).toThrow('A partida já terminou');
  });
});