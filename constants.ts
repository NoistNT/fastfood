import { config } from 'dotenv'

config({ path: '.env.local' })

const envVariables = ['DB_URL']

const customError = (envVariable: string) => {
  throw new Error(`Environment variable ${envVariable} is not defined`)
}

for (const envVariable of envVariables) {
  if (!process.env[envVariable]) {
    customError(envVariable)
  }
}

export const { DB_URL } = process.env as Record<string, string>
