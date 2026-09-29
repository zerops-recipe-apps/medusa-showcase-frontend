# Medusa Showcase Storefront Recipe App

<!-- #ZEROPS_EXTRACT_START:intro# -->
Next.js storefront for [medusa-showcase](https://github.com/zerops-recipe-apps/medusa-showcase) — multi-channel demo shop with Meilisearch-backed product search. Deploy as `nextstore` from the [Medusa Showcase recipe](https://app.zerops.io/recipes/medusa-showcase) on [Zerops](https://zerops.io).
<!-- #ZEROPS_EXTRACT_END:intro# -->

Used within [Medusa Showcase recipe](https://app.zerops.io/recipes/medusa-showcase) for the Zerops platform.

⬇️ **Deploy the full stack**

[![Deploy on Zerops](https://github.com/zeropsio/recipe-shared-assets/blob/main/deploy-button/light/deploy-button.svg)](https://app.zerops.io/recipes/medusa-showcase?environment=small-production)

![cover](https://github.com/zeropsio/recipe-shared-assets/blob/main/covers/svg/cover-nextjs.svg)

## Repositories

| Repo | Role |
| --- | --- |
| [medusa-showcase](https://github.com/zerops-recipe-apps/medusa-showcase) | Medusa API + admin (B2C/B2B channels) |
| [medusa-showcase-frontend](https://github.com/zerops-recipe-apps/medusa-showcase-frontend) (this repo) | Next.js storefront |

## Local development

```bash
yarn install
cp .env.template .env.local
yarn dev   # http://localhost:8000 — point at local or remote Medusa API_URL
```

After the backend seed runs, copy the publishable key from Medusa admin or the backend deploy logs into `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`.

## Integration Guide

<!-- #ZEROPS_EXTRACT_START:integration-guide# -->

### 1. Adding `zerops.yml`

`NEXT_PUBLIC_SEARCH_ENDPOINT` maps to the recipe `search` service. Runtime `MEDUSA_BACKEND_URL` uses internal hostname `MEDUSA_HOST` on port 9000.

```yaml
zerops:
  - setup: prod
    build:
      base: nodejs@24
      envVariables:
        NEXT_PUBLIC_MEDUSA_BACKEND_URL: ${API_URL}
        NEXT_PUBLIC_SEARCH_ENDPOINT: ${SEARCH_URL}
      buildCommands:
        - yarn
        - yarn build
    run:
      ports:
        - port: 8000
          httpSupport: true

  - setup: dev
    build:
      deployFiles: ./
```

Full file: [zerops.yml](zerops.yml). Optional OAuth env vars are configured on the **backend** import vault, not duplicated here.

<!-- #ZEROPS_EXTRACT_END:integration-guide# -->
