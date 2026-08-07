import { ChangeDetectionStrategy, Component, signal } from '@angular/core'
import { MarkstreamAngularComponent } from 'markstream-angular'

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

@Component({
  selector: 'app-line-number-handoff-check',
  standalone: true,
  imports: [MarkstreamAngularComponent],
  template: `
    <div class="handoff-check" [class.dark]="isDark()">
      <header>
        <h1>Pre → Highlight Line Number Handoff</h1>
        <button type="button" (click)="isDark.set(!isDark())">
          Toggle dark
        </button>
      </header>

      <h2>1) Highlight (default)</h2>
      <section class="col" data-handoff-case="enhanced">
        <markstream-angular
          [content]="markdown"
          [final]="true"
          [isDark]="isDark()"
          [codeBlockDarkTheme]="'vitesse-dark'"
          [codeBlockLightTheme]="'vitesse-light'"
        />
      </section>

      <h2>2) Pre fallback (render-code-blocks-as-pre)</h2>
      <section class="col" data-handoff-case="pre">
        <markstream-angular
          [content]="markdown"
          [final]="true"
          [isDark]="isDark()"
          [renderCodeBlocksAsPre]="true"
          [codeBlockProps]="codeBlockProps"
          [codeBlockDarkTheme]="'vitesse-dark'"
          [codeBlockLightTheme]="'vitesse-light'"
        />
      </section>
    </div>
  `,
  styles: [`
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
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LineNumberHandoffCheckComponent {
  readonly markdown = markdown
  readonly isDark = signal(getInitialDarkMode())
  readonly codeBlockProps = { showLineNumbers: true }
}
