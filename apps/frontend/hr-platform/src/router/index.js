import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import PrivacyPolicyView from '@/views/auth/PrivacyPolicyView.vue'
import TermsOfServiceView from '@/views/auth/TermsOfServiceView.vue'
import PolicyView from '@/views/policy/PolicyView.vue'
import PolicyDetailView from '@/views/policy/PolicyDetailView.vue'
import NoticeView from '@/views/notice/NoticeView.vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import AuthLayout from '@/components/layout/AuthLayout.vue'
import TagView from '@/views/contents/tag/TagView.vue'
import ContentsView from '@/views/contents/content/ContentsView.vue'
import SalaryDashboardView from '@/views/salary/SalaryDashboardView.vue'
import BasicSalaryView from '@/views/salary/basicSalary/BasicSalaryView.vue'
import CompensationSalaryView from '@/views/salary/compensationSalary/CompensationSalaryView.vue'
import ContentsCreateView from '@/views/contents/content/ContentsCreateView.vue'
import ContentsListView from '@/views/contents/content/ContentsListView.vue'
import ContentsDetailView from '@/views/contents/content/ContentsDetailView.vue'
import BasicSalaryAllListView from "@/views/salary/basicSalary/BasicSalaryAllListView.vue";
import BasicSalaryCreateView from "@/views/salary/BasicSalaryCreateView.vue";
import CompensationSalaryCreateView from "@/views/salary/compensationSalary/CompensationSalaryCreateView.vue";
import CompensationSalaryAllListView from "@/views/salary/compensationSalary/CompensationSalaryAllListView.vue";
import BasicSalaryAllDetailView from "@/views/salary/basicSalary/BasicSalaryAllDetailView.vue";
import CompensationSalaryDetailView from "@/views/salary/compensationSalary/CompensationSalaryDetailView.vue";
import BasicSalarMeListView from "@/views/salary/basicSalary/BasicSalarMeListView.vue";
import SalaryEmployeeHistoryView from "@/views/salary/basicSalary/SalaryEmployeeHistoryView.vue";
import BasicSalaryEmployeeListView
  from "@/views/salary/basicSalary/BasicSalaryEmployeeListView.vue";
import CompetencyReportView from "@/views/report/CompetencyReportView.vue";
import CompetencyReportAllListView from "@/views/report/CompetencyReportAllListView.vue";
import CompetencyReportMeListView from "@/views/report/CompetencyReportMeListView.vue";
import CompetencyReportAllCreateView
  from '@/views/report/CompetencyReportAllCreateView.vue'
import CompetencyReportEmployeeAllListView
  from '@/views/report/CompetencyReportEmployeeAllListView.vue'
import TagModalView from '@/views/contents/tag/TagModalView.vue'
import GoalListView from '@/views/goal/GoalListView.vue'
import HRGoalDashboard from '@/views/goal/HRGoalDashboard.vue'
import GoalDetailView from '@/views/goal/GoalDetailView.vue'
import TeamOwnerGoalListView from '@/views/goal/TeamOwnerGoalListView.vue'
import GoalCreateView from '@/views/goal/GoalCreateView.vue'
import CycleManageView from '@/views/cycle/CycleManageView.vue'
import CycleDetailPage from '@/views/cycle/CycleDetailPage.vue'
import CycleEditPage from '@/views/cycle/CycleEditPage.vue'
import CycleAdminManageView from '@/views/cycle/CycleAdminManageView.vue'
import CycleAdminDetailPage from '@/views/cycle/CycleAdminDetailPage.vue'
import CycleAdminEditPage from '@/views/cycle/CycleAdminEditPage.vue'
import CompanyGradeSettingPage from '@/views/grading/gradeSetting/CompanyGradeSettingPage.vue'
import DeptGradeStatusPage from '@/views/grading/deptGrade/DeptGradeStatusPage.vue'
import AdminDeptGradeStatusPage from '@/views/grading/deptGrade/AdminDeptGradeStatusPage.vue'
import IndividualGradePage from '@/views/grading/individualGrade/IndividualGradePage.vue'
import IndividualGradeApprovePage from '@/views/grading/individualGrade/IndividualGradeApprovePage.vue'
import MygradePage from '@/views/grading/individualGrade/MygradePage.vue'
import AdminGradeObjectionPage from '@/views/grading/gradeObjection/AdminGradeObjectionPage.vue'
import AdminGradeObjectionDetailPage from '@/views/grading/gradeObjection/AdminGradeObjectionDetailPage.vue'
import EvaluationTypeSetupPage from '@/views/evaluation/evalType/EvaluationTypeSetupPage.vue'
import EvaluationFormBuilderPage from '@/views/evaluation/evalQusetion/EvaluationFormBuilderPage.vue'
import EvaluationAssignmentSetupPage
  from '@/views/evaluation/evalAssignment/EvaluationAssignmentSetupPage.vue'
import EvaluationAssignmentStatusPage from '@/views/evaluation/evalAssignment/EvaluationAssignmentStatusPage.vue'
import EvaluationResponsePage from '@/views/evaluation/evaluationResponse/EvaluationResponsePage.vue'
import EvaluationResultPage from '@/views/evaluation/evaluationResponse/EvaluationResultPage.vue'
import EvaluationMyResultPage from '@/views/evaluation/evaluationResponse/EvaluationMyResultPage.vue'

import NoticeListView from '@/views/notice/NoticeListView.vue'
import NoticeDetailView from '@/views/notice/NoticeDetailView.vue'
import NoticeCreateView from '@/views/notice/NoticeCreateView.vue'
import NoticeEditView from '@/views/notice/NoticeEditView.vue'
import HomeView from '@/views/auth/HomeView.vue'
import GatewayView from '@/views/auth/GatewayView.vue'
import CompanyRegisterView from '@/views/auth/CompanyRegisterView.vue'

import AdminLayout from '@/components/layout/AdminLayout.vue'
import AdminComAppList from '@/views/admin/AdminComAppList.vue'
import AdminUserAccountList from '@/views/admin/AdminUserAccountList.vue'
import ApprovalDocumentTypeManagementView from '@/views/approval/ApprovalDocumentTypeManagementView.vue'
import DepartmentListView from '@/views/department/DepartmentListView.vue'
import DepartmentManageView from '@/views/department/DepartmentManageView.vue'

import AttendanceIpPolicyView from '@/views/attendance/AttendanceIpPolicyView.vue'
import AttendanceCommuteView from '@/views/attendance/AttendanceCommuteView.vue'
import AttendanceDepartmentView from '@/views/attendance/AttendanceDepartmentView.vue'
import DepartmentAttendanceCalendarView from '@/views/attendance/DepartmentAttendanceCalendarView.vue'
import AttendanceEmployeeDetailView from '@/views/attendance/AttendanceEmployeeDetailView.vue'
import MyDashboard from '@/views/dashboard/MyDashboard.vue'
import EmpDashboard from '@/views/dashboard/EmpDashboard.vue'

import ContentsCustomCodeView
  from '@/views/contents/content/ContentsCustomCodeView.vue'
import CompetencyReportDetailView
  from '@/views/report/CompetencyReportDetailView.vue'

const routes = [



  { path: '/register-company', component: AuthLayout, children: [{ path: '', component: CompanyRegisterView }], },
  { path: '/privacy-policy', component: AuthLayout, children: [{ path: '', component: PrivacyPolicyView }], },
  { path: '/terms-of-service', component: AuthLayout, children: [{ path: '', component: TermsOfServiceView }], },
  { path: '/home', component: AuthLayout, children: [{ path: '', component: HomeView }], },
  { path: '/gateway', component: AuthLayout, children: [{ path: '', component: GatewayView }], },

  {
    path: '/admin', component: AdminLayout, meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      { path: 'company-applications', component: AdminComAppList },
      { path: 'user-accounts', component: AdminUserAccountList },
      { path: 'permissions', component: () => import('@/views/admin/PermissionRegistryView.vue') },
      { path: 'company/manage', component: () => import('@/views/company/CompanyManageView.vue') },
    ],
  },

  {
    path: '/',
    component: AppLayout,
    children: [

      { path: 'policy', component: PolicyView },
      {
        path: 'notice',
        name: 'notice-list',
        component: NoticeListView,

      },
      {
        path: 'notice/create',
        name: 'notice-create',
        component: NoticeCreateView,

      },
      {
        path: 'notice/:id',
        name: 'notice-detail',
        component: NoticeDetailView,
        props: true,

      },
      {
        path: 'notice/:id/edit',
        name: 'notice-edit',
        component: NoticeEditView,
        props: true,

      },
      {
        path: 'policy',
        children: [
          { path: '', name: 'policy', component: PolicyView },
          { path: ':id', name: 'policy-detail', component: PolicyDetailView, props: true },
        ]
      },
      {
        path: 'notice',
        component: NoticeView,
        children: [
          { path: '', name: 'notice-list', component: NoticeListView },
          { path: 'create', name: 'notice-create', component: NoticeCreateView },
          { path: ':id', name: 'notice-detail', component: NoticeDetailView, props: true },
          { path: ':id/edit', name: 'notice-edit', component: NoticeEditView, props: true },
        ]
      },


      //마이페이지 (사용자 본인 정보)
      { path: 'my-profile', name: 'MyProfile', component: () => import('@/views/user/MyProfileView.vue'), },
      { path: 'my-department', name: 'MyDepartment', component: () => import('@/views/department/MyDepartmentView.vue'), },

      { path: 'organization', component: DepartmentListView },
      { path: 'department/org-chart', component: () => import('@/views/department/OrganizationChartView.vue'), },
      { path: 'department/manage', component: DepartmentManageView },

      { path: 'employee', component: () => import('@/views/personnel/EmployeeListView.vue') },
      {
        path: 'personnel/employees/list', component: () => import('@/views/personnel/EmployeeReadOnlyView.vue'),
      }, // 조회 전용
      { path: 'personnel/positions', component: () => import('@/views/personnel/PositionManageView.vue'), },
      {
        path: 'personnel/positions/list', component: () => import('@/views/personnel/PositionReadOnlyView.vue'),
      }, // Read-Only Position List

      // 인사 발령 및 이력
      { path: 'personnel/appointment', component: () => import('@/views/personnel/PersonnelAppointmentView.vue'), },//사용하는 곳 없음
      { path: 'personnel/history', component: () => import('@/views/personnel/PersonnelAppointmentHistoryView.vue'), },

      // 회사 관리
      { path: 'company/my', component: () => import('@/views/company/MyCompanyView.vue') },
      { path: 'company/my-manage', component: () => import('@/views/company/MyCompanyManageView.vue'), },
      { path: 'company/roles', component: () => import('@/views/company/RoleManageView.vue') },


      //성과평가-목표관리
      { path: 'goal', component: GoalListView },
      { path: 'goal/create', component: GoalCreateView },
      { path: 'goal/:goalId(\\d+)', component: GoalDetailView }, { path: 'hr/goals', component: HRGoalDashboard },
      { path: 'to/goals', component: TeamOwnerGoalListView },
      {
        path: 'report',
        component: CompetencyReportView,
        redirect: '/all/competency/report',
        children: [
          { path: '/all/competency/report', component: CompetencyReportAllListView },
          { path: '/all/competency/report/create', component: CompetencyReportAllCreateView },
          { path: '/all/competency/report/employee', component: CompetencyReportEmployeeAllListView },
          /* { path: '/dept/competency/report', component: CompetencyReportDeptListView },*/
          { path: '/me/competency/report', component: CompetencyReportMeListView },
          { path: '/me/competency/report/detail/:competencyReportId', component: CompetencyReportDetailView },
        ]
      },
      { path: 'salary/dashboard', component: SalaryDashboardView },
      {
        path: 'salary/basic',
        component: BasicSalaryView,
        redirect: '/all/salary/basic',
        children: [
          { path: '/all/salary/basic', component: BasicSalaryAllListView },
          { path: '/all/salary/basic/employee/:docId', component: BasicSalaryEmployeeListView },
          { path: '/me/salary/basic', component: BasicSalarMeListView },
          { path: '/all/salary/create', component: BasicSalaryCreateView },
          { path: '/all/salary/basic/detail/:id', component: BasicSalaryAllDetailView },
          { path: '/me/salary/history/:id', component: SalaryEmployeeHistoryView },
        ]
      },
      {
        path: 'salary/compensation',
        component: CompensationSalaryView,
        redirect: '/all/salary/compensation',
        children: [
          { path: '/all/salary/compensation', component: CompensationSalaryAllListView },
          { path: '/all/salary/compensation/create', component: CompensationSalaryCreateView },
          { path: '/all/salary/compensation/employee/:docId', component: CompensationSalaryDetailView },
        ]
      },
      {
        path: 'contents',
        component: ContentsView,
        redirect: '/all/contents',
        children: [
          { path: '/all/contents', component: ContentsListView },
          { path: '/all/contents/customCode', component: ContentsCustomCodeView },
          { path: '/all/contents/create', component: ContentsCreateView },
          { path: '/all/contents/update/:contentId', component: ContentsCreateView },
          { path: '/all/contents/detail/:contentId', component: ContentsDetailView, props: true }
        ]
      },
      {
        path: 'contents/tag', component: TagView
        , children: [
          { path: '/all/contents/tag', component: TagModalView },
        ]
      },

      //회차
      { path: 'cycles', component: CycleManageView },
      { path: 'cycles/:cycleId/edit', component: CycleEditPage },
      {
        path: 'cycles/:cycleId',
        name: 'CycleDetail',
        component: CycleDetailPage
      },
      { path: 'hr/cycles', component: CycleAdminManageView },
      { path: 'hr/cycles/:cycleId', component: CycleAdminDetailPage },
      { path: 'hr/cycles/:cycleId/edit', component: CycleAdminEditPage },

      //등급
      { path: 'grade/setting', component: CompanyGradeSettingPage },
      { path: 'grading/list', component: DeptGradeStatusPage },
      { path: 'hr/grading/list', component: AdminDeptGradeStatusPage },
      { path: 'to/grading/list', component: IndividualGradePage },
      { path: 'hr/grading/list/approve', component: IndividualGradeApprovePage },
      { path: 'my/grading', component: MygradePage },
      { path: 'to/grading/objection', component: AdminGradeObjectionPage },
      { path: 'hr/objections/:objectionId', name: 'AdminGradeObjectionDetailPage', component: AdminGradeObjectionDetailPage },

      //평가
      { path: 'hr/evaluation/type/setting', component: EvaluationTypeSetupPage },
      { path: 'hr/evaluation/question/form/setting', component: EvaluationFormBuilderPage },
      { path: 'hr/evaluation/assignment', component: EvaluationAssignmentSetupPage },
      { path: 'hr/evaluation/assignment/status', component: EvaluationAssignmentStatusPage },
      { path: 'evaluation/assignment/response', component: EvaluationResponsePage },
      { path: 'hr/evaluation/response/result', component: EvaluationResultPage },
      { path: 'evaluation/response/my/result', component: EvaluationMyResultPage },
      { path: 'to/grading/objection', component: AdminGradeObjectionPage },
      { path: 'hr/objections/:objectionId', name: 'AdminGradeObjectionDetailPage', component: AdminGradeObjectionDetailPage },
      { path: 'to/grading/objection', component: AdminGradeObjectionPage },
      { path: 'hr/objections/:objectionId', name: 'AdminGradeObjectionDetailPage', component: AdminGradeObjectionDetailPage },


      //대시보드
      { path: 'my/dashboard', component: MyDashboard },
      { path: 'hr/dashboard', component: EmpDashboard },

      {
        path: 'approval',
        redirect: '/approval/my-documents',
        children: [
          { path: 'approval-document-types', component: ApprovalDocumentTypeManagementView },
          { path: 'create', component: () => import('@/views/approval/ApprovalCreateView.vue') },
          { path: 'my-documents', component: () => import('@/views/approval/ApprovalMyListView.vue') },
          { path: 'all-documents', component: () => import('@/views/approval/ApprovalAllListView.vue') },
          { path: 'admin', component: () => import('@/views/approval/ApprovalDocumentTypeManagementView.vue') },
          { path: ':docId', component: () => import('@/views/approval/ApprovalDetailView.vue'), props: true },
        ],
      },

      // 근태 관리
      {
        path: 'attendance',
        redirect: '/attendance/commute', // 기본적으로 사원 출퇴근 관리 페이지로 리디렉션
        children: [
          { path: 'commute', component: AttendanceCommuteView }, // 사원 출퇴근 관리
          { path: 'ip-policy', component: AttendanceIpPolicyView }, // 인사팀 IP 정책 관리
          { path: 'department', component: AttendanceDepartmentView }, // 인사팀 부서 출퇴근 관리
          { path: 'department-calendar', component: DepartmentAttendanceCalendarView }, // 부서별 근태 캘린더 (인사팀)
          { path: 'employee-detail/:employeeId/:workDate', name: 'AttendanceEmployeeDetail', component: AttendanceEmployeeDetailView, props: true }, // 사원 근태 상세 조회
        ],
      },

      // 휴가 관리
      {
        path: 'leave',
        redirect: '/leave/my-history',
        children: [
          { path: 'my-history', component: () => import('@/views/leave/MyLeaveHistoryView.vue') },
          { path: 'policy', component: () => import('@/views/leave/LeavePolicyAdminView.vue') },
          { path: 'admin/department-history', component: () => import('@/views/leave/DepartmentLeaveHistoryView.vue'), meta: { requiresAdmin: true } },
        ],
      },


    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/error/NotFoundView.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from) => {
  const auth = useAuthStore()

  const publicPaths = ['/home', '/register-company', '/gateway', '/privacy-policy', '/terms-of-service']
  const isPublic = publicPaths.includes(to.path)

  // 1. Not logged in -> Redirect appropriately (unless public)
  // 참고: authStore.loadFromStorage()에서 이미 토큰 유효성 검증을 수행함
  // 만료된 토큰은 자동으로 제거되므로 isLoggedIn은 유효한 토큰이 있을 때만 true
  // 0. Root Path Handling
  if (to.path === '/') {
    return auth.isLoggedIn ? auth.firstAccessiblePath() : '/home'
  }

  if (!auth.isLoggedIn) {
    if (!isPublic) {
      return { path: '/gateway', query: { redirect: to.fullPath } }
    }
    return // Allow public
  }

  // 2. Redirect away from public landing pages if already logged in
  if (isPublic) {
    return auth.firstAccessiblePath()
  }

  // 2-1. Admin Check (Security)
  if (to.meta.requiresAdmin && !auth.isAdmin) {
    alert('관리자 권한이 필요합니다.')
    return auth.firstAccessiblePath()
  }

  // 3. Dynamic Permission Check (from Backend DB)
  // [Fix] 관리자 전용 경로나 이미 관리자 권한인 경우 동적 권한 체크를 건너뜀
  if (to.path.startsWith('/admin') || auth.isAdmin) {
    return
  }

  let requiredPerm = null

  // Check from specific to general (child to parent)
  for (let i = to.matched.length - 1; i >= 0; i--) {
    const path = to.matched[i].path
    // 동적 매핑: auth.permissionMappings = { '/notice': 'NOTICE_READ', ... }
    if (auth.permissionMappings[path]) {
      requiredPerm = auth.permissionMappings[path]
      break
    }
  }

  if (requiredPerm && !auth.hasPermission(requiredPerm)) {
    alert('해당 메뉴에 대한 접근 권한이 없습니다.')

    // 만약 초기 진입(새로고침 등)에서 권한이 막힌 경우라면, 
    // 무한 루프 방지를 위해 게이트웨이로 보내거나 로그아웃 처리
    if (from.matched.length === 0) {
      // 1. 단순 게이트웨이 이동
      // return '/gateway'

      // 2. 또는 세션을 초기화하고 완전히 처음부터 다시 시작 (더 확실한 방법)
      auth.clearAuthState()
      return '/gateway'
    }

    // 일반적인 메뉴 클릭 이동 중 권한 부족이면 현재 페이지 유지
    return false
  }
})

export default router
