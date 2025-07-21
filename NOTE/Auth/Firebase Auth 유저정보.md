유저 정보를 삭제하려면 파이어베이스 펑션 기능이 필요하여 예뮬레이터를 실행해야합니다.

.env.development.local 에 REACT_APP_USE_EMULATOR=true 로 설정
functions 디렉터리로 이동해 npm run build
프로젝트 루트에서 firebase init emulators (한 번만 설정)
루트에서 npm run emulate (또는 firebase emulators:start --only functions,firestore,auth)
(에뮬레이터에 데이터가 없으므로) 루트에서 npm run seed-admin 으로 admin 계정 시드