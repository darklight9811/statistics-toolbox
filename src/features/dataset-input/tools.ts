/** The app's tools, in menu order: used by the drawer in ToolLayout and by the home page. */
export const TOOLS = [
  { to: '/histogram', icon: '📊', label: 'Histograma', desc: 'Distribuição de frequências e estatísticas descritivas.' },
  { to: '/normal-probability', icon: '📉', label: 'Gráfico probabilístico normal', desc: 'Verifique visualmente se os dados seguem uma distribuição normal.' },
  { to: '/box-plot', icon: '📦', label: 'Box-plot', desc: 'Compare a distribuição de várias entradas lado a lado.' },
  { to: '/probability-distribution', icon: '🔔', label: 'Distribuição de probabilidade', desc: 'Densidade observada, curva normal ajustada e regra 68-95-99,7.' },
] as const
