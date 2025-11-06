# 모바일 리빌드 안내 (React .js 기준)

## 1. 프로젝트 생성 및 환경 초기화
- `pnpm create next-app reosv-index-mobile --use-pnpm` 실행 후 TypeScript 사용 여부는 `No`로 선택해 JavaScript 템플릿으로 시작한다.
- 기본 디렉터리는 `src/app`, `src/components`, `src/features`, `src/shared` 형태로 유지하고 모바일 전용 레이아웃과 컴포넌트를 이 구조에 맞춰 배치한다.
- ESLint, Prettier, Husky, lint-staged 등을 설정할 때 JavaScript 규칙 세트를 적용하고, 필요 시 `eslint-config-next`의 `core-web-vitals` 규칙을 유지한다.
- UI 문서화를 위해 Storybook 또는 Ladle을 추가하고, `.jsx` 스토리를 기준으로 모바일 컴포넌트를 문서화한다.

## 2. 디자인 토큰 및 전역 스타일 정의
- `src/shared/styles/tokens.js` 파일을 만들고, 색상·타이포그래피·간격 등 디자인 토큰을 JavaScript 객체로 관리한다.
- 전역 스타일은 `GlobalStyle.jsx` 혹은 `app/globals.css`에서 정의하며, `body`에 `background-color`, `font-family` 등을 지정한다.
- 콘텐츠 래퍼는 `max-width: 480px`, `margin: 0 auto`, `padding-inline: 16px`로 고정해 데스크톱 환경에서도 모바일 중앙 정렬이 유지되도록 한다.
- 반응형 유지를 위해 CSS `clamp`와 미리 정의한 spacing scale을 활용하고, 가급적 미디어쿼리를 최소화한다.

## 3. 레이아웃 및 내비게이션 컴포넌트 구현
- `src/components/layout/AppShell.jsx`를 만들어 상단/콘텐츠/하단 영역을 나누고, 전역 Providers(`src/app/providers.jsx`)와 결합한다.
- `src/components/navigation/TopBar.jsx`, `BottomTab.jsx`를 생성해 화면 이동 로직을 모듈화하고, 정렬은 Flex 혹은 CSS Grid로 처리한다.
- 접근성 요소(예: `role`, `aria-*`)를 각 네비게이션 버튼에 지정해 키보드·스크린리더 호환성을 확보한다.
- 라우팅은 `src/app/(routes)/` 혹은 별도의 `router.jsx`에서 관리하고, 라우트별 레이아웃 조합을 명확히 해둔다.

## 4. 홈/요약 섹션 리빌드
- 기존 홈 화면 관련 파일을 `src/features/home`로 이동하고, `HomeScreen.jsx`, `SummaryCard.jsx`, `NoticeBanner.jsx` 등 역할 단위로 나눈다.
- 공통 카드 UI는 `InfoCard.jsx`, `StatBadge.jsx` 형태로 추출하고, Flex/Grid 유틸을 사용해 가로/세로 배치를 구성한다.
- 카드 폭은 기본 `width: 100%`, `max-width: 480px` 조합을 사용해 데스크톱에서도 깨지지 않도록 한다.

## 5. 상세/상호작용 섹션 리빌드
- 상세 화면은 `src/features/detail` 내 `DetailScreen.jsx`, `ActionPanel.jsx`, `InlineForm.jsx` 등으로 구획을 나눈다.
- 입력 컴포넌트는 `src/components/forms`에 `TextField.jsx`, `SegmentControl.jsx`, `DatePicker.jsx` 등으로 공통화하고 상태는 상위에서 제어한다.
- 모달·바텀시트 등 오버레이 컴포넌트는 `src/components/overlays`에 두고, CSS transform과 portal을 활용해 모든 뷰포트에서 동일한 UX를 유지한다.

## 6. 데이터 연동 및 상태 관리
- API 호출 로직은 `src/shared/api/client.js`, `endpoints.js`로 분리하고, React Query 또는 Zustand를 JavaScript 설정으로 구성한다.
- 상태 훅(`useHomeQuery`, `useDetailMutation`)은 `.js` 파일에서 정의하되, 필요하면 JSDoc/PropTypes로 인터페이스를 문서화한다.
- 실시간 갱신이 필요한 경우 `src/shared/services`에 WebSocket/SSE 클라이언트를 구성하고, 구독 해제를 명확히 처리한다.

## 7. 유틸리티 및 접근성 강화
- `src/shared/utils`에 날짜·숫자·문자열 변환 함수를 `.js` 파일로 정리하고, Jest/Testing Library 기반 테스트를 붙인다.
- PropTypes나 JSDoc을 통해 컴포넌트 인터페이스를 문서화하고, 기본 값(`defaultProps`)을 활용해 런타임 안정성을 확보한다.
- 아이콘과 이미지 자산은 SVG 또는 `next/image`의 JavaScript 버전을 사용하고, 불필요한 번들을 줄이도록 최적화한다.

## 8. 테스트, QA, 배포 파이프라인
- 단위 테스트는 `__tests__` 디렉터리에 `.test.jsx` 파일로 구성하고, Storybook/Ladle 스토리를 활용한 비주얼 리그레션을 병행한다.
- E2E 테스트(Cypress, Playwright)는 iPhone SE, iPhone 14 Pro, Pixel 7 해상도를 기준으로 작성하고, 데스크톱 뷰에서도 모바일 UI가 유지되는지 검증한다.
- CI에서는 Lint → Unit Test → Build → Storybook 배포 순으로 파이프라인을 구성해 QA가 미리 결과를 확인할 수 있게 한다.
- 실제 단말 배포(TestFlight, Firebase App Distribution)는 Expo나 Vite Native WebView 패키징 없이도 가능하므로, 빌드 산출물을 QA 팀이 쉽게 받을 수 있게 정리한다.

