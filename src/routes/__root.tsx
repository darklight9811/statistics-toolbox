import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

import TanStackQueryDevtools from '../integrations/tanstack-query/devtools'

import appCss from '../styles.css?url'

import type { QueryClient } from '@tanstack/react-query'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      { title: 'Caixa de ferramentas de estatística' },
      {
        name: 'description',
        content: 'Ferramentas de estatística no navegador: histograma, estatísticas descritivas e tabela de frequências.',
      },
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: 'Caixa de ferramentas de estatística' },
      { property: 'og:locale', content: 'pt_BR' },
      { property: 'og:title', content: 'Caixa de ferramentas de estatística' },
      {
        property: 'og:description',
        content: 'Cole seus dados e gere um histograma com estatísticas descritivas e tabela de frequências.',
      },
      { property: 'og:url', content: 'https://statistics-yamiassu.vercel.app' },
      { name: 'twitter:card', content: 'summary' },
    ],
    links: [
      { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
            TanStackQueryDevtools,
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
