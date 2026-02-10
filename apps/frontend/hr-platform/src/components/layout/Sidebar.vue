<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <aside class="sidebar" @mouseleave="hideFlyout" @mouseenter="cancelHide">
    <nav class="nav">
      <template v-for="(section, sIdx) in menuConfig" :key="sIdx">
        <div class="section-title" v-if="!section.hidden && section.items.length > 0">{{ section.title }}</div>

        <template v-for="(item, iIdx) in section.items" :key="iIdx">
          <!-- Item with Flyout -->
          <div
            v-if="item.children"
            class="nav-group has-flyout"
            @mouseenter="showFlyout($event, item)"
          >
            <div class="nav-item">
              <span>{{ item.text }}</span>
              <span class="arrow">›</span>
            </div>
          </div>

          <!-- Direct Link -->
          <RouterLink
            v-else
            :to="item.to"
            class="nav-item link"
            active-class="active"
          >
            {{ item.text }}
          </RouterLink>
        </template>
      </template>
    </nav>
  </aside>

  <!-- Teleported Flyout Menu -->
  <Teleport to="body">
    <div
      v-if="activeFlyout"
      class="flyout-container"
      :style="flyoutStyle"
      @mouseenter="cancelHide"
      @mouseleave="hideFlyout"
    >
      <div class="flyout-content">
        <RouterLink
          v-for="child in activeFlyout.children"
          :key="child.to"
          :to="child.to"
          class="flyout-item"
          @click="closeAll"
        >
          {{ child.text }}
        </RouterLink>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'

const auth = useAuthStore()

// 권한 기반 필터링 헬퍼 함수
const hasAccess = (path) => {
  // 관리자는 모든 메뉴 접근 가능
  if (auth.isAdmin) return true

  const mappings = auth.permissionMappings

  // 권한 매핑이 로드되지 않았으면 보수적으로 차단 (또는 로딩 중 표시)
  if (!mappings || Object.keys(mappings).length === 0) {
    console.warn('[SIDEBAR] 권한 매핑이 로드되지 않음 (Empty Mappings)')
    return false
  }

  // permissionMappings에서 해당 경로의 필요 권한 확인
  const requiredPerm = mappings[path]

  // 권한 매핑 없으면 차단
  if (!requiredPerm) {
    return false
  }

  // 권한 체크
  return auth.hasPermission(requiredPerm)
}

// 메뉴 아이템 필터링 함수
const filterMenuItems = (items) => {
  return items.filter(item => {
    // 자식 메뉴가 있는 경우
    if (item.children) {
      item.children = filterMenuItems(item.children)
      return item.children.length > 0
    }
    // 직접 링크
    return hasAccess(item.to)
  })
}

// --- Menu Configuration ---
// permissionMappings가 변경되면 자동으로 재계산되도록 의존성 확인
const menuConfig = computed(() => {
  // 의존성 강제 주입 (Reactivity Trigger) - computed 내에서 속성에 접근하여 자동 추적을 보장합니다.
  // 로직 분기(예: 초기 로딩 시)에 따라 의존성 추적이 누락되는 것을 방지합니다.
  // eslint-disable-next-line no-unused-vars
  const _trigger = auth.permissionMappings
  // eslint-disable-next-line no-unused-vars
  const _permissions = auth.permissions

  const rawMenu = [
    {
      title: '마이페이지',
      items: [
        {
          text: '내 정보 관리',
          children: [
            { text: '내 정보 조회/수정', to: '/my-profile' },
            { text: '내 부서 조회', to: '/my-department' },
          ]
        }
      ]
    },
    // ... (기존 메뉴들) ...
    {
      title: '인사 관리',
      items: [
        {
          text: '사원 · 부서 관리',
          children: [
            { text: '사원 관리 (목록)', to: '/employee' },
            { text: '사원 목록 조회', to: '/personnel/employees/list' },
            { text: '부서 관리 (목록)', to: '/organization' },
            { text: '조직도', to: '/department/org-chart' },
            { text: '부서 정책 관리', to: '/department/manage' },
            { text: '직위 관리', to: '/personnel/positions' },
            { text: '직위 목록 조회', to: '/personnel/positions/list' },
            { text: '인사 발령 이력', to: '/personnel/history' },
          ]
        }
      ]
    },
    {
      title: '회사 관리',
      items: [
        {
          text: '회사 정보 관리',
          children: [
            { text: '내 회사 정보', to: '/company/my' },
            { text: '내 회사 관리', to: '/company/my-manage' },
            { text: '역할/권한 관리', to: '/company/roles' }
          ]
        }
      ]
    },
    {
      title: '성과 평가',
      items: [
        {
          text: '목표 관리',
          children: [
            { text: 'KPI/OKR', to: '/goal' },
            { text: '목표 전체 조회', to: '/hr/goals' },
            { text: '팀장 목표 전체 조회', to: '/to/goals' },
          ]
        },
        {
          text: '다면 평가',
          children: [
            { text: '회차 등록/조회', to: '/cycles' },
            { text: '회차 등록/조회(관리자)', to: '/hr/cycles' },
            { text: '평가유형 생성/회차 포함(관리자)', to: '/hr/evaluation/type/setting' },
            { text: '문항지 생성', to: '/hr/evaluation/question/form/setting' },
            { text: '평가 배정', to: '/hr/evaluation/assignment' },
            { text: '다면 평가', to: '/evaluation/assignment/response' },
            { text: '평가 응답 조회(관리자)', to: '/hr/evaluation/response/result' },
            { text: '평가 결과 조회', to: '/evaluation/response/my/result' },
          ]
        },
        {
          text: '등급관리',
          children: [
            { text: '등급 설정', to: '/grade/setting' },
            { text: '부서 등급 부여 현황', to: '/grading/list' },
            { text: '부서 등급 부여 현황(관리자)', to: '/hr/grading/list' },
            { text: '부서원 등급 부여', to: '/to/grading/list' },
            { text: '부서원 등급 부여 및 승인', to: '/hr/grading/list/approve' },
            { text: '부여된 등급 조회', to: '/my/grading' },
            { text: '이의 제기 관리', to: '/to/grading/objection' },
          ]
        },
        {
          text: '대시보드/리포트',
          children: [
            { text: '대시보드', to: '/my/dashboard' },
            { text: '사원 대시보드', to: '/hr/dashboard' },
            { text: '역량강화 리포트 관리', to: '/all/competency/report' },
            { text: '역량강화 리포트 이력', to: '/me/competency/report' },
            { text: '학습컨텐츠 관리', to: '/all/contents' },
          ]
        }
      ]
    },
    {
      title: '근태 관리',
      items: [
        {
          text: '근태 관리',
          children: [
            { text: '나의 출퇴근 관리', to: '/attendance/commute' },
            // { text: 'IP 정책 관리', to: '/attendance/ip-policy' }, // Hidden as per request
            { text: '부서 출퇴근 관리', to: '/attendance/department' },
            { text: '부서별 근태 캘린더', to: '/attendance/department-calendar' }
          ]
        }
      ]
    },
    {
      title: '휴가 관리',
      items: [
        {
          text: '휴가 관리',
          children: [
            { text: '내 휴가 이력', to: '/leave/my-history' },
            { text: '휴가 정책 관리', to: '/leave/policy' },
            { text: '부서 휴가 이력', to: '/leave/admin/department-history' }
          ]
        }
      ]
    },
    {
      title: '결재 관리',
      items: [
        {
          text: '결재 관리',
          children: [
            { text: '결재 문서 등록', to: '/approval/create' },
            { text: '내 문서함', to: '/approval/my-documents' },
            { text: '결재 관리', to: '/approval/admin' },
          ]
        }
      ]
    },
    {
      title: '연봉 관리',
      items: [
        {
          text: '연봉 관리',
          children: [
            { text: '기본급 관리', to: '/all/salary/basic' },
            { text: '기본급/변동보상 이력', to: '/me/salary/basic' },
            { text: '변동보상 관리', to: '/all/salary/compensation' },
          ]
        }
      ]
    },
    { title: '챗봇 관리', items: [{ text: '제도 · 규정', to: '/policy' }] },
    {
      title: '기타',
      items: [
        { text: '공지 관리', to: '/notice', permission: 'NOTICE_READ' }
      ]
    },
  ]

  // 변경된 로직: rawMenu를 복사(deep copy)해서 필터링
  const filtered = JSON.parse(JSON.stringify(rawMenu)).map(section => ({
    ...section,
    items: filterMenuItems(section.items)
  })).filter(section => section.items.length > 0)

  // console.log(`[SIDEBAR] Filtered sections:`, filtered.map(s => `${s.title}(${s.items.length})`))
  return filtered
})

// --- Logic ---
const activeFlyout = ref(null)
const flyoutTop = ref(0)
const flyoutLeft = ref(0)
let hideTimer = null

const flyoutStyle = computed(() => ({
  top: `${flyoutTop.value}px`,
  left: `${flyoutLeft.value}px`
}))

function showFlyout(event, item) {
  if (hideTimer) clearTimeout(hideTimer)
  const rect = event.currentTarget.getBoundingClientRect()
  flyoutTop.value = rect.top
  flyoutLeft.value = rect.right + 2 // 2px gap
  activeFlyout.value = item
}

function hideFlyout() {
  hideTimer = setTimeout(() => {
    activeFlyout.value = null
  }, 100)
}

function cancelHide() {
  if (hideTimer) clearTimeout(hideTimer)
}

function closeAll() {
  activeFlyout.value = null
}

</script>

<style scoped>
/* ===== Sidebar ===== */
.sidebar {
  width: 220px;
  background: #ffffff;
  border-right: 1px solid #e6e8ec;
  padding: 14px 10px;
  font-family: Pretendard, -apple-system, BlinkMacSystemFont, sans-serif;
  position: relative;
  z-index: 1000;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: thin;
  scrollbar-color: rgba(0,0,0,0.1) transparent;
}

/* Custom Scrollbar */
.sidebar::-webkit-scrollbar { width: 4px; }
.sidebar::-webkit-scrollbar-track { background: transparent; }
.sidebar::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 10px;
}
.sidebar:hover::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.1); }

/* ===== Layout ===== */
.nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* ===== Section ===== */
.section-title {
  font-size: 9px;
  font-weight: 600;
  color: #8b95a1;
  margin: 16px 0 6px 8px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

/* ===== Item ===== */
.nav-item {
  padding: 10px 12px;
  font-size: 13px;
  font-weight: 500;
  color: #2f343d;
  border-radius: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
}
.nav-item:hover {
  background: #f4f7fa;
  color: #1f4fd8;
}

/* ===== Arrow ===== */
.arrow {
  font-size: 14px;
  color: #9aa1ad;
  transition: transform 0.2s;
}
.has-flyout:hover .arrow {
  transform: translateX(2px);
  color: #1f4fd8;
}

/* ===== Active ===== */
.active {
  background: #1f4fd8 !important;
  color: #ffffff !important;
  box-shadow: 0 4px 12px rgba(31, 79, 216, 0.2);
}
</style>

<!-- Global Styles for Teleported Flyout -->
<style>
.flyout-container {
  position: fixed;
  z-index: 9999;
  padding-left: 10px; /* Bridge gap buffer */
  margin-left: -5px;   /* Overlap buffer */
}

.flyout-content {
  width: 200px;
  background: #ffffff;
  border: 1px solid #e6e8ec;
  border-radius: 14px;
  padding: 8px;
  box-shadow: 10px 10px 40px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  animation: slideInSidebar 0.2s ease;
}

@keyframes slideInSidebar {
  from { opacity: 0; transform: translateX(8px); }
  to { opacity: 1; transform: translateX(0); }
}

.flyout-item {
  padding: 8px 12px;
  font-size: 13px;
  border-radius: 8px;
  color: #4b5563;
  text-decoration: none;
  display: block;
  transition: all 0.15s ease;
  margin-bottom: 2px;
}
.flyout-item:last-child { margin-bottom: 0; }
.flyout-item:hover {
  background: #f0f4ff;
  color: #1f4fd8;
  font-weight: 600;
}
</style>
