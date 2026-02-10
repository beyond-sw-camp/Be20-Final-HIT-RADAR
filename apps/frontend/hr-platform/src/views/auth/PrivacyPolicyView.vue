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
          <h3>개인정보처리방침 목차</h3>
          <ul>
            <li v-for="(section, idx) in sections" :key="idx">
              <a :href="'#section-' + idx" @click.prevent="scrollTo('section-' + idx)">
                {{ section.title }}
              </a>
            </li>
          </ul>
        </nav>
      </aside>

      <section class="policy-content">
        <div class="title-area">
          <h1>개인정보처리방침</h1>
          <p class="last-updated">시행일자: 2026년 2월 5일</p>
        </div>

        <div class="intro-text">
          <p>HRADAR(이하 '회사')은 「개인정보 보호법」 제30조에 따라 정보주체의 개인정보를 보호하고 이와 관련한 고충을 신속하고 원활하게 처리할 수 있도록 하기 위하여 다음과 같이 개인정보 처리방침을 수립·공개합니다.</p>
        </div>

        <div v-for="(section, idx) in sections" :key="idx" :id="'section-' + idx" class="content-section">
          <h2>{{ section.title }}</h2>
          <div class="text-body" v-html="section.content"></div>
        </div>

        <footer class="content-footer">
          <p>본 방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는 공지사항을 통하여 고지할 것입니다.</p>
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
    title: '제1조 (개인정보의 처리 목적)',
    content: `
      <p>회사는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며 이용 목적이 변경되는 경우에는 「개인정보 보호법」 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.</p>
      <ul>
        <li><strong>홈페이지 회원가입 및 관리:</strong> 회원 가입의사 확인, 회원제 서비스 제공에 따른 본인 식별·인증, 회원자격 유지·관리, 서비스 부정이용 방지, 각종 고지·통지, 고충처리 목적으로 개인정보를 처리합니다.</li>
        <li><strong>서비스 제공:</strong> HR 솔루션 제공, 인사 관리 서비스 제공, 성과 관리 기능 제공, 급여 산정 및 관리(권한 계정) 등 서비스 제공에 따른 본인인증 등을 목적으로 개인정보를 처리합니다.</li>
      </ul>
    `
  },
  {
    title: '제2조 (개인정보의 처리 및 보유 기간)',
    content: `
      <p>① 회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.</p>
      <p>② 각각의 개인정보 처리 및 보유 기간은 다음과 같습니다.</p>
      <ul>
        <li><strong>홈페이지 회원가입 및 관리:</strong> 홈페이지 탈퇴 시까지. 다만, 다음의 사유에 해당하는 경우에는 해당 사유 종료 시까지 보유합니다.
          <ul>
            <li>관계 법령 위반에 따른 수사·조사 등이 진행 중인 경우에는 해당 수사·조사 종료 시까지</li>
            <li>서비스 이용에 따른 채권·채무관계 잔존 시에는 해당 채권·채무관계 정산 시까지</li>
          </ul>
        </li>
      </ul>
    `
  },
  {
    title: '제3조 (처리하는 개인정보의 항목)',
    content: `
      <p>회사는 다음의 개인정보 항목을 처리하고 있습니다.</p>
      <ul>
        <li><strong>회원 가입 및 관리:</strong> 성명, 사번, 이메일주소, 비밀번호, 부서명, 직위</li>
        <li><strong>인터넷 서비스 이용과정에서 아래 개인정보 항목이 자동으로 생성되어 수집될 수 있습니다:</strong> IP주소, 쿠키, 서비스 이용기록, 방문기록 등</li>
      </ul>
    `
  },
  {
    title: '제4조 (개인정보의 파기절차 및 파기방법)',
    content: `
      <p>① 회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체없이 해당 개인정보를 파기합니다.</p>
      <p>② 정보주체로부터 동의받은 개인정보 보유기간이 경과하거나 처리목적이 달성되었음에도 불구하고 다른 법령에 따라 개인정보를 계속 보존하여야 하는 경우에는, 해당 개인정보를 별도의 데이터베이스(DB)로 옮기거나 보관장소를 달리하여 보전합니다.</p>
      <p>③ 개인정보 파기의 절차 및 방법은 다음과 같습니다.</p>
      <ul>
        <li><strong>파기절차:</strong> 파기 사유가 발생한 개인정보를 선정하고, 회사의 개인정보 보호책임자의 승인을 받아 개인정보를 파기합니다.</li>
        <li><strong>파기방법:</strong> 전자적 파일 형태의 정보는 기록을 재생할 수 없는 기술적 방법을 사용합니다. 종이에 출력된 개인정보는 분쇄기로 분쇄하거나 소각을 통하여 파기합니다.</li>
      </ul>
    `
  },
  {
    title: '제5조 (정보주체와 법정대리인의 권리·의무 및 그 행사방법)',
    content: `
      <p>① 정보주체는 회사에 대해 언제든지 개인정보 열람·정정·삭제·처리정지 요구 등의 권리를 행사할 수 있습니다.</p>
      <p>② 제1항에 따른 권리 행사는 회사에 대해 개인정보 보호법 시행령 제41조 제1항에 따라 서면, 전자우편, 모사전송(FAX) 등을 통하여 하실 수 있으며 회사는 이에 대해 지체 없이 조치하겠습니다.</p>
    `
  },
  {
    title: '제6조 (개인정보의 안전성 확보 조치)',
    content: `
      <p>회사는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다.</p>
      <ul>
        <li><strong>관리적 조치:</strong> 내부관리계획 수립·시행, 정기적 직원 교육 등</li>
        <li><strong>기술적 조치:</strong> 개인정보처리시스템 등의 접근권한 관리, 접근통제시스템 설치, 고유식별정보 등의 암호화, 보안프로그램 설치</li>
        <li><strong>물리적 조치:</strong> 전산실, 자료보관실 등의 접근통제</li>
      </ul>
    `
  },
  {
    title: '제7조 (개인정보 보호책임자)',
    content: `
      <p>① 회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.</p>
      <ul>
        <li><strong>개인정보 보호책임자:</strong> 성명 : 성현제 / 직책 : 보안책임자 / 연락처 : tjdguswp333@gmail.com</li>
      </ul>
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
