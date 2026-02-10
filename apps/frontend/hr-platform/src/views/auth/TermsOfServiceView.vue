<template>
  <div class="policy-page">
    <header class="policy-header">
      <div class="header-content">
        <div class="logo-box" @click="goHome">
          <BrandLogo size="32" class="logo-mark" />
          <span class="logo-text">HRADAR</span>
        </div>
        <button class="back-link" @click="goBack" title="로그인 화면으로 돌아가기">
          <span class="icon">&larr;</span> 로그인 화면으로 돌아가기
        </button>
      </div>
    </header>

    <main class="policy-container">
      <aside class="policy-sidebar">
        <nav class="sticky-nav">
          <h3>이용약관 목차</h3>
          <ul>
            <li v-for="(section, idx) in sections" :key="idx">
              <a :href="'#term-' + idx" @click.prevent="scrollTo('term-' + idx)">
                {{ section.title }}
              </a>
            </li>
          </ul>
        </nav>
      </aside>

      <section class="policy-content">
        <div class="title-area">
          <h1>서비스 이용약관</h1>
          <p class="last-updated">최종 수정일: 2026년 2월 5일</p>
        </div>

        <div class="intro-text">
          <p>본 약관은 HRADAR(이하 '회사')이 운영하는 인터넷 사이트에서 제공하는 인사 관리 관련 제반 서비스(이하 '서비스')를 이용함에 있어 회사와 이용자의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.</p>
        </div>

        <div v-for="(section, idx) in sections" :key="idx" :id="'term-' + idx" class="content-section">
          <h2>{{ section.title }}</h2>
          <div class="text-body" v-html="section.content"></div>
        </div>

        <footer class="content-footer">
          <p>본 약관은 공정거래위원회 표준약관 및 국내 관계 법령을 준수합니다.</p>
        </footer>
      </section>
    </main>

    <footer class="page-footer">
      <p>&copy; 2025 HRADAR. All rights reserved.</p>
    </footer>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import BrandLogo from '@/components/common/BrandLogo.vue'

const router = useRouter()

const sections = [
  {
    title: '제1조 (목적)',
    content: `
      <p>본 약관은 회사가 제공하는 HR 솔루션 "HRADAR"의 이용 조건 및 절차에 관한 기본적인 사항을 규정하는 것을 목적으로 합니다.</p>
    `
  },
  {
    title: '제2조 (약관의 명시, 효력 및 개정)',
    content: `
      <p>① 회사는 본 약관의 내용을 이용자가 알 수 있도록 서비스 초기 화면에 게시합니다.</p>
      <p>② 회사는 온라인 디지털콘텐츠산업 발전법, 전자상거래 등에서의 소비자보호에 관한 법률, 약관의 규제에 관한 법률 등 관련 법을 위배하지 않는 범위에서 본 약관을 개정할 수 있습니다.</p>
    `
  },
  {
    title: '제3조 (서비스의 제공 및 변경)',
    content: `
      <p>① 회사는 인사 관리, 성과 지표 분석, 급여 정산 보조 등의 서비스를 제공합니다.</p>
      <p>② 회사는 기술적 사양의 변경 등의 경우에는 장차 체결되는 계약에 의해 제공할 서비스의 내용을 변경할 수 있습니다. 이 경우에는 변경된 서비스의 내용 및 제공일자를 명시하여 현재의 서비스 내용을 게시한 곳에 즉시 공지합니다.</p>
    `
  },
  {
    title: '제4조 (이용계약의 체결)',
    content: `
      <p>이용자는 회사가 정한 가입 양식에 따라 회원정보를 기입한 후 본 약관에 동의한다는 의사표시를 함으로써 회원가입을 신청합니다. 회사는 다음 각 호에 해당하지 않는 한 회원으로 등록합니다.</p>
      <ul>
        <li>가입신청자가 이전에 회원자격을 상실한 적이 있는 경우</li>
        <li>등록 내용에 허위, 기재누락, 오기가 있는 경우</li>
        <li>기타 회원으로 등록하는 것이 회사의 기술상 현저히 지장이 있다고 판단되는 경우</li>
      </ul>
    `
  },
  {
    title: '제5조 (이용자의 의무)',
    content: `
      <p>이용자는 다음 행위를 하여서는 안 됩니다.</p>
      <ul>
        <li>신청 또는 변경 시 허위 내용의 등록</li>
        <li>타인의 정보 도용</li>
        <li>회사가 게시한 정보의 변경</li>
        <li>회사가 정한 정보 이외의 정보(컴퓨터 프로그램 등) 등의 송신 또는 게시</li>
        <li>회사 및 기타 제3자의 저작권 등 지적재산권에 대한 침해</li>
      </ul>
    `
  },
  {
    title: '제6조 (재판권 및 준거법)',
    content: `
      <p>① 회사와 이용자 간에 발생한 분쟁에 관한 소송은 제소 당시의 이용자의 주소에 의하고, 주소가 없는 경우에는 거소를 관할하는 지방법원의 전속관할로 합니다.</p>
      <p>② 회사와 이용자 간에 제기된 소송에는 한국법을 적용합니다.</p>
    `
  }
]

const goBack = () => {
  router.push('/gateway')
}

const goHome = () => {
  router.push('/home')
}

const scrollTo = (id) => {
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' })
  }
}
</script>

<style scoped>
/* (Styles are identical to PrivacyPolicyView) */
.policy-page {
  min-height: 100vh;
  background-color: #fcfdfe;
  color: #1e293b;
  font-family: 'Inter', 'Pretendard', sans-serif;
  line-height: 1.6;
}

.policy-header {
  background: white;
  border-bottom: 1px solid #e2e8f0;
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 10px rgba(0,0,0,0.02);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo-box {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.logo-mark {
  margin-right: 8px;
}

.logo-text {
  font-size: 1.25rem;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.025em;
}

.back-link {
  background: #f1f5f9;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 99px;
  color: #475569;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.back-link:hover {
  background: #e2e8f0;
  color: #0f172a;
  transform: translateX(-4px);
}

.policy-container {
  max-width: 1200px;
  margin: 3rem auto;
  padding: 0 2rem;
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 4rem;
}

.policy-sidebar {
  position: relative;
}

.sticky-nav {
  position: sticky;
  top: 6rem;
}

.sticky-nav h3 {
  font-size: 0.85rem;
  text-transform: uppercase;
  color: #94a3b8;
  letter-spacing: 0.1em;
  margin-bottom: 1.5rem;
}

.sticky-nav ul {
  list-style: none;
  padding: 0;
}

.sticky-nav li {
  margin-bottom: 0.8rem;
}

.sticky-nav a {
  color: #64748b;
  text-decoration: none;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.2s;
  display: block;
  padding: 4px 0;
}

.sticky-nav a:hover {
  color: #2563eb;
  padding-left: 4px;
}

.policy-content {
  background: white;
  padding: 3rem;
  border-radius: 24px;
  border: 1px solid #f1f5f9;
  box-shadow: 0 4px 20px rgba(0,0,0,0.03);
}

.title-area {
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 2px solid #f8fafc;
}

.title-area h1 {
  font-size: 2.5rem;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 0.5rem;
}

.last-updated {
  color: #94a3b8;
  font-size: 0.9rem;
}

.intro-text {
  margin-bottom: 3rem;
  color: #475569;
  font-size: 1.05rem;
  background: #f8fafc;
  padding: 1.5rem;
  border-radius: 12px;
}

.content-section {
  margin-bottom: 3rem;
}

.content-section h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 1.25rem;
}

.text-body {
  color: #475569;
  font-size: 1.05rem;
}

.text-body :deep(p) {
  margin-bottom: 1.5rem;
}

.text-body :deep(ul) {
  margin-bottom: 1.5rem;
  padding-left: 1.25rem;
}

.text-body :deep(li) {
  margin-bottom: 0.5rem;
}

.text-body :deep(strong) {
  color: #1e293b;
}

.content-footer {
  margin-top: 4rem;
  padding-top: 2rem;
  border-top: 1px solid #f1f5f9;
  color: #64748b;
  font-size: 0.95rem;
}

.page-footer {
  text-align: center;
  padding: 2rem 0;
  color: #94a3b8;
  font-size: 0.85rem;
}

@media (max-width: 900px) {
  .policy-container {
    grid-template-columns: 1fr;
    margin: 1rem auto;
  }
  .policy-sidebar {
    display: none;
  }
  .policy-content {
    padding: 2rem;
  }
  .title-area h1 {
    font-size: 2rem;
  }
}
</style>
