export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { getPayload } = await import('payload')
    const config = await import('./payload.config')
    const payload = await getPayload({ config: config.default })
    await payload.db.migrate?.()
  }
}
