import { LineNumberHandoffCheck } from '../../src/line-number-handoff-check'

export default async function LineNumberHandoffCheckPage({
  searchParams,
}: {
  searchParams: Promise<{ theme?: string | string[] }>
}) {
  const params = await searchParams
  return <LineNumberHandoffCheck initialDark={params.theme === 'dark'} />
}
