// 오늘 날짜 yyyy-mm-dd
export function getToday() {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0'); // 0-based
  const day = String(today.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function getDateFormatter(dateInput) {
  const date = (typeof dateInput === 'string') ? new Date(dateInput) : dateInput;

  if (!(date instanceof Date) || isNaN(date.getTime())) return '';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}년 ${month}월 ${day}일`;
}

// 올해 년도
export function getYear() {
  const today = new Date();
  const year = today.getFullYear();
  return year
}

export const getLabel = (options, val) => {
  const target = options.find((item) => item.value === val)
  return target ? target.label : val
}

// 콤마
export const formatComma = (value, suffix = '') => {
  if (value === null || value === undefined || value === '' || isNaN(value)) {
    return `0${suffix}`;
  }

  const formatter = new Intl.NumberFormat('ko-KR');
  return `${formatter.format(value)}${suffix}`;
};

// 기본급
export const BASIC_OPTIONS = [
  { value: 'INITIAL', label: '신규 입사' },
  { value: 'REGULAR', label: '정기 인상' },
  { value: 'PROMOTION', label: '승진 인상' },
  { value: 'ADJUSTMENT', label: '특별 조정' },
  /*{ value: 'RETROACTIVE', label: '소급 수정' },*/
  { value: 'REDUCTION', label: '임금 삭감' },
  { value: 'FREEZE', label: '급여 동결' },
]

// 변동 보상
export const COMPENSATION_OPTIONS = [
  { label: '성과금', value: 'PERFORMANCE' },
  { label: '상여금', value: 'BONUS' },
  { label: '인센티브', value: 'INCENTIVE' },
  { label: '기타 수당', value: 'ALLOWANCE' },
]

export const APPROVAL_OPTIONS = [
  { label: '임시저장', value: 'DRAFT' },
  { label: '결재 진행중', value: 'IN_PROGRESS' },
  { label: '결재 승인', value: 'APPROVED' },
  { label: '반려', value: 'REJECTED' },
  { label: '회수', value: 'WITHDRAWN' },
]

