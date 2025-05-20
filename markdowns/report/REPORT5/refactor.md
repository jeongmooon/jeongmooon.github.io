# 웹페이지 프로젝트: Limbus Company 기반 웹사이트

최근 흥미 있게 하고 있는 모바일 게임 **림버스컴퍼니**를 주제로 웹페이지를 제작한다. 단순한 과제용 웹사이트가 아닌, **게임 컨셉과 연동되는 기능들을 중심으로 개발**하여 흥미와 몰입감을 높이는 것이 목표다.

---

## 주요 기능 기획

1. **로그인**

   * 사용자 인증 기능을 구현한다. *(1주차 완료)*

2. **회원가입**

   * 게임 내 "초대 코드" 개념을 활용하여 **가입 시 게임 코드 입력**을 요구한다. *(2주차 예정)*

3. **마이페이지**

   * 사용자가 보유한 캐릭터(죄인/인격)를 확인하고, 체크 리스트 형태로 관리할 수 있다. *(2주차 예정)*

4. **메인화면**

   * 보유 캐릭터 도감 상태를 확인할 수 있고, 중앙에는 최신 유튜브 소식을 연동하여 출력한다. *(2주차 예정)*

5. **덱빌딩 페이지**

   * 보유한 인격들을 기반으로 덱을 구성하는 기능을 제공한다.

6. **덱 통계 페이지**

   * 유저들의 덱 구성 데이터를 기반으로 인격들의 사용 통계를 확인할 수 있는 페이지를 제공한다.

7. **인격 관리 페이지 (관리자 전용)**

   * 관리자가 인격 정보를 직접 추가할 수 있도록 별도 페이지를 제공한다.

8. **게시판 기능**

   * 유저들 간 소통이 가능한 커뮤니티 공간을 제공한다.

---

## 환경 구성 및 기술 스택

### 기술 스택

| 계층       | 사용 기술                                 |
| -------- | ------------------------------------- |
| Backend  | Spring Boot (JPA, Validation 포함)      |
| Frontend | Thymeleaf, Tailwind CSS (뷰 스타일링) |
| Database | MySQL (MariaDB 드라이버 사용)               |
| 인증 보안    | JWT, BCrypt                           |
| API 연동   | YouTube API                           |
| 기타 도구    | Jsoup (HTML 파싱), QueryDSL (타입 안전 쿼리)  |

### `build.gradle` 의존성 요약

```gradle
// ✅ Spring Boot 기본
implementation 'org.springframework.boot:spring-boot-starter-web'
implementation 'org.springframework.boot:spring-boot-starter-thymeleaf'
implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
implementation 'org.springframework.boot:spring-boot-starter-validation'

// ✅ DB
runtimeOnly 'org.mariadb.jdbc:mariadb-java-client'

// ✅ 보안 및 인증
implementation 'org.mindrot:jbcrypt:0.3m'
implementation 'io.jsonwebtoken:jjwt-api:0.11.5'
runtimeOnly 'io.jsonwebtoken:jjwt-impl:0.11.5'
runtimeOnly 'io.jsonwebtoken:jjwt-jackson:0.11.5'

// ✅ 크롤링/파싱
implementation 'org.jsoup:jsoup:1.15.4'

// ✅ QueryDSL
implementation 'com.querydsl:querydsl-jpa:5.0.0:jakarta'
annotationProcessor "com.querydsl:querydsl-apt:${dependencyManagement.importedProperties['querydsl.version']}:jakarta"

// ✅ YouTube API
implementation 'com.google.api-client:google-api-client:1.33.0'
implementation 'com.google.oauth-client:google-oauth-client-jetty:1.23.0'
implementation 'com.google.apis:google-api-services-youtube:v3-rev20230816-2.0.0'

// ✅ Jackson(Java 8 날짜 지원)
implementation 'com.fasterxml.jackson.datatype:jackson-datatype-jsr310:2.13.0'

// ✅ 기타
compileOnly 'org.projectlombok:lombok'
annotationProcessor 'org.projectlombok:lombok'
```

---

## 기능별 상세 설계 및 리팩토링 내역

* **로그인 기능**은 `JWT + RefreshToken` 구조로 구현되어, AccessToken이 만료될 경우 RefreshToken으로 재발급된다.
* **JPA**를 사용하여 DB 접근 방식을 전면 리팩토링하였다.
* **메인페이지 리팩토링** 시, 유튜브 영상 및 도감 상태 UI를 정리하고, 캐릭터 도감을 별도로 분리하였다.
* **덱빌딩 기능**은 실제 인게임처럼 인격(캐릭터)들을 선택하고 저장 가능하며, 이를 기반으로 통계 데이터도 추출 가능하다.
* **인격 추가 페이지**는 관리자 권한으로 접근 가능하며, 이미지 업로드 및 인격 속성 관리가 가능하다.
* **게시판 기능**은 html + Tailwind 기반의 UI로 제작되어 유저 간 커뮤니케이션 공간을 제공한다.

---

## 결론

게임 "림버스컴퍼니"를 주제로 한 웹 애플리케이션은 과제나 학습을 넘어서, 실제 게임 컨셉을 반영하여 보다 몰입도 높은 프로젝트로 확장되었다. 기능 별로도 게임 데이터 관리, 커뮤니티 기능, 외부 연동(API, YouTube 등), 보안 적용까지 포함되어 있어 실제 서비스 수준의 구조를 지향하고 있다.
