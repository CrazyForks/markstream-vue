import { LineNumberHandoffCheck } from '../../src/line-number-handoff-check'

export default function LineNumberHandoffCheckPage({
  searchParams,
}: {
  searchParams?: { theme?: string | string[] }
}) {
  return <LineNumberHandoffCheck initialDark={searchParams?.theme === 'dark'} />
}
