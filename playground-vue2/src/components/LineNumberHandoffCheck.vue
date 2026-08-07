<script>
import MarkdownRender from 'markstream-vue2'

// 一个 13 行的代码块（覆盖 10–13 两位数行号）
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
  name: 'Vue2LineNumberHandoffCheck',
  components: {
    MarkdownRender,
  },
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
  <div class="handoff-check" :class="{ dark: isDark }">
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
      />
    </section>

    <h2>2) Pre fallback (render-code-blocks-as-pre)</h2>
    <section class="col" data-handoff-case="pre">
      <MarkdownRender
        :content="markdown"
        :final="true"
        :is-dark="isDark"
        render-code-blocks-as-pre
        :code-block-props="{ showLineNumbers: true }"
        code-block-dark-theme="vitesse-dark"
        code-block-light-theme="vitesse-light"
      />
    </section>
  </div>
</template>

<style scoped>
.handoff-check {
  padding: 24px;
  font-family: system-ui, sans-serif;
  background: #f5f7fb;
  min-height: 100vh;
}

.handoff-check.dark {
  background: #0b1220;
  color: #e2e8f0;
}

.col {
  max-width: 860px;
  margin-bottom: 32px;
}

h2 {
  margin-top: 20px;
}
</style>
