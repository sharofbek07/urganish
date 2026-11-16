<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import TreeNode from '../components/TreeNode.vue'
import { getProjectStructure, type ProjectNode } from '../services/structure'
import { getLearningContent, type LearningContent } from '../services/learning'

const project = ref<ProjectNode | null>(null)
const lessons = ref<LearningContent | null>(null)
const selected = ref<ProjectNode | null>(null)
const loading = ref(true)
const error = ref('')
const search = ref('')
const showJson = ref(false)
const expandKey = ref(0)
const collapseKey = ref(0)

function findNode(node: ProjectNode, id: string): ProjectNode | null {
  if (node.id === id) return node
  for (const child of node.children ?? []) {
    const found = findNode(child, id)
    if (found) return found
  }
  return null
}

function matches(node: ProjectNode, term: string): boolean {
  const own = `${node.name} ${node.path} ${node.description}`.toLocaleLowerCase()
  return own.includes(term) || (node.children ?? []).some(child => matches(child, term))
}

function filterTree(node: ProjectNode, term: string): ProjectNode | null {
  if (!term) return node
  if (!matches(node, term)) return null
  const children = (node.children ?? []).map(child => filterTree(child, term)).filter((child): child is ProjectNode => child !== null)
  return { ...node, children }
}

const visibleTree = computed(() => project.value ? filterTree(project.value, search.value.trim().toLocaleLowerCase()) : null)
const jsonText = computed(() => project.value ? JSON.stringify(project.value, null, 2) : '')

function selectNode(id: string) {
  if (project.value) selected.value = findNode(project.value, id)
}

async function loadStructure() {
  loading.value = true
  error.value = ''
  try {
    const [structure, content] = await Promise.all([getProjectStructure(), getLearningContent()])
    project.value = structure
    lessons.value = content
    selected.value = project.value
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Tuzilma ma’lumotlarini yuklab bo‘lmadi.'
  } finally {
    loading.value = false
  }
}

onMounted(loadStructure)
</script>

<template>
  <main class="app-shell">
    <header class="topbar">
      <a class="brand" href="#top" aria-label="Bosh sahifa"><span class="brand-mark">{ }</span><span>Stack<span class="brand-light">Map</span></span></a>
      <span class="topbar-label">FULL-STACK O‘QUV LOYIHASI</span>
      <span class="version-pill"><i></i> Vue 3 + Python</span>
    </header>

    <nav class="course-nav" aria-label="O‘quv bo‘limlari">
      <a href="#tree">01 · Daraxt</a><a href="#frontend-guide">02 · Vue frontend</a><a href="#backend-guide">03 · FastAPI backend</a><a href="#request-flow-guide">04 · So‘rov oqimi</a><a href="#technology-guide">05 · Texnologiyalar</a>
    </nav>

    <section id="top" class="intro">
      <div class="intro-copy">
        <span class="eyebrow">VUE 3 + PYTHON FASTAPI</span>
        <h1>Full-Stack loyiha <span>arxitekturasi</span></h1>
        <p>To‘liq loyiha daraxtini ko‘ring, har bir papka vazifasini o‘rganing va frontenddan backendgacha so‘rov qanday yurishini kuzating.</p>
      </div>
      <div class="request-flow" aria-label="Ma’lumotlar oqimi">
        <div><small>INTERFEYS</small><b>Vue 3</b><span>sayt ko‘rinishi</span></div><strong>→</strong>
        <div><small>API</small><b>FastAPI</b><span>so‘rovni boshqaradi</span></div><strong>→</strong>
        <div><small>MOCK DATA</small><b>JSON</b><span>namunaviy ma’lumot</span></div>
      </div>
    </section>

    <div class="guide-heading tree-guide-heading"><span class="section-number">01</span><div><span class="eyebrow">PROJECT EXPLORER</span><h2>To‘liq loyiha daraxti</h2><p>Papka yoki faylni tanlang — vazifasi va misoli ochiladi.</p></div></div>
    <section id="tree" class="workspace" aria-label="Loyiha fayllari daraxti">
      <aside class="tree-panel">
        <div class="panel-title"><div><span class="eyebrow">EXPLORER</span><h2>Loyiha fayllari</h2></div><span class="tree-count">{{ project?.count ?? '…' }} ta</span></div>
        <label class="search-box"><span aria-hidden="true">⌕</span><input v-model="search" placeholder="Fayl yoki vazifani qidiring..." aria-label="Fayl yoki vazifani qidirish" /></label>
        <div class="tree-actions"><button type="button" @click="expandKey++">Hammasini och</button><button type="button" @click="collapseKey++">Yig‘ish</button></div>
        <div class="tree-scroll">
          <p v-if="loading" class="tree-message">Tuzilma yuklanmoqda…</p>
          <div v-else-if="error" class="tree-message tree-error" role="alert">{{ error }}<button type="button" @click="loadStructure">Qayta yuklash</button></div>
          <TreeNode v-else-if="visibleTree" :node="visibleTree" :selected-id="selected?.id ?? ''" :expand-key="expandKey" :collapse-key="collapseKey" :auto-open="Boolean(search.trim())" @select="selectNode" />
          <p v-else class="tree-message">Qidiruvga mos fayl topilmadi.</p>
        </div>
        <div class="tree-legend"><span><i class="folder-dot"></i> Papka</span><span><i class="file-dot"></i> Fayl</span><span><i class="mock-dot"></i> Mock ma’lumot</span></div>
      </aside>

      <section class="detail-panel" aria-live="polite">
        <div class="detail-toolbar"><span class="crumb">{{ selected?.path ?? 'Tuzilmani tanlang' }}</span><button class="json-toggle" type="button" :aria-pressed="showJson" @click="showJson = !showJson"><span>{ }</span> {{ showJson ? 'Izohni ko‘rish' : 'JSON ko‘rinishi' }}</button></div>
        <div v-if="loading" class="detail-empty">Mock JSON ma’lumotlari yuklanmoqda…</div>
        <div v-else-if="error" class="detail-empty">Backendni ishga tushirib, qayta yuklang.</div>
        <pre v-else-if="showJson" class="json-view"><code>{{ jsonText }}</code></pre>
        <article v-else-if="selected" class="detail-content">
          <div class="detail-icon" :class="selected.kind">{{ selected.kind === 'folder' ? '▰' : selected.kind === 'data' ? '{ }' : '▤' }}</div>
          <span class="eyebrow">{{ selected.kind === 'folder' ? 'PAPKA' : selected.kind === 'data' ? 'MOCK JSON' : 'FAYL' }}<template v-if="selected.stage"> · {{ selected.stage }}</template></span>
          <h2>{{ selected.name }}</h2>
          <code class="path-chip">{{ selected.path }}</code>
          <p class="description">{{ selected.description }}</p>
          <div v-if="selected.example" class="example-block"><div class="example-heading"><span>QISQA MISOL</span><span>{{ selected.exampleLabel || 'kod namunasi' }}</span></div><pre><code>{{ selected.example }}</code></pre></div>
          <div v-if="selected.children?.length" class="contains-block"><h3>Ichida nimalar bor?</h3><div class="contains-list"><button v-for="child in selected.children" :key="child.id" type="button" @click="selectNode(child.id)"><span>{{ child.kind === 'folder' ? '▰' : child.kind === 'data' ? '{ }' : '▤' }}</span>{{ child.name }}<b>→</b></button></div></div>
        </article>
      </section>
    </section>

    <div v-if="error && !project" class="guide-load-error" role="alert">O‘quv bo‘limlarini ko‘rsatish uchun backendni ishga tushiring: {{ error }}</div>
    <template v-if="lessons">
      <section id="frontend-guide" class="guide-section">
        <div class="guide-heading"><span class="section-number">02</span><div><span class="eyebrow">FRONTEND · VUE 3</span><h2>Frontend papkalari va fayllari</h2><p>Brauzerda ko‘rinadigan qism: komponentlar UI chizadi, service backend bilan gaplashadi.</p></div></div>
        <div class="guide-table"><div v-for="item in lessons.frontend" :key="item.name" class="guide-row"><code>{{ item.name }}</code><p>{{ item.description }}</p></div></div>
      </section>

      <section id="backend-guide" class="guide-section">
        <div class="guide-heading"><span class="section-number">03</span><div><span class="eyebrow">BACKEND · PYTHON</span><h2>FastAPI papkalari va fayllari</h2><p>Server so‘rovni qabul qiladi, ma’lumotni tekshiradi, kerakli amalni bajarib JSON qaytaradi.</p></div></div>
        <div class="guide-table"><div v-for="item in lessons.backend" :key="item.name" class="guide-row"><code>{{ item.name }}</code><p>{{ item.description }}</p></div></div>
      </section>

      <section id="request-flow-guide" class="guide-section">
        <div class="guide-heading"><span class="section-number">04</span><div><span class="eyebrow">REQUEST → RESPONSE</span><h2>Vue va Python o‘rtasidagi so‘rov oqimi</h2><p>Login misolida ma’lumot brauzerdan database qatlamigacha qanday yurishini ko‘ring.</p></div></div>
        <ol class="flow-list"><li v-for="item in lessons.request_flow" :key="item.step" class="flow-row"><span class="flow-step">{{ String(item.step).padStart(2, '0') }}</span><div><code>{{ item.where }}</code><p>{{ item.what }}</p></div><span v-if="item.step < lessons.request_flow.length" class="flow-arrow">↓</span></li></ol>
      </section>

      <section id="technology-guide" class="guide-section">
        <div class="guide-heading"><span class="section-number">05</span><div><span class="eyebrow">STACK OVERVIEW</span><h2>Asosiy texnologiyalar</h2><p>Har bir texnologiya full-stack loyihaning ma’lum bir vazifasini bajaradi.</p></div></div>
        <div class="technology-table"><div class="technology-row technology-head"><span>YO‘NALISH</span><span>TEXNOLOGIYA</span><span>VAZIFASI</span></div><div v-for="item in lessons.technologies" :key="item.area" class="technology-row"><span>{{ item.area }}</span><strong>{{ item.technology }}</strong><p>{{ item.purpose }}</p></div></div>
        <p class="learning-note">Eslatma: bu kengaytirilgan namunaviy arxitektura. Kichik loyihada hamma papkalarni birdan yaratish shart emas; ehtiyojga qarab qo‘shiladi.</p>
      </section>
    </template>

    <footer class="page-footer"><span class="footer-mark">●</span> O‘rganib boriladigan namuna <span>·</span> Backenddagi mock JSON’dan o‘qildi</footer>
  </main>
</template>
