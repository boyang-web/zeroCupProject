import { createApp } from 'vue';
import App from './App.vue';
import { content } from './content';
import { validateContent } from './core/validate-content';
import './styles/tokens.css';
import './styles/main.css';
import './styles/wood-ui.css';
import './styles/immersive.css';
const issues = validateContent(content);
if (issues.length) {
  const message = document.createElement('pre'); message.textContent = `内容配置需要修复：\n${issues.join('\n')}`;
  document.getElementById('app')!.append(message);
  throw new Error(issues.join('\n'));
}
createApp(App).mount('#app');
