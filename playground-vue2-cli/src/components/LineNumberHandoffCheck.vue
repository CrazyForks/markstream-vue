<script>
import MarkdownRender, { PreCodeNode } from 'markstream-vue2'

function getInitialDarkMode() {
  if (typeof window === 'undefined')
    return false
  return new URLSearchParams(window.location.search).get('theme') === 'dark'
}

const markdown = [
  '# Pre → Highlight Line Number Handoff',
  '',
  '```ts',
  'export function chunk(input: string) {',
  '  const lines = input.split(/\\r?\\n/)',
  '  return lines.map((line, index) => ({ index, value: line.trim(), block: 1 }))',
  '}',
  '',
  'for (const item of chunk(\'alpha\\nbeta\\ngamma\')) {',
  '  console.log(item.index, item.value)',
  '}',
  '',
  'function done() {',
  '  return true',
  '}',
  'done()',
  '```',
].join('\n')

export default {
  name: 'Vue2CliLineNumberHandoffCheck',
  components: { MarkdownRender, PreCodeNode },
  data() {
    return {
      darkOverride: null,
      markdown,
    }
  },
  computed: {
    isDark() {
      return this.darkOverride == null ? getInitialDarkMode() : this.darkOverride
    },
  },
  methods: {
    toggleDark() {
      this.darkOverride = !this.isDark
    },
  },
}
</script>

<template>
  <main class="handoff-check" :class="{ dark: isDark }">
    <header>
      <h1>Pre → Highlight Line Number Handoff</h1>
      <button type="button" @click="toggleDark">
        Toggle dark
      </button>
    </header>

    <h2>1) Highlight (default)</h2>
    <section class="col" data-handoff-case="enhanced">
      <MarkdownRender
        :content="markdown"
        :final="true"
        :is-dark="isDark"
        code-block-dark-theme="vitesse-dark"
        code-block-light-theme="vitesse-light"
        :viewport-priority="false"
      />
    </section>

    <h2>2) Pre fallback</h2>
    <section class="col" data-handoff-case="pre">
      <PreCodeNode
        class="code-fallback-plain"
        :node="{
          type: 'code_block',
          code: markdown.split('```ts\n')[1].split('\n```')[0],
          language: 'ts',
          loading: false,
        }"
        :show-line-numbers="true"
      />
    </section>
  </main>
</template>

<style scoped>
.handoff-check {
  min-height: 100vh;
  padding: 24px;
  color: #172033;
  background: #f5f7fb;
  font-family: system-ui, sans-serif;
}

.handoff-check.dark {
  color: #e2e8f0;
  background: #0b1220;
}

.handoff-check header {
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
  max-width: 860px;
}

.col {
  max-width: 860px;
  margin-bottom: 32px;
}

h2 {
  margin-top: 20px;
}
</style>
