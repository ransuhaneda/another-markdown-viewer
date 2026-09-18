import './styles/tokens.css'
import './style.css'
import './styles/print.css'
import { mountMarkdownApp } from './app/markdown-app'

const app = document.querySelector<HTMLDivElement>('#app')
if (!app) throw new Error('Missing application root: #app')

mountMarkdownApp(app)