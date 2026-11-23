# desafio_teste_domino

Casos de teste em **JavaScript (Jest)** para uma **partida de Dominó com 2 jogadores**, testando uma implementação também em JavaScript.

## Colaboradores

## Colaboradores

- NOME: MARIA EDUARDA FURLAN SCOMPARIN
- RA: 24021296-2
- GitHub: https://github.com/duudafs

## Especificação do desafio

- Casos de teste para testar uma **partida para 2 jogadores**.
- Casos de teste em **JavaScript** para testar **JavaScript**.

Foi usado o dominó tradicional de **28 peças** (do 0-0 ao 6-6). Cada jogador recebe 7 peças, e as 14 restantes formam o **monte** de compra. As peças são encaixadas pelas pontas da mesa, e vence quem ficar sem peças primeiro (**batida**) ou, se ninguém conseguir jogar, quem tiver menos pontos na mão (**jogo trancado**).

## Regras (RN)

| RN | Regra | Descrição | Casos de teste |
|---|---|---|---|
| RN01 | Peças | O jogo tem 28 peças, com todas as combinações de 0-0 a 6-6, sem repetição. Sete delas são buchas (lados iguais). Os pontos de uma peça são a soma dos dois lados | CT01, CT02, CT03, CT04 |
| RN02 | Distribuição | Cada um dos 2 jogadores recebe 7 peças, e as 14 restantes ficam no monte. A partida começa com a mesa vazia | CT05, CT06, CT07 |
| RN03 | Quem começa | Começa quem tiver a maior bucha (6-6, depois 5-5, e assim por diante). Se ninguém tiver bucha, começa quem tiver a peça de maior soma. A primeira jogada deve ser feita com essa peça | CT08, CT09, CT10, CT11 |
| RN04 | Vez de jogar | Os jogadores jogam alternadamente. Jogador fora da vez não pode jogar | CT12, CT13 |
| RN05 | Encaixe | A peça só pode ser jogada em uma ponta da mesa que tenha o mesmo número de um dos seus lados. A peça é girada para que o lado igual fique encostado na ponta, e o outro lado vira a nova ponta | CT14 a CT19 |
| RN06 | Compra no monte | Só compra quem não tem nenhuma peça que encaixe. Compra-se uma peça por vez, quantas forem necessárias, até conseguir jogar ou o monte acabar. Comprar não passa a vez | CT20, CT21, CT22, CT23 |
| RN07 | Passar a vez | O jogador só passa a vez se não tiver peça que encaixe e o monte estiver vazio | CT24, CT25, CT26 |
| RN08 | Batida | Vence quem jogar sua última peça. O vencedor marca a soma dos pontos das peças que ficaram na mão do adversário | CT27, CT28 |
| RN09 | Jogo trancado | Se o monte estiver vazio e nenhum jogador conseguir jogar, o jogo tranca. Vence quem tiver menos pontos na mão e marca os pontos do adversário. Com pontos iguais, a partida empata | CT29, CT30, CT31, CT32 |
| RN10 | Fim de partida | Depois que a partida termina, não é possível jogar, comprar nem passar | CT33 |

## Estrutura

```
desafio_teste_domino/
├── src/
│   └── domino.js          # implementação do jogo
├── tests/
│   └── domino.test.js     # casos de teste (Jest)
├── package.json
└── README.md
```

## Como executar

```
npm install
npm test
```

Com relatório de cobertura:

```
npm run test:coverage
```

O `package.json` exige **100% de cobertura** (linhas, branches, funções e instruções). Se a cobertura cair, o comando falha.

## Casos de teste

Cada caso de teste indica a regra de negócio (RN) que ele verifica. O mesmo código aparece no nome do teste, por exemplo `CT08 [RN03] - começa quem tiver a maior bucha`.

Para que os resultados sejam sempre iguais, os testes controlam quais peças cada jogador recebe. Os cenários do fim da partida (batida e jogo trancado) começam com a mesa, as mãos e o monte já montados.

As peças são escritas como `{ a, b }`, e as pontas da mesa são consultadas em `pontas`, por exemplo `{ esquerda: 6, direita: 4 }`.

### Peças e distribuição

| CT | RN | Verificação |
|---|---|---|
| CT01 | RN01 | O jogo tem 28 peças |
| CT02 | RN01 | Todas as combinações de 0-0 a 6-6 aparecem uma única vez, com 7 buchas |
| CT03 | RN01 | Os pontos de uma peça são a soma dos dois lados |
| CT04 | RN01 | Embaralhar mantém as mesmas 28 peças |
| CT05 | RN02 | Cada jogador recebe 7 peças e 14 ficam no monte |
| CT06 | RN02 | Nenhuma peça se repete entre as mãos e o monte |
| CT07 | RN02 | A partida começa com a mesa vazia e em andamento |

### Início e vez

| CT | RN | Verificação |
|---|---|---|
| CT08 | RN03 | Começa quem tiver a maior bucha |
| CT09 | RN03 | A maior bucha vale mais que qualquer peça comum |
| CT10 | RN03 | Sem buchas, começa quem tiver a peça de maior soma |
| CT11 | RN03 | A primeira jogada deve ser feita com a peça inicial |
| CT12 | RN04 | Jogador fora da vez não pode jogar |
| CT13 | RN04 | Depois de jogar, a vez passa para o outro jogador |

### Encaixe

| CT | RN | Verificação |
|---|---|---|
| CT14 | RN05 | A peça encaixa quando tem o mesmo número da ponta |
| CT15 | RN05 | A peça é girada para encaixar na ponta direita |
| CT16 | RN05 | A peça encaixa na ponta esquerda |
| CT17 | RN05 | A peça é girada para encaixar na ponta esquerda |
| CT18 | RN05 | Peça que não encaixa na ponta escolhida não pode ser jogada |
| CT19 | RN05 | Lado ou peça inválidos geram erro |

### Compra e passar a vez

| CT | RN | Verificação |
|---|---|---|
| CT20 | RN06 | Quem tem peça que encaixa não pode comprar |
| CT21 | RN06 | Sem peça que encaixe, o jogador compra uma peça do monte |
| CT22 | RN06 | O jogador compra até conseguir uma peça que encaixe e então joga |
| CT23 | RN06 | Não é possível comprar com o monte vazio |
| CT24 | RN07 | Não é possível passar tendo peça que encaixa |
| CT25 | RN07 | Não é possível passar enquanto houver peças no monte |
| CT26 | RN07 | Sem peça que encaixe e com o monte vazio, o jogador passa a vez |

### Fim da partida

| CT | RN | Verificação |
|---|---|---|
| CT27 | RN08 | Quem joga a última peça bate e vence a partida |
| CT28 | RN08 | Quem bate marca os pontos das peças que ficaram com o adversário |
| CT29 | RN09 | Com o monte vazio e ninguém podendo jogar, o jogo tranca |
| CT30 | RN09 | No jogo trancado vence quem tiver menos pontos na mão |
| CT31 | RN09 | No jogo trancado com pontos iguais, a partida empata |
| CT32 | RN09 | O jogo não tranca enquanto houver peças no monte |
| CT33 | RN10 | Depois do fim não é possível jogar, comprar nem passar |

## Resultado

```
Tests:       33 passed, 33 total

File       | % Stmts | % Branch | % Funcs | % Lines
domino.js  |     100 |      100 |     100 |     100
```