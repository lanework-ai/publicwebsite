/**
* This configuration file lets you run `$ sanity [command]` in this folder
* Go to https://www.sanity.io/docs/cli to learn more.
**/
import { defineCliConfig } from 'sanity/cli'
import { config } from 'dotenv'

config()

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET
const deploymentAppId = process.env.SANITY_DEPLOYMENT_APP_ID

export default defineCliConfig({
  api: { projectId, dataset },
  deployment: {
    appId: deploymentAppId!,
  },
  /* @ts-ignore */
  vite: (config: any) => {
    return {
      ...config,
      define: {
        ...config.define,
        'process.env.NEXT_PUBLIC_SANITY_PROJECT_ID': JSON.stringify(process.env.NEXT_PUBLIC_SANITY_PROJECT_ID),
        'process.env.NEXT_PUBLIC_SANITY_DATASET': JSON.stringify(process.env.NEXT_PUBLIC_SANITY_DATASET),
        'process.env.NEXT_PUBLIC_SANITY_API_VERSION': JSON.stringify(process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-12-30'),
        'process.env.NEXT_PUBLIC_SITE_URL': JSON.stringify(process.env.NEXT_PUBLIC_SITE_URL),
        'process.env.SANITY_STUDIO_NEWSLETTER_API_KEY': JSON.stringify(process.env.SANITY_STUDIO_NEWSLETTER_API_KEY),
      },
    }
  },
})
