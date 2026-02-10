<template>
  <main class="page">
    <!-- Background Elements -->
    <div class="bg-layer gradient-bg" />
    <div class="bg-layer noise-bg" />

    <!-- Navigation -->
    <header class="nav" :class="{ scrolled: isScrolled }">
      <div class="container nav-inner">
        <div class="brand">
          <BrandLogo size="32" class="logo-mark" />
          <span class="logo-text">HRADAR</span>
        </div>
        <nav class="nav-links">
          <a href="#problems" @click.prevent="scrollTo('#problems')">Why</a>
          <a href="#goal" @click.prevent="scrollTo('#goal')">Goal</a>
          <a href="#features" @click.prevent="scrollTo('#features')">Features</a>
        </nav>
        <div class="nav-actions">
          <button class="btn-text" @click="goToGateway">로그인</button>
          <button class="btn-primary" @click="switchToApply">도입 신청</button>
        </div>
      </div>
    </header>

    <!-- Hero Section -->
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="container hero-content">
        <div class="hero-text" data-aos>
          <div class="kicker">HR 의사결정 인텔리전스</div>
          <h1 class="hero-title">
            성장하지 않는 <br />성과 평가는<br />
            <span class="text-highlight">의미가 없습니다.</span>
          </h1>
          <p class="hero-desc">
            인사 데이터를 통합·해석하여 ‘개인의 성장 전략’으로 전환합니다.<br />
            성과를 시각화하고, 평가를 넘어 성장으로 연결하는 <strong>HRadar</strong>
          </p>
          <!-- Button removed as per request (Only Top & Bottom) -->
          <p class="hero-note">⚠️ AI는 결정을 내리지 않습니다. 최종 판단은 HR이 합니다.</p>
        </div>
        <div class="hero-visual" data-aos>
          <!-- Dashboard Mockup -->
          <div class="app-mockup">
            <div class="mock-sidebar">
              <div class="side-item active"></div>
              <div class="side-item"></div>
              <div class="side-item"></div>
            </div>
            <div class="mock-main">
              <div class="mock-top-bar"></div>
              <div class="mock-content-grid">
                <div class="glass-card main-card">
                  <div class="card-header">
                    <div class="avatar-group">
                      <span class="avatar"></span>
                      <div class="user-info">
                        <div class="name-bar"></div>
                        <div class="role-bar"></div>
                      </div>
                    </div>
                    <div class="status-badge warning">Burnout Risk</div>
                  </div>
                  <div class="radar-chart-mock">
                    <svg viewBox="0 0 100 100" class="radar-svg">
                      <polygon points="50,10 90,40 70,90 30,90 10,40" class="radar-grid" />
                      <polygon points="50,25 75,43.75 62.5,75 37.5,75 25,43.75" class="radar-grid inner" />
                      <polygon points="50,40 60,47.5 55,60 45,60 40,47.5" class="radar-grid inner" />
                      <line x1="50" y1="50" x2="50" y2="10" class="radar-axis" />
                      <line x1="50" y1="50" x2="90" y2="40" class="radar-axis" />
                      <line x1="50" y1="50" x2="70" y2="90" class="radar-axis" />
                      <line x1="50" y1="50" x2="30" y2="90" class="radar-axis" />
                      <line x1="50" y1="50" x2="10" y2="40" class="radar-axis" />
                      <polygon points="50,20 80,45 65,80 35,80 20,45" class="radar-val" />
                      <circle cx="50" cy="20" r="1.5" class="radar-dot" />
                      <circle cx="80" cy="45" r="1.5" class="radar-dot" />
                      <circle cx="65" cy="80" r="1.5" class="radar-dot" />
                      <circle cx="35" cy="80" r="1.5" class="radar-dot" />
                      <circle cx="20" cy="45" r="1.5" class="radar-dot" />
                    </svg>
                  </div>
                  <div class="insight-row">
                    <div class="icon-box">⚡</div>
                    <div class="text-box">
                      <div class="l1">최근 야근 급증 + 협업 지수 하락</div>
                      <div class="l2">면담이 필요한 시점입니다.</div>
                    </div>
                  </div>
                </div>
                <div class="small-cards">
                  <div class="glass-card stat-card">
                    <div class="stat-val">82%</div>
                    <div class="stat-lab">협업 만족도</div>
                  </div>
                  <div class="glass-card stat-card">
                    <div class="stat-val">B+</div>
                    <div class="stat-lab">성과 예측</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- Floating decorative cards -->
          <div class="glass-card float-card c1">
            <div class="stat-num">94%</div>
            <div class="stat-label">Data Accuracy</div>
          </div>
        </div>
      </div>
    </section>

    <!-- 1. Background & Problems -->
    <section id="problems" class="section problem-section">
      <div class="container">
        <div class="section-header center" data-aos>
          <span class="section-tag">BACKGROUND & PROBLEM</span>
          <h2>왜 지금의 인사 데이터는<br />의사결정을 돕지 못할까요?</h2>
        </div>

        <div class="problem-grid">
          <div class="p-card" data-aos>
            <div class="p-icon">🧩</div>
            <h3>성과 평가의 불투명성</h3>
            <p>
              "내가 왜 이 평가를 받았는지"를 <br/> 모르는 사원들이 많습니다.<br/>
              평가 기준이 블랙박스처럼 느껴져 <br/>결과에 대한 불신이 쌓입니다.
            </p>
          </div>
          <div class="p-card" data-aos>
            <div class="p-icon">📉</div>
            <h3>성장 기회의 부재</h3>
            <p>
              평가가 역량 개발로 이어지지 않고 <br/>'통보'로 끝납니다.<br/>
              성장 가능성을 느끼지 못한 핵심 인재들은 <br/>이직을 고민합니다.
            </p>
          </div>
          <div class="p-card" data-aos>
            <div class="p-icon">⚠️</div>
            <h3>HRM과 HRD의 단절</h3>
            <p>
              성과 관리(HRM)와 역량 개발(HRD)이 <br/>분리되어 있습니다.<br/>
              평가 결과가 개인에게 필요한 구체적인 <br/>학습 전략으로 연결되지 못합니다.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- 2. Goal -->
    <section id="goal" class="section goal-section">
      <div class="container">
        <div class="goal-box" data-aos>
          <div class="goal-content">
            <h2 class="goal-title">PROJECT GOAL</h2>
            <p class="goal-main">
              단순한 시스템 구축이 아닙니다.<br />
              HR 담당자가 <strong>"공정한 판단이었다"</strong>고 설명하고<br />
              사원이 <strong>"성장할 수 있다"</strong>고 믿는 조직을 만듭니다.
            </p>
            <div class="goal-sub">
              <div class="item">
                <span class="check">✔</span> <strong>성과 시각화</strong>: 납득 가능한 평가 근거 제공
              </div>
              <div class="item">
                <span class="check">✔</span> <strong>성장 연결</strong>: 평가 결과를 역량 개발 전략으로 전환
              </div>
              <div class="item">
                <span class="check">✔</span> <strong>신뢰 회복</strong>: 투명한 과정 공유로 불신 해소
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 3. Features -->
    <section id="features" class="section feature-section">
      <div class="container">
        <div class="section-header" data-aos>
          <span class="section-tag">CORE FUNCTIONS</span>
          <h2>데이터가 흐름이 되는<br />HRADAR 핵심 기능</h2>
        </div>

        <!-- Feature 1 -->
        <div class="feature-row" data-aos>
          <div class="f-text">
            <div class="f-num">01</div>
            <h3>개인 성과 대시보드</h3>
            <p class="f-desc">
              직원의 현재 상태와 변화 신호를 한눈에 파악하세요.
              평가 시즌, <br />면담 전, 인재 리뷰 시 가장 강력한 도구가 됩니다.
            </p>
            <ul class="f-list">
              <li><strong>다면적 지표</strong>: 근태, 규정 준수, 업무 기여도, 신뢰도 등 시각화</li>
              <li><strong>성과 해석</strong>: "내가 왜 이 평가를 받았는가"에 대한 명확한 답변</li>
              <li><strong>변화 감지</strong>: 이전 기간 대비 개선점 및 정체 구간 한눈에 파악</li>
            </ul>
          </div>
          <div class="f-visual">
            <div class="app-mockup mini">
              <div class="mock-main full-w">
                <div class="report-layout">
                   <div class="report-paper">
                      <div class="rp-header">
                        <div class="rp-title-bar"></div>
                      </div>
                      <div class="rp-grid">
                        <div class="rp-item"><div class="rp-chart-line"></div></div>
                        <div class="rp-item"><div class="rp-chart-bar"></div></div>
                        <div class="rp-item"><div class="rp-chart-pie"></div></div>
                        <div class="rp-item"><div class="rp-chart-dot"></div></div>
                      </div>
                   </div>
                   <div class="report-deco"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Feature 2 -->
        <div class="feature-row reverse" data-aos>
          <div class="f-text">
            <div class="f-num">02</div>
            <h3>역량강화 리포트 (사전/사후)</h3>
            <p class="f-desc">
              성과 평가를 '성장 전략'으로 바꿉니다.
              목표 달성에 필요한 역량을 <br />미리 가이드하고, 결과에 따른 보완점을 추천합니다.
            </p>
            <ul class="f-list">
              <li><strong>사전 리포트</strong>: 목표 달성을 위한 핵심 역량 및 학습 추천</li>
              <li><strong>사후 리포트</strong>: 미달성 원인 분석 및 역량 보완 가이드</li>
              <li>개인 맞춤형 교육 콘텐츠 및 성장 경로 제시</li>
            </ul>
          </div>
          <div class="f-visual">
            <div class="app-mockup mini">
              <div class="mock-main full-w center-v bg-soft">
                <div class="doc-visual">
                  <div class="doc-paper">
                    <div class="doc-header">
                      <div class="doc-title">Competency Report</div>
                      <div class="doc-date">2026.02</div>
                    </div>
                    <div class="doc-body">
                      <div class="doc-radar-area">
                         <div class="doc-radar-circle"></div>
                      </div>
                      <div class="doc-text-block">
                        <div class="doc-line l-100"></div>
                        <div class="doc-line l-80"></div>
                        <div class="doc-line l-40 highlight"></div>
                      </div>
                      <div class="doc-stamp">Pass</div>
                    </div>
                  </div>
                  <div class="doc-paper-back"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Feature 3 -->
        <div class="feature-row" data-aos>
          <div class="f-text">
            <div class="f-num">03</div>
            <h3>HR 의사결정 인텔리전스</h3>
            <p class="f-desc">
              HR 담당자가 우리 조직에 맞는 분석 기준을 유연하게 조정합니다.<br />
              단순 통보가 아닌, 데이터를 통해 조직과 개인의 성장을 지원합니다.
            </p>
            <ul class="f-list">
              <li>성과/근태 분석 임계값 직접 설정 및 시뮬레이션</li>
              <li>평가 결과에 기반한 개인별 성장 로드맵 제시</li>
              <li>조직 전체의 역량 현황 및 리스크 모니터링</li>
            </ul>
          </div>
          <div class="f-visual">
            <div class="screen-mockup center-flex">
              <div class="decision-flow">
                <div class="d-step">
                  <span class="d-label">1Q 진단</span>
                </div>
                <div class="d-line"></div>
                <div class="d-step active">
                  <span class="d-label">Action</span>
                </div>
                <div class="d-line"></div>
                <div class="d-step">
                  <span class="d-label">2Q 목표</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 4. Differentiation -->
    <section class="section diff-section">
      <div class="container">
        <div class="section-header center" data-aos>
          <span class="section-tag">DIFFERENTIATION</span>
          <h2>무엇이 다른가요?</h2>
        </div>
        <div class="diff-table-wrap" data-aos>
          <table class="diff-table">
            <thead>
            <tr>
              <th class="th-criterion">구분</th>
              <th class="th-common">기존 HR 시스템</th>
              <th class="th-hradar">HRADAR</th>
            </tr>
            </thead>
            <tbody>
            <tr>
              <td>성과 평가의 목적</td>
              <td>등급 산정 및 보상 결정</td>
              <td><strong>개인의 역량 성장 전략 수립</strong></td>
            </tr>
            <tr>
              <td>결과 피드백</td>
              <td>점수/등급 통보 (일방향)</td>
              <td><strong>시각화된 근거 + 성장 가이드</strong></td>
            </tr>
            <tr>
              <td>HRD 연계</td>
              <td>별도 교육 과정 운영</td>
              <td><strong>평가 결과 기반 맞춤 교육 추천</strong></td>
            </tr>
            <tr>
              <td>분석 기준</td>
              <td>고정된 알고리즘</td>
              <td><strong>HR 담당자가 유연하게 설정</strong></td>
            </tr>
            <tr>
              <td>최종 결과</td>
              <td>이직 고민 (불신/정체)</td>
              <td><strong>생산성 향상 및 몰입 (성장)</strong></td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- 5. Process (How it works) -->
    <section class="section process-section">
      <div class="container">
        <div class="section-header center" data-aos>
          <span class="section-tag">workflow</span>
          <h2>데이터가 인사이트가 되는 과정</h2>
        </div>
        <div class="process-steps">
            <div class="step-card" data-aos>
              <div class="step-num">01</div>
              <div class="step-icon">📊</div>
              <h3>성과 시각화</h3>
              <p>근태, 성과, 협업 데이터를 <br />통합하여 누구나 이해하기 쉬운 <br />형태로 시각화합니다.</p>
            </div>
            <div class="step-arrow">→</div>
            <div class="step-card" data-aos>
              <div class="step-num">02</div>
              <div class="step-icon">📈</div>
              <h3>성장 전략 도출</h3>
              <p>평가 결과를 기반으로 부족한 <br />역량을 분석하고, 개인 맞춤형 <br />성장 리포트를 생성합니다.</p>
            </div>
            <div class="step-arrow">→</div>
            <div class="step-card" data-aos>
              <div class="step-num">03</div>
              <div class="step-icon">🤝</div>
              <h3>신뢰와 몰입</h3>
              <p>납득 가능한 평가와 <br /> 구체적인 성장 경로를 통해 <br />조직 몰입도와 생산성을 높입니다.</p>
            </div>
        </div>
      </div>
    </section>

    <!-- 6. FAQ Section -->
    <section class="section faq-section">
      <div class="container">
        <div class="section-header center" data-aos>
          <span class="section-tag">FAQ</span>
          <h2>자주 묻는 질문</h2>
        </div>
        <div class="faq-grid">
          <div class="faq-item" data-aos>
            <h3>Q. 초기 스타트업도 사용할 수 있나요?</h3>
            <p>네, 물론입니다. 오히려 데이터가 적을 때부터 체계적인 관리를 시작하면 <br /> 조직 문화의 기틀을 잡는 데 큰 도움이 됩니다.</p>
          </div>
          <div class="faq-item" data-aos>
            <h3>Q. 기존 HR 데이터를 그대로 쓸 수 있나요?</h3>
            <p>엑셀 업로드 및 주요 HR SaaS 연동을 지원하여, 기존 데이터를 손쉽게 <br />이관하고 분석할 수 있습니다.</p>
          </div>
          <div class="faq-item" data-aos>
            <h3>Q. 보안은 안전한가요?</h3>
            <p>모든 데이터는 암호화되어 저장되며, 민감한 개인정보는 <br />철저하게 분리되어 관리됩니다.</p>
          </div>
          <div class="faq-item" data-aos>
            <h3>Q. 도입 비용은 어떻게 되나요?</h3>
            <p>현재 베타 기간 동안은 무료로 제공되며, 이후 기업 규모에 맞는 <br /> 합리적인 요금제를 제안드릴 예정입니다.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="cta-section">
      <div class="container cta-container">
        <h2 class="cta-title">HR의 판단을 더 확신있게.</h2>
        <p class="cta-sub">HRADAR와 함께 데이터 기반의 인재 관리를 시작하세요.</p>
        <div class="cta-buttons">
          <button class="btn-lg-primary" @click="goToGateway">로그인 하러 가기</button>
          <button class="btn-lg-white" @click="switchToApply">서비스 도입 신청</button>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="container">

        <p class="copyright">© 2025 HRADAR. All rsizeights reserved.</p>
        <p class="f-slogan">AI assists. HR decides.</p>
      </div>
    </footer>
    <!-- Auth Modal -->
  </main>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import BrandLogo from '@/components/common/BrandLogo.vue'

const router = useRouter()
const isScrolled = ref(false)

const switchToApply = () => {
  router.push('/register-company')
}

const goToGateway = () => {
  router.push('/gateway')
}





const scrollTo = (selector) => {
  const el = document.querySelector(selector)
  if (el) el.scrollIntoView({ behavior: 'smooth' })
}

// Scroll detection logic
const handleScroll = () => {
  isScrolled.value = window.scrollY > 50
}

// Simple IntersectionObserver for scroll animations
let observer = null
const setupObserver = () => {
  const options = { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('aos-animate')
      }
    })
  }, options)

  document.querySelectorAll('[data-aos]').forEach((el) => observer.observe(el))
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  setupObserver()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  if (observer) observer.disconnect()
})
</script>

<style scoped>
/* @import url(...) - handled in App.vue or main.css typically, but kept here if it was there */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Noto+Sans+KR:wght@400;500;700;900&display=swap');

/* --- Reset & Base --- */
.page {
  font-family: 'Pretendard', 'Noto Sans KR', sans-serif;
  color: #1e293b;
  overflow-x: hidden;
  position: relative;
  background-color: #f8fafc;
  user-select: none;
}

.bg-layer {
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  pointer-events: none;
  z-index: 0;
}
.gradient-bg {
  background:
    radial-gradient(circle at 15% 15%, rgba(59, 130, 246, 0.08) 0%, transparent 50%),
    radial-gradient(circle at 85% 85%, rgba(99, 102, 241, 0.08) 0%, transparent 50%);
}
.noise-bg {
  opacity: 0.03;
  background: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  position: relative;
  z-index: 1;
}

button { cursor: pointer; border: none; font-family: inherit; transition: all 0.2s; }

/* --- Typography Helpers --- */
h1 { font-size: 3.5rem; line-height: 1.2; font-weight: 800; letter-spacing: -0.02em; }
h2 { font-size: 2.25rem; line-height: 1.3; font-weight: 700; letter-spacing: -0.01em; margin-bottom: 20px; }
h3 { font-size: 1.5rem; font-weight: 700; margin-bottom: 12px; }
p { font-size: 1.125rem; line-height: 1.7; color: #475569; }
.text-highlight { color: #2563eb; }

/* --- Navigation --- */
.nav {
  position: fixed;
  top: 0; left: 0; width: 100%;
  height: 70px;
  display: flex;
  align-items: center;
  z-index: 100;
  transition: all 0.3s;
  background: rgba(255, 255, 255, 0.0);
}
.nav.scrolled {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(0,0,0,0.05);
  height: 60px;
}
.nav-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 100%; /* Ensure vertical centering */
}
.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 800;
  font-size: 1.25rem;
  letter-spacing: -0.02em;
}
.logo-mark {
  cursor: pointer;
}
.nav-links {
  display: flex;
  gap: 32px;
}
.nav-links a {
  text-decoration: none;
  font-weight: 500;
  color: #64748b;
  font-size: 0.95rem;
  transition: color 0.2s;
}
.nav-links a:hover { color: #0f172a; }

.nav-actions { display: flex; gap: 12px; align-items: center; }
.btn-text { background: none; font-weight: 600; color: #475569; padding: 8px 16px; }
.btn-text:hover { color: #0f172a; }
.btn-primary {
  background: #0f172a;
  color: white;
  padding: 8px 20px;
  border-radius: 99px;
  font-weight: 600;
  font-size: 0.9rem;
}
.btn-primary:hover { background: #334155; transform: translateY(-1px); }

/* --- Hero Section --- */
.hero-section {
  padding-top: 140px;
  padding-bottom: 100px;
  min-height: 90vh;
  display: flex;
  align-items: center;
  background: transparent;
}
.hero-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
}
.kicker {
  display: inline-block;
  font-size: 0.9rem;
  font-weight: 700;
  color: #2563eb;
  background: rgba(37, 99, 235, 0.1);
  padding: 6px 12px;
  border-radius: 99px;
  margin-bottom: 24px;
}
.hero-title {
  margin-bottom: 24px;
  color: #0f172a;
}
.hero-desc {
  margin-bottom: 40px;
  font-size: 1.25rem;
  max-width: 540px;
}
.hero-note { font-size: 0.9rem; color: #94a3b8; margin-top: 12px; }

/* --- Hero Visual 3D --- */
.hero-visual {
  position: relative;
  height: 500px;
  perspective: 1000px;
}
.glass-card {
  background: white;
  border: 1px solid #f1f5f9;
  box-shadow: 0 12px 30px rgba(74,108,247,0.08);
  border-radius: 28px;
  position: absolute;
  transition: transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1), box-shadow 0.4s;
}
.glass-card:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 30px 60px rgba(37, 99, 235, 0.15);
  z-index: 10;
}

.main-card {
  width: 320px;
  height: 420px;
  top: 20px;
  left: 60px;
  padding: 24px;
  z-index: 2;
  display: flex;
  flex-direction: column;
  animation: float 6s ease-in-out infinite;
}
.float-card {
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.c1 {
  top: 280px;
  right: 20px;
  width: 180px;
  height: 100px;
  z-index: 3;
  animation: floatWithRotate 7s ease-in-out infinite 0.5s;
}
/* --- Card Internal --- */
.card-header { display: flex; justify-content: space-between; margin-bottom: 20px; }
.avatar-group { display: flex; gap: 10px; align-items: center; }
.avatar { width: 40px; height: 40px; background: #e2e8f0; border-radius: 50%; }
.user-info .name-bar { width: 80px; height: 10px; background: #cbd5e1; border-radius: 4px; margin-bottom: 4px; }
.user-info .role-bar { width: 50px; height: 8px; background: #e2e8f0; border-radius: 4px; }
.status-badge { font-size: 0.75rem; padding: 4px 8px; border-radius: 6px; font-weight: 700; }
.status-badge.warning { background: #fef2f2; color: #ef4444; }

.radar-chart-mock { flex: 1; display: flex; justify-content: center; align-items: center; }
.radar-svg { width: 160px; height: 160px; overflow: visible; }
.radar-grid { fill: none; stroke: #e2e8f0; stroke-width: 0.8; }
.radar-grid.inner { stroke: #cbd5e1; stroke-dasharray: 2 2; }
.radar-axis { stroke: #cbd5e1; stroke-width: 0.5; }
.radar-val {
  fill: rgba(99, 102, 241, 0.25);
  stroke: #6366f1;
  stroke-width: 2;
  filter: drop-shadow(0 4px 6px rgba(99, 102, 241, 0.3));
  animation: radarPulse 4s ease-in-out infinite;
}
.radar-dot { fill: white; stroke: #6366f1; stroke-width: 1.5; }

@keyframes radarPulse {
  0%, 100% { fill-opacity: 0.7; transform: scale(1); transform-origin: center; }
  50% { fill-opacity: 0.9; transform: scale(1.02); transform-origin: center; }
}

.insight-row { display: flex; gap: 12px; margin-top: 20px; background: white; padding: 12px; border-radius: 12px; }
.icon-box { width: 32px; height: 32px; background: #fff7ed; color: #f97316; border-radius: 8px; display: grid; place-items: center; }
.text-box .l1 { font-size: 0.8rem; font-weight: 700; color: #1e293b; }
.text-box .l2 { font-size: 0.75rem; color: #64748b; }

.stat-num { font-size: 1.8rem; font-weight: 800; color: #2563eb; }
.stat-label { font-size: 0.85rem; font-weight: 600; color: #64748b; }

/* --- App Mockup Styling --- */
.app-mockup {
  width: 100%;
  height: 480px;
  background: white;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 40px 80px rgba(0,0,0,0.12);
  display: flex;
  border: 1px solid #e2e8f0;
}
.mock-sidebar {
  width: 60px;
  background: white;
  border-right: 1px solid #f1f5f9;
  display: flex;
  flex-direction: column;
  padding: 20px 12px;
  gap: 16px;
}
.side-item { width: 100%; height: 36px; background: #f1f5f9; border-radius: 8px; }
.side-item.active { background: #eff6ff; border: 1px solid #bfdbfe; }

.mock-main { flex: 1; display: flex; flex-direction: column; background: #f8fafc; }
.mock-top-bar { height: 48px; background: white; border-bottom: 1px solid #f1f5f9; }

.mock-content-grid {
  flex: 1;
  padding: 24px;
  display: grid;
  grid-template-columns: 1fr 140px;
  gap: 20px;
}
.small-cards { display: flex; flex-direction: column; gap: 20px; }
.stat-card {
  position: relative;
  width: 100%;
  height: calc(50% - 10px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.stat-val { font-size: 1.5rem; font-weight: 800; color: #0f172a; margin-bottom: 4px; }
.stat-lab { font-size: 0.75rem; color: #64748b; font-weight: 600; }

.app-mockup.mini { height: 320px; box-shadow: 0 20px 40px rgba(0,0,0,0.08); border-radius: 16px; }
/* Feature Mockups */

.admin-dashboard-mock { padding: 12px; height: 100%; }
.bar-chart-lines {
  height: 100%; width: 100%;
  background: linear-gradient(90deg, #eff6ff 0%, #eff6ff 40%, transparent 40%, transparent 50%, #eff6ff 50%, #eff6ff 80%, transparent 80%);
}
/* --- Section Commons --- */
.section { padding: 100px 0; }
.section-header { margin-bottom: 60px; }
.section-header.center { text-align: center; }
.section-tag {
  display: inline-block;
  font-size: 0.85rem;
  font-weight: 700;
  color: #6366f1;
  letter-spacing: 0.05em;
  margin-bottom: 16px;
  text-transform: uppercase;
}
.section h2 { color: #0f172a; }

/* --- Problem Section --- */
.problem-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
}
.p-card {
  background: white;
  padding: 40px 30px;
  border-radius: 20px;
  border: 1px solid #f1f5f9;
  box-shadow: 0 10px 30px rgba(0,0,0,0.03);
  transition: transform 0.3s;
}
.p-card:hover { transform: translateY(-10px); box-shadow: 0 20px 40px rgba(37, 99, 235, 0.1); border-color: #e0e7ff; }
.p-icon { font-size: 2.5rem; margin-bottom: 20px; }
.p-card h3 { margin-bottom: 16px; font-size: 1.3rem; }
.p-card p { font-size: 1rem; color: #64748b; }

/* --- Goal Section --- */
.goal-section { background: #0f172a; color: white; position: relative; overflow: hidden; }
.goal-content { text-align: center; max-width: 700px; margin: 0 auto; position: relative; z-index: 2; }
.goal-title { color: #60a5fa; font-size: 1rem; letter-spacing: 0.1em; margin-bottom: 30px; }
.goal-main { font-size: 2rem; font-weight: 600; line-height: 1.4; margin-bottom: 50px; color: #f8fafc; }
.goal-main strong { color: white; border-bottom: 2px solid #3b82f6; }
.goal-sub { display: flex; justify-content: center; gap: 30px; flex-wrap: wrap; }
.item { display: flex; align-items: center; gap: 8px; font-size: 1.1rem; color: #cbd5e1; }
.item .check { color: #3b82f6; font-weight: bold; }

/* --- Feature Section --- */
.feature-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 80px;
  align-items: center;
  margin-bottom: 120px;
}
.feature-row.reverse { direction: rtl; }
.feature-row.reverse .f-text { direction: ltr; }

.f-num {
  font-size: 4rem;
  font-weight: 900;
  color: #e2e8f0;
  line-height: 1;
  margin-bottom: 20px;
}
.f-text h3 { font-size: 2rem; margin-bottom: 20px; color: #1e293b; }
.f-desc { font-size: 1.15rem; margin-bottom: 30px; }
.f-list { list-style: none; padding: 0; }
.f-list li { margin-bottom: 12px; position: relative; padding-left: 24px; color: #475569; }
.f-list li::before {
  content: "•"; color: #2563eb; position: absolute; left: 0; font-weight: bold;
}

.screen-mockup {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
  border: 1px solid #e2e8f0;
  aspect-ratio: 4/3;
  display: flex;
  flex-direction: column;
}
.screen-mockup:hover {
  transform: translateY(-5px) rotateX(2deg);
  box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.2);
}

/* --- Process Section --- */
.process-section { background: #f8fafc; }
.process-steps {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}
.step-card {
  background: white;
  padding: 30px;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  width: 280px;
  text-align: center;
  position: relative;
  transition: transform 0.3s;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}
.step-card:hover { transform: translateY(-5px); box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
.step-num {
  font-size: 0.9rem; font-weight: 800; color: #cbd5e1; margin-bottom: 10px;
}
.step-icon { font-size: 2.5rem; margin-bottom: 16px; }
.step-card h3 { font-size: 1.2rem; margin-bottom: 12px; }
.step-card p { font-size: 0.95rem; color: #64748b; line-height: 1.5; }
.step-arrow { font-size: 2rem; color: #cbd5e1; font-weight: 300; }

/* --- FAQ Section --- */
.faq-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 30px;
}
.faq-item {
  background: white;
  padding: 30px;
  border-radius: 16px;
  border: 1px solid #f1f5f9;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
}
.faq-item h3 { font-size: 1.15rem; margin-bottom: 12px; color: #1e293b; }
.faq-item p { font-size: 1rem; color: #64748b; line-height: 1.6; }

@media (max-width: 768px) {
  .process-steps { flex-direction: column; }
  .step-arrow { transform: rotate(90deg); margin: 10px 0; }
  .faq-grid { grid-template-columns: 1fr; }
}

/* --- Differentiation Table --- */
.diff-table-wrap {
  background: white;
  border-radius: 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.05);
  padding: 40px;
  overflow-x: auto;
}
.diff-table { width: 100%; border-collapse: collapse; }
.diff-table th { text-align: left; padding: 20px; font-size: 1.1rem; border-bottom: 2px solid #e2e8f0; color: #64748b; }
.diff-table td { padding: 24px 20px; border-bottom: 1px solid #f1f5f9; font-size: 1.05rem; }
.th-criterion { width: 20%; }
.th-common { width: 40%; color: #94a3b8; }
.th-hradar { width: 40%; color: #2563eb; }
.diff-table tr:last-child td { border-bottom: none; }
.diff-table td:nth-child(2) { color: #94a3b8; }
.diff-table td:nth-child(3) { color: #1e293b; font-weight: 500; }

/* --- CTA Section --- */
.cta-section { padding: 120px 0; text-align: center; }
.cta-title { font-size: 3rem; margin-bottom: 20px; color: #0f172a; }
.cta-sub { font-size: 1.4rem; color: #64748b; margin-bottom: 50px; }
.btn-lg-white {
  background: white;
  color: #0f172a;
  border: 1px solid #e2e8f0;
  padding: 16px 32px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1.1rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}
.btn-lg-white:hover { border-color: #cbd5e1; transform: translateY(-2px); }

.btn-lg-primary {
  background: linear-gradient(135deg, #2563eb, #1e40af);
  color: white;
  padding: 16px 32px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1.1rem;
  box-shadow: 0 10px 20px rgba(37, 99, 235, 0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-lg-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 30px rgba(37, 99, 235, 0.3);
  filter: brightness(1.1);
}

.btn-lg-primary:active {
  transform: translateY(0);
}
.cta-buttons { display: flex; gap: 20px; justify-content: center; }

/* --- Footer --- */
.footer { background: white; border-top: 1px solid #f1f5f9; padding: 60px 0; text-align: center; }
.copyright { color: #94a3b8; font-size: 0.9rem; margin-bottom: 6px; }
.f-slogan { color: #cbd5e1; font-weight: 600; font-size: 0.85rem; letter-spacing: 0.1em; }

/* --- Animation Utilities --- */
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
}
@keyframes floatWithRotate {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-12px) rotate(2deg); }
}

[data-aos] {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.8s ease-out, transform 0.8s ease-out;
}
[data-aos].aos-animate {
  opacity: 1;
  transform: translateY(0);
}

/* --- Gradient Text --- */
.hero-title .text-highlight {
  color: transparent;
  background: linear-gradient(135deg, #2563eb, #1e40af);
  -webkit-background-clip: text;
  background-clip: text;
  display: inline-block;
}



@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }

/* --- Responsive --- */
@media (max-width: 960px) {
  .hero-content { grid-template-columns: 1fr; text-align: center; }
  h1 { font-size: 2.5rem; }
}

/* --- New Visual Styles --- */
.mock-body.center-v, .mock-main.center-v { display: flex; align-items: center; justify-content: center; background: #f8fafc; }
.bg-soft { background: #f1f5f9; }

/* Document Visual (Feature 2) */
.doc-visual { position: relative; width: 180px; height: 240px; }
.doc-paper {
  position: absolute; top: 0; left: 0; width: 100%; height: 100%;
  background: white; border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.08); border: 1px solid #e2e8f0;
  padding: 20px; z-index: 2;
  display: flex; flex-direction: column;
}
.doc-paper-back {
  position: absolute; top: 10px; left: 10px; width: 100%; height: 100%;
  background: #fff; border-radius: 8px; border: 1px solid #cbd5e1;
  z-index: 1; transform: rotate(4deg);
}
.doc-header { border-bottom: 2px solid #f1f5f9; padding-bottom: 10px; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center; }
.doc-title { font-size: 0.7rem; font-weight: 800; color: #1e293b; text-transform: uppercase; }
.doc-date { font-size: 0.6rem; color: #94a3b8; }

.doc-body { flex: 1; display: flex; flex-direction: column; gap: 15px; position: relative; }
.doc-radar-area { display: flex; justify-content: center; }
.doc-radar-circle {
  width: 60px; height: 60px; border-radius: 50%; border: 1px dashed #cbd5e1;
  background: radial-gradient(circle, rgba(37,99,235,0.1) 0%, transparent 70%);
  position: relative;
}
.doc-radar-circle::after {
  content: ''; position: absolute; inset: 10%; background: rgba(37,99,235,0.2);
  clip-path: polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%);
}
.doc-text-block { display: flex; flex-direction: column; gap: 4px; }
.doc-line { height: 4px; background: #f1f5f9; border-radius: 2px; }
.doc-line.l-100 { width: 100%; }
.doc-line.l-80 { width: 80%; }
.doc-line.l-40 { width: 40%; }
.doc-line.highlight { background: #bfdbfe; }

.doc-stamp {
  position: absolute; bottom: 0; right: 0;
  font-size: 1rem; font-weight: 900; color: #2563eb;
  border: 2px solid #2563eb; padding: 2px 8px; border-radius: 4px;
  transform: rotate(-15deg); opacity: 0.8;
}

/* Feature 1 Moved Here: Report Grid Layout */
.report-layout {
  width: 100%; height: 100%;
  background: #f1f5f9;
  position: relative;
  display: flex; justify-content: center; align-items: center;
}
.report-paper {
  width: 80%; height: 80%;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.06);
  padding: 20px;
  display: flex; flex-direction: column;
  z-index: 2;
}
.report-deco {
  position: absolute; width: 70%; height: 70%;
  background: rgba(255,255,255,0.5);
  top: 15%; left: 18%; border-radius: 12px;
  transform: rotate(3deg); z-index: 1; border: 1px solid white;
}
.rp-header { margin-bottom: 20px; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px; }
.rp-title-bar { width: 100px; height: 8px; background: #cbd5e1; border-radius: 4px; }
.rp-grid {
  display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; gap: 10px; flex: 1;
}
.rp-item { background: #f8fafc; border-radius: 8px; overflow: hidden; position: relative; }
.rp-chart-line { width: 100%; height: 100%; background: url("data:image/svg+xml,%3Csvg viewBox='0 0 100 50' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0,40 Q25,10 50,30 T100,10' fill='none' stroke='%233b82f6' stroke-width='3'/%3E%3C/svg%3E") no-repeat center/contain; }
.rp-chart-bar { position: absolute; bottom: 0; left: 10%; width: 20%; height: 60%; background: #93c5fd; box-shadow: 30px -20px 0 #3b82f6; }
.rp-chart-pie { width: 40px; height: 40px; border-radius: 50%; background: conic-gradient(#3b82f6 0% 70%, #e2e8f0 70% 100%); margin: 20px auto; }

.screen-mockup.center-flex { display: flex; align-items: center; justify-content: center; background: #fcfcfc; }
.decision-flow { display: flex; align-items: center; }
.d-step {
  padding: 10px 20px;
  border-radius: 99px;
  border: 1px solid #e2e8f0;
  background: white;
  color: #64748b;
  font-weight: 600;
  font-size: 0.9rem;
  box-shadow: 0 4px 6px rgba(0,0,0,0.02);
}
.d-step.active {
  border-color: #3b82f6; color: white; background: #3b82f6; font-weight: 700;
  box-shadow: 0 8px 15px rgba(59, 130, 246, 0.3);
}
.d-line { width: 40px; height: 2px; background: #e2e8f0; margin: 0 4px; }
</style>
