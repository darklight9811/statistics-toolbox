import type { Stat } from '../dataset-input/exportable-chart'

/**
 * Single source of truth for every statistic shown in the app (pt-BR):
 * label, what it is, what it is used for, and how to calculate it (`help`, shown in tooltips).
 */
export const STATS: Record<string, { label: string; what: string; use: string; help: string; formula: string }> = {
  n: {
    formula: String.raw`n = \text{quantidade de valores}`,
    label: 'n',
    what: 'O tamanho da amostra: quantos valores há no conjunto.',
    use: 'Mostra o quanto os demais resultados são confiáveis: quanto maior o n, mais estáveis as estatísticas.',
    help: 'Quantidade de valores do conjunto. Basta contar os números informados.',
  },
  min: {
    formula: String.raw`x_{\min} = x_{(1)}`,
    label: 'mínimo',
    what: 'O menor valor observado.',
    use: 'Marca o limite inferior dos dados e ajuda a perceber valores fora do esperado.',
    help: 'Menor valor do conjunto: ordene os dados e pegue o primeiro.',
  },
  max: {
    formula: String.raw`x_{\max} = x_{(n)}`,
    label: 'máximo',
    what: 'O maior valor observado.',
    use: 'Marca o limite superior dos dados; junto com o mínimo, dá a amplitude total.',
    help: 'Maior valor do conjunto: ordene os dados e pegue o último.',
  },
  mean: {
    formula: String.raw`\bar{x} = \frac{\sum_{i=1}^{n} x_i}{n}`,
    label: 'média (μ)',
    what: 'O valor “típico” obtido ao dividir a soma de todos os valores pela quantidade deles.',
    use: 'Resume o centro dos dados em um único número e é a base de quase todas as outras estatísticas. É sensível a valores extremos.',
    help: 'Soma de todos os valores dividida por n.\nx̄ = Σxᵢ / n',
  },
  median: {
    formula: String.raw`\tilde{x} = \begin{cases} x_{\left(\frac{n+1}{2}\right)} & n \text{ ímpar} \ \frac{x_{(n/2)} + x_{(n/2+1)}}{2} & n \text{ par} \end{cases}`,
    label: 'mediana',
    what: 'O valor que divide os dados ordenados ao meio: metade fica abaixo, metade acima.',
    use: 'Indica o centro dos dados sem ser afetada por valores extremos. Se média e mediana diferem muito, há assimetria ou atípicos.',
    help: 'Valor central dos dados ordenados. Com n par, é a média dos dois valores centrais (aqui: posição (n − 1)·0,5, interpolando).',
  },
  q1: {
    formula: String.raw`Q_1 = x_{(k)} + f\,\left(x_{(k+1)} - x_{(k)}\right),\quad k + f = 1 + 0.25\,(n-1)`,
    label: 'Q1',
    what: 'O 1º quartil: valor abaixo do qual estão 25% dos dados.',
    use: 'Descreve a parte baixa da distribuição e forma, com o Q3, a “caixa” do box-plot.',
    help: '1º quartil: valor abaixo do qual ficam 25% dos dados. Posição (n − 1)·0,25 nos dados ordenados, interpolando entre vizinhos (método tipo 7).',
  },
  q3: {
    formula: String.raw`Q_3 = x_{(k)} + f\,\left(x_{(k+1)} - x_{(k)}\right),\quad k + f = 1 + 0.75\,(n-1)`,
    label: 'Q3',
    what: 'O 3º quartil: valor abaixo do qual estão 75% dos dados.',
    use: 'Descreve a parte alta da distribuição e, com o Q1, mostra onde está a metade central dos dados.',
    help: '3º quartil: valor abaixo do qual ficam 75% dos dados. Posição (n − 1)·0,75 nos dados ordenados, interpolando entre vizinhos (método tipo 7).',
  },
  iqr: {
    formula: String.raw`\mathrm{IQR} = Q_3 - Q_1`,
    label: 'IQR',
    what: 'A amplitude interquartil: a largura da faixa que contém os 50% centrais dos dados.',
    use: 'Mede a dispersão de forma robusta (não sofre com extremos) e define o que é um valor atípico.',
    help: 'Amplitude interquartil: Q3 − Q1. Valores fora de Q1 − 1,5·IQR e Q3 + 1,5·IQR são atípicos.',
  },
  outliers: {
    formula: String.raw`x < Q_1 - 1.5\,\mathrm{IQR} \quad\text{ou}\quad x > Q_3 + 1.5\,\mathrm{IQR}`,
    label: 'atípicos',
    what: 'Valores muito distantes do restante dos dados (outliers).',
    use: 'Podem indicar erros de medição ou casos especiais que merecem investigação antes de tirar conclusões.',
    help: 'Quantidade de valores fora de [Q1 − 1,5·IQR ; Q3 + 1,5·IQR] (cercas de Tukey).',
  },
  sd: {
    formula: String.raw`s = \sqrt{\frac{\sum (x_i-\bar{x})^2}{n-1}}`,
    label: 'desvio padrão (σ)',
    what: 'O quanto, em média, os valores se afastam da média, na mesma unidade dos dados.',
    use: 'Mede a dispersão: quanto maior, mais espalhados os dados. É a base da curva normal e da regra 68-95-99,7.',
    help: 'Raiz quadrada da variância amostral.\ns = √( Σ(xᵢ − x̄)² / (n − 1) )',
  },
  variance: {
    formula: String.raw`s^2 = \frac{\sum (x_i-\bar{x})^2}{n-1}`,
    label: 'variância',
    what: 'A média dos quadrados dos desvios em relação à média (o desvio padrão ao quadrado).',
    use: 'Mede a dispersão em unidade ao quadrado; é usada em testes e modelos estatísticos.',
    help: 'Média dos quadrados dos desvios em relação à média, com n − 1 no divisor.\ns² = Σ(xᵢ − x̄)² / (n − 1)',
  },
  skew: {
    formula: String.raw`g_1 = \frac{1}{n}\sum \left(\frac{x_i-\bar{x}}{s}\right)^3`,
    label: 'assimetria',
    what: 'O quanto a distribuição é “torta” para um dos lados.',
    use: 'Perto de 0, os dados são simétricos; positiva indica cauda longa à direita; negativa, à esquerda. Dados normais têm assimetria próxima de 0.',
    help: 'Média dos desvios padronizados ao cubo.\nΣ((xᵢ − x̄)/s)³ / n\n0 = simétrico; > 0 cauda à direita; < 0 cauda à esquerda.',
  },
  kurt: {
    formula: String.raw`g_2 = \frac{1}{n}\sum \left(\frac{x_i-\bar{x}}{s}\right)^4 - 3`,
    label: 'curtose',
    what: 'O peso das caudas da distribuição em comparação com a normal (curtose em excesso).',
    use: 'Perto de 0 se parece com a normal; positiva indica caudas pesadas (mais extremos); negativa, caudas leves.',
    help: 'Curtose em excesso: média dos desvios padronizados à quarta potência, menos 3.\nΣ((xᵢ − x̄)/s)⁴ / n − 3\n0 ≈ normal; > 0 caudas pesadas; < 0 caudas leves.',
  },
  binWidth: {
    formula: String.raw`h = \frac{x_{\max} - x_{\min}}{k}`,
    label: 'largura da classe',
    what: 'A amplitude de cada barra (classe) do histograma.',
    use: 'Define o nível de detalhe do histograma: classes estreitas mostram mais detalhes, largas suavizam.',
    help: 'Amplitude de cada classe: (máximo − mínimo) / nº de classes.',
  },
  bins: {
    formula: String.raw`k = \lceil \log_2 n + 1 \rceil`,
    label: 'nº de classes',
    what: 'A quantidade de barras (classes) em que os dados são agrupados.',
    use: 'Controla a forma do histograma. Por padrão usa-se a regra de Sturges, mas você pode informar outro número.',
    help: 'Regra de Sturges: ⌈log₂(n) + 1⌉, a menos que você informe o número de classes.',
  },
  r: {
    formula: String.raw`r = \frac{\sum (x_i-\bar{x})(z_i-\bar{z})}{\sqrt{\sum (x_i-\bar{x})^2\,\sum (z_i-\bar{z})^2}},\quad z_i = \Phi^{-1}\!\left(\frac{i-0.375}{n+0.25}\right)`,
    label: 'correlação (r)',
    what: 'A correlação entre os dados ordenados e os valores esperados de uma distribuição normal.',
    use: 'Resume o gráfico probabilístico em um número: quanto mais perto de 1, mais os pontos seguem a reta e mais normais são os dados.',
    help: 'Correlação de Pearson entre os valores ordenados e os escores z esperados da normal (posições de Blom). Quanto mais perto de 1, mais os dados parecem normais.',
  },
  ad: {
    formula: String.raw`A^2 = -n - \frac{1}{n}\sum_{i=1}^{n}(2i-1)\left[\ln F(x_{(i)}) + \ln\left(1-F(x_{(n+1-i)})\right)\right]`,
    label: 'A² (Anderson-Darling)',
    what: 'A estatística do teste de Anderson-Darling, que mede a distância entre os dados e a normal ajustada.',
    use: 'Valores altos indicam afastamento da normalidade, principalmente nas caudas. Serve de base para o p-valor.',
    help: 'Mede a distância entre os dados e a normal ajustada.\nA² = −n − (1/n)·Σ(2i − 1)[ln F(xᵢ) + ln(1 − F(xₙ₊₁₋ᵢ))]\nF = distribuição normal com a média e o σ dos dados.',
  },
  p: {
    formula: String.raw`A^{*2} = A^2\left(1+\frac{0.75}{n}+\frac{2.25}{n^2}\right),\quad p \approx e^{1.2937 - 5.709A^{*} + 0.0186A^{*2}}\ (A^{*}\ge 0.6)`,
    label: 'p-valor',
    what: 'A probabilidade de observar dados tão afastados da normal quanto estes, se eles realmente fossem normais.',
    use: 'Abaixo de 0,05 há evidência contra a normalidade; acima disso, não há evidência para rejeitá-la.',
    help: 'Probabilidade de obter um A² tão extremo se os dados fossem normais (aproximação de D’Agostino & Stephens). Abaixo de 0,05, há evidência contra a normalidade.',
  },
  outside: {
    formula: String.raw`x_i \text{ fora de } \bar{x} + s\,z_i \pm 1.96\,s\,\frac{\sqrt{1+z_i^2/2}}{\sqrt{n}}`,
    label: 'fora dos limites 95%',
    what: 'Quantos pontos caem fora das linhas tracejadas do gráfico probabilístico.',
    use: 'Poucos pontos fora (esperado: cerca de 5%) sugerem dados compatíveis com a normal; muitos indicam desvio.',
    help: 'Pontos fora das linhas tracejadas.\nlimite = xₚ ± 1,96·s·√(1 + z²/2) / √n\nonde xₚ é a reta ajustada (média + s·z).',
  },
  spec: {
    formula: String.raw`LIE \le x \le LSE`,
    label: 'limites de especificação (LIE/LSE)',
    what: 'O menor (LIE) e o maior (LSE) valor aceitáveis para o produto ou processo, definidos pelo cliente ou pela engenharia, não pelos dados.',
    use: 'Servem de régua para dizer se o processo é capaz: o que cai fora deles é refugo ou retrabalho. Ajuste-os para simular o efeito de limites mais apertados ou mais folgados.',
    help: 'Valores dentro de [LIE; LSE] estão conformes. Pode-se informar só um dos limites.',
  },
  sigmaWithin: {
    formula: String.raw`\hat{\sigma}_w = \frac{\overline{MR}}{1.128},\quad MR_i = |x_i - x_{i-1}|`,
    label: 'σ dentro (amplitude móvel)',
    what: 'A variação de curto prazo do processo, estimada pela diferença entre valores consecutivos.',
    use: 'É o σ usado em Cp e Cpk. Como depende da ordem, informe os dados na sequência em que foram medidos.',
    help: 'Média das amplitudes móveis (diferença absoluta entre valores consecutivos) dividida por 1,128.',
  },
  cp: {
    formula: String.raw`C_p = \frac{LSE - LIE}{6\,\hat{\sigma}_w}`,
    label: 'Cp',
    what: 'A capacidade potencial: quantas vezes a faixa de especificação cabe na variação de curto prazo do processo (6σ).',
    use: 'Mostra se o processo seria capaz se estivesse centrado. Cp ≥ 1,33 é o mínimo usual. Exige os dois limites.',
    help: 'Largura da especificação dividida por 6σ de curto prazo.',
  },
  cpk: {
    formula: String.raw`C_{pk} = \min\left(\frac{LSE - \bar{x}}{3\,\hat{\sigma}_w},\ \frac{\bar{x} - LIE}{3\,\hat{\sigma}_w}\right)`,
    label: 'Cpk',
    what: 'A capacidade real de curto prazo: como o Cp, mas penaliza o processo descentrado, olhando o limite mais próximo da média.',
    use: 'Cpk ≥ 1,33 indica processo capaz; entre 1 e 1,33, marginal; abaixo de 1, incapaz. Funciona com apenas um limite.',
    help: 'Menor distância da média a um limite, medida em 3σ de curto prazo.',
  },
  pp: {
    formula: String.raw`P_p = \frac{LSE - LIE}{6\,s}`,
    label: 'Pp',
    what: 'O desempenho potencial: igual ao Cp, mas usando o desvio padrão geral (toda a variação dos dados).',
    use: 'Compara a especificação com a variação total observada, inclusive deslocamentos entre períodos. Exige os dois limites.',
    help: 'Largura da especificação dividida por 6 desvios padrão gerais.',
  },
  ppk: {
    formula: String.raw`P_{pk} = \min\left(\frac{LSE - \bar{x}}{3\,s},\ \frac{\bar{x} - LIE}{3\,s}\right)`,
    label: 'Ppk',
    what: 'O desempenho real de longo prazo: como o Cpk, mas com o desvio padrão geral.',
    use: 'Se Ppk for bem menor que Cpk, o processo muda ao longo do tempo (deriva ou instabilidade).',
    help: 'Menor distância da média a um limite, medida em 3 desvios padrão gerais.',
  },
  outObs: {
    formula: String.raw`\frac{\#\{x_i < LIE \ \text{ou}\ x_i > LSE\}}{n}`,
    label: 'fora da espec. (observado)',
    what: 'A fração dos seus valores que ficou fora dos limites de especificação.',
    use: 'É o resultado real da amostra, sem suposições sobre a distribuição.',
    help: 'Quantidade de valores abaixo do LIE ou acima do LSE dividida por n.',
  },
  outExp: {
    formula: String.raw`\Phi\!\left(\frac{LIE - \bar{x}}{s}\right) + 1 - \Phi\!\left(\frac{LSE - \bar{x}}{s}\right)`,
    label: 'fora da espec. (esperado)',
    what: 'A fração esperada fora da especificação se os dados seguirem a normal ajustada.',
    use: 'Estima o refugo de longo prazo mesmo quando a amostra não mostra nenhum caso fora. Vale se os dados forem aproximadamente normais.',
    help: 'Soma das caudas da normal ajustada abaixo do LIE e acima do LSE (áreas vermelhas do gráfico).',
  },
  ppm: {
    formula: String.raw`\mathrm{PPM} = 10^6 \times P(\text{fora da especificação})`,
    label: 'PPM esperado',
    what: 'Partes por milhão fora da especificação: quantas peças em um milhão seriam rejeitadas.',
    use: 'Traduz a fração fora da especificação para uma escala fácil de comparar com metas de qualidade.',
    help: 'Fração esperada fora da especificação multiplicada por 1.000.000.',
  },
}

/** Documentation sections, in reading order (every catalog key appears once). */
export const GROUPS: { title: string; icon: string; keys: string[] }[] = [
  { title: 'Contagem e extremos', icon: '🔢', keys: ['n', 'min', 'max'] },
  { title: 'Tendência central', icon: '🎯', keys: ['mean', 'median'] },
  { title: 'Posição e dispersão', icon: '📏', keys: ['q1', 'q3', 'iqr', 'outliers', 'sd', 'variance'] },
  { title: 'Forma da distribuição', icon: '🏔️', keys: ['skew', 'kurt'] },
  { title: 'Histograma', icon: '📊', keys: ['binWidth', 'bins'] },
  { title: 'Teste de normalidade', icon: '🧪', keys: ['r', 'ad', 'p', 'outside'] },
  { title: 'Capacidade do processo', icon: '🏭', keys: ['spec', 'sigmaWithin', 'cp', 'cpk', 'pp', 'ppk', 'outObs', 'outExp', 'ppm'] },
]

export function formatStat(key: string, v: number) {
  if (key === 'p') return v < 0.001 ? '< 0.001' : v.toFixed(3)
  if (key === 'outObs' || key === 'outExp') return `${(v * 100).toFixed(2)}%`
  if (key === 'ppm') return String(Math.round(v))
  return String(+v.toFixed(4))
}

/** [label, formatted value] pairs, the shape ExportableChart prints under the chart. */
export const statRows = (stats: Record<string, number>): Stat[] =>
  Object.entries(stats).map(([k, v]) => [STATS[k]?.label ?? k, formatStat(k, v)] as const)
