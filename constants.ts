import 'dotenv/config'

const missingEnvError = (key: string) => {
  throw new Error(`Missing environment variable: ${key}`)
}

const requiredEnvVars = ['DB_URL', 'NEXT_PUBLIC_BASE_URL']

requiredEnvVars.forEach((key) => {
  if (!process.env[key]) missingEnvError(key)
})

export const { DB_URL, NEXT_PUBLIC_BASE_URL: BASE_URL } = process.env as Record<
  string,
  string
>
