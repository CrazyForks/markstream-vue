<script setup lang="ts">
import MarkdownRender from 'markstream-vue'

const route = useRoute()
const isDark = ref(route.query.theme === 'dark')

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
</script>

<template>
  <main class="handoff-check" :class="{ dark: isDark }">
    <header>
      <h1>Pre → Highlight Line Number Handoff</h1>
      <button type="button" @click="isDark = !isDark">
        Toggle dark
      </button>
    </header>

    <div class="columns">
      <section class="col" data-handoff-case="enhanced">
        <h2>1) Highlight (default docs)</h2>
        <ClientOnly>
          <MarkdownRender
            :content="markdown"
            mode="docs"
            :final="true"
            :is-dark="isDark"
            code-block-dark-theme="vitesse-dark"
            code-block-light-theme="vitesse-light"
          />
          <template #fallback>
            <MarkdownRender
              :content="markdown"
              mode="docs"
              :final="true"
              :is-dark="isDark"
              render-code-blocks-as-pre
              :code-block-props="{ showLineNumbers: true }"
              code-block-dark-theme="vitesse-dark"
              code-block-light-theme="vitesse-light"
            />
          </template>
        </ClientOnly>
      </section>

      <section class="col" data-handoff-case="pre">
        <h2>2) Pre fallback (render-code-blocks-as-pre)</h2>
        <MarkdownRender
          :content="markdown"
          mode="docs"
          :final="true"
          :is-dark="isDark"
          render-code-blocks-as-pre
          :code-block-props="{ showLineNumbers: true }"
          code-block-dark-theme="vitesse-dark"
          code-block-light-theme="vitesse-light"
        />
      </section>
    </div>
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

header {
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
  max-width: 1760px;
  margin: 0 auto 20px;
}

button {
  padding: 8px 12px;
  color: inherit;
  background: transparent;
  border: 1px solid currentcolor;
  border-radius: 6px;
  cursor: pointer;
}

.columns {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;
  max-width: 1760px;
  margin: 0 auto;
}

.col {
  min-width: 0;
}

h2 {
  margin: 0 0 16px;
}

@media (max-width: 900px) {
  .columns {
    grid-template-columns: 1fr;
  }
}
</style>
