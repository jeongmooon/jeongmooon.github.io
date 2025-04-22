<hr />

# 웹페이지
최근 흥미 있게 하고 있는 모바일 게임 **림버스컴퍼니**를 주제로 웹페이지를 만들어 보려고 한다.  
단순히 과제용으로만 웹사이트를 제작하면 재미가 떨어지기 때문에, **게임 컨셉과 접목한 기능**을 구현하는 목표로 진행한다.  

---

## 주요 기능 구상

1. ~~**로그인:** 사용자 로그인을 구현합니다.(1주차)~~ 완료
2. ~~**회원가입:** 회원가입 시 **게임 코드 입력** 기능을 추가합니다.(2주차)~~ 완료
3. **마이페이지:** 보유 캐릭터를 확인하거나 체크할 수 있습니다.(2주차)
4. ==**메인화면:** 보유 캐릭터를 확인하고, **도감 작성 상태**를 보여줍니다.(2주차)==

---

## 환경 설정

### 사용 기술
- **Backend:** SpringBoot
- **Database:** MySQL
- **Frontend:** JSP

### 세부 환경 설정

#### gralde dependencies 설정
```build.gradle.dependencies
	// ✅ Spring Boot 웹 애플리케이션 설정을 위한 기본 의존성
	implementation 'org.springframework.boot:spring-boot-starter-web'

	// ✅ Lombok 라이브러리 - 코드의 Getter, Setter, Constructor 등을 자동 생성
	compileOnly 'org.projectlombok:lombok'       // 컴파일 시점에만 포함
	annotationProcessor 'org.projectlombok:lombok' // Lombok 애노테이션 처리를 위한 추가 설정

	// ✅ Spring Boot 개발 편의를 위한 DevTools (자동 리스타트 등)
	developmentOnly 'org.springframework.boot:spring-boot-devtools'

	// ✅ Spring Boot Test를 위한 기본 테스트 의존성
	testImplementation 'org.springframework.boot:spring-boot-starter-test'

	// ✅ JUnit 플랫폼 런처 - 테스트 실행에 필요
	testRuntimeOnly 'org.junit.platform:junit-platform-launcher'

	// ✅ MySQL 데이터베이스 연결을 위한 JDBC 드라이버
	implementation 'mysql:mysql-connector-java:8.0.33'

	// ✅ JSP 및 JSTL 관련 의존성 (Tomcat Jasper와 JSTL 구현체)
	implementation 'org.apache.tomcat.embed:tomcat-embed-jasper'                // Tomcat Jasper - JSP 파일을 서블릿으로 변환
	implementation 'jakarta.servlet.jsp.jstl:jakarta.servlet.jsp.jstl-api:3.0.0' // JSTL (Jakarta Standard Tag Library) API
	implementation 'org.glassfish.web:jakarta.servlet.jsp.jstl:3.0.1'            // JSTL 구현체 (GlassFish)
```

#### application.properties 설정
```application.properties
# JSP 파일 경로 설정
spring.mvc.view.prefix=/WEB-INF/views/
spring.mvc.view.suffix=.jsp
```

---

## 메인 서버 소스

초기 단계에서는 간단히 구현하기 위해 Controller에서 직접 DB 연결을 호출하도록 설정했다.
나중에 필요하면 Service 및 Repository 계층으로 구조를 분리하여 확장할 계획이다.

### 1.MainController 소스

```java
   @GetMapping("/main")
    public String index(Model model, HttpSession session) throws Exception{
        //String userIdx = session.getAttribute("user") != null ? session.getAttribute("user").toString() : "";
        String userIdx = session.getAttribute("user").toString();
        StringBuilder query = new StringBuilder();

        query.append("SELECT                                                                                    \n");
        query.append("    P.IDX AS PRISONER_IDX,                                                                \n");
        query.append("    P.NAME AS PRISONER_NAME,                                                              \n");
        query.append("    P.ICON AS PRISONER_ICON,                                                              \n");
        query.append("    I.IDX AS PRISONER_IDENTITY_IDX,                                                       \n");
        query.append("    I.NAME AS PRISONER_IDENTITY_NAME,                                                     \n");
        query.append("    I.GRADE AS PRISONER_IDENTITY_GRADE,                                                   \n");
        query.append("    I.MAIN_IMG AS PRISONER_MAIN_IMG,                                                      \n");
        query.append("    CASE                                                                                  \n");
        query.append("        WHEN UI.IDX IS NOT NULL THEN 1  -- 사용자가 해당 데이터 보유 (IS_OWNED = 1)	        \n");
        query.append("        ELSE 0                         -- 사용자가 해당 데이터 미보유 (IS_OWNED = 0)          \n");
        query.append("    END AS IS_OWNED                                                                       \n");
        query.append("FROM                                                                                      \n");
        query.append("    PRISONER P                                                                            \n");
        query.append("LEFT JOIN IDENTITY I                                                                      \n");
        query.append("    ON P.IDX = I.PRISONER_IDX                                                             \n");
        query.append("LEFT JOIN USER_IDENTITY UII                                                               \n");
        query.append("    ON I.IDX = UII.IDENTITY_IDX                                                           \n");
        query.append("LEFT JOIN USER_INFO UI                                                                    \n");
        query.append("    ON UII.USER_IDX = UI.IDX AND UI.IDX = "+userIdx+" -- 사용자의 IDX가 1 (로그인한 사용자)   \n");
        query.append("ORDER BY P.IDX, I.IDX                                                                     \n");

        List<Map<String, Object>> resultList = dbConnection.getList(query.toString());

        long count = resultList.stream()
                .filter(map -> map.containsKey("IS_OWNED") && (int) map.get("IS_OWNED") == 1)  // 필터로 IS_OWNED=1 항목만 남기기
                .count();

        Map<Integer, List<Map<String, Object>>> characterMap = resultList.stream()
                .collect(Collectors.groupingBy(map -> (Integer) map.get("PRISONER_IDX")));

        model.addAttribute("prisonerGuid",count+"/"+resultList.size());
        model.addAttribute("rate",(int) (((double)count/(double)resultList.size())*100));
        model.addAttribute("characterMap", characterMap);
        return "main";
    }
```
- **세션의 USER_IDX:**HttpSession으로 회원 인덱스 가지고옴.
- **쿼리 생성:**
    - **SELECT 값:** 
        - 수감자 인덱스 번호, 수감자 명, 수감자 아이콘, 수감자 인격 인덱스 번호, 수감자 인격 명, 수감자 인격 등급, 수감자 인격 이미지, 회원의 수감자 보유 여부
    - **FROM 테이블:**
        - PRISONER, IDENTITY, USER_IDENTITY, USER_INFO 테이블 사용.
    - **WHERE 조건:**
        - USER_IDX(유저 인덱스) 사용
    - **ORDER BY 조건:**
        - 수감자 인덱스 번호, 인격 인덱스 번호로 정렬

- **조회 값으로 추가 처리:**
    - 도감 달성도 및 도감 달성률 추가
    - 데이터를 Map<Integer, List<Map<String, Object>>> 형태로 재 가공
        - KEY 값은 수감자 인덱스 번호
        - VALUE 값은 수감자 인덱스에 있는 인격


### DBConnection 소스 추가

#### getList()
```java 
    public List<Map<String,Object>> getList(String sql) {

        Connection con = null;
        Statement stmt = null;
        ResultSet rs = null;
        List<Map<String,Object>> resultMapList = new ArrayList<>();

        try {

            Class.forName(JDBC_DRIVER);
            System.out.println("JDBC Driver load Succ");

            //con = DriverManager.getConnection(JDBC_URL, USER, PASSWORD);
            con = DriverManager.getConnection(JDBC_URL, USER, PASSWORD);
            System.out.println("DB Connections...");
            stmt = con.createStatement();

            String selectSQL = sql;//"SELECT * FROM test_table";
            rs = stmt.executeQuery(selectSQL);

            ResultSetMetaData metaData = rs.getMetaData();
            int columnCount = metaData.getColumnCount();

            while (rs.next()) {
                Map<String,Object> resultMap = new HashMap<>();
                // 각 행에서 모든 컬럼 출력
                for (int i = 1; i <= columnCount; i++) { // 컬럼 인덱스는 1부터 시작
                    String columnLabel = metaData.getColumnLabel(i);
                    Object columnValue = rs.getObject(i); // 컬럼 값 가져오기
                    resultMap.put(columnLabel, columnValue);
                }
                resultMapList.add(resultMap);
            }

            stmt.close();
            con.close();

        } catch (SQLException se) {
            se.printStackTrace();
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            try {
                if (stmt != null) {
                    stmt.close();
                }
            } catch (SQLException se) {
                se.printStackTrace();
            }
            try {
                if (con != null) {
                    con.close();
                }
            } catch (SQLException se) {
                se.printStackTrace();
            }
        }
        return resultMapList;
    }
```
- **List<Map<String,Object>> 반환**: 단건 처리와 다르게 List 객체로 반환.

### 3.동작 요약

메인페이지 요청 시 전체 흐름.

- **클라리언트로 부터 데이터 수신:**
    - 세션 데이터(HttpSession)를 사용.
- **DB 조회:**
    - 수감자 인덱스 번호
    - 수감자 명, 수감자 아이콘-
    - 수감자 인격 인덱스 번호
    - 수감자 인격 명
    - 수감자 인격 등급
    - 수감자 인격 이미지
    - 회원의 수감자 보유 여부

- **데이터 가공 후 전달:**
    - 도감 달성률
    - DB 조회 값

---

## 메인페이지 화면 생성

### 1. 메인페이지 UI

#### 기본 화면 UI
![메인 화면](https://jeongmooon.github.io/img/report/main/main.png)
- 회원의 캐릭터 도감 달성률 및 수감자 카드 확인.
- 수감자 카드의 정보
    - 수감자 별로 분류
        - 수감자의 인격 이미지
        - 수감자 인격 명
        - 수감자 인격 등급
        - 회원의 해당 인격 보유 여부(보유 시 컬러/미보유 시 흑백)

### 2. 기본 화면 소스

#### 기본 화면 HTML 소스
```html java
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Limbus Character Codex</title>

  <!-- Tailwind & 공통 스타일 -->
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="/static/css/style.css" />
  <script src="/js/script.js"></script>
</head>
<body class="p-8">

    <h1 class="text-4xl mb-8 text-yellow-400">📖 캐릭터 도감</h1>
    <div class="px-6">
      <!-- 도감 달성률 바 -->
      <div class="mb-8">
        <p class="text-yellow-300 text-lg mb-2">
          📘 ${userId}님의 도감 달성률
          <span class="text-xs text-gray-300 mt-1">(${prisonerGuid}) ${rate}%</span>
        </p>
        <div class="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
          <div class="h-full bg-yellow-400" style="width: ${rate}%"></div>
        </div>
      </div>

      <!-- 캐릭터 반복 -->
      <c:forEach var="entry" items="${characterMap}">
        <c:set var="identities" value="${entry.value}" />
        <c:set var="character" value="${identities[0]}" />

        <!-- 캐릭터 이름 -->
        <h2 class="text-2xl text-yellow-300 font-bold mt-10 mb-4">${character.PRISONER_NAME}</h2>

        <!-- 인격 카드 그리드 -->
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          <c:forEach var="identity" items="${identities}">
            <div class="bg-zinc-900 border border-gray-700 rounded-lg p-4 shadow-md">
              <img src="/image/prisoner/${identity.PRISONER_IDX}/${identity.PRISONER_MAIN_IMG}.webp"
                   alt="Identity Image"
                   class="rounded-md mb-3 ${identity.IS_OWNED == 0 ? 'grayscale' : ''}" />

              <h3 class="text-orange-300 font-semibold text-sm mb-1">${identity.PRISONER_IDENTITY_NAME}</h3>

              <p class="text-xs text-gray-300 mb-1">
                보유 상태:
                <c:choose>
                  <c:when test="${identity.IS_OWNED == 1}">
                    <span class="text-green-400">✅ 보유</span>
                  </c:when>
                  <c:otherwise>
                    <span class="text-red-500">❌ 미보유</span>
                  </c:otherwise>
                </c:choose>
              </p>

              <p class="text-xs text-gray-400">등급: ${identity.PRISONER_IDENTITY_GRADE}</p>
              <p class="text-xs text-gray-400">인격 ID: ${identity.PRISONER_IDENTITY_IDX}</p>
            </div>
          </c:forEach>
        </div>
      </c:forEach>
    </div>
</body>
</html>

```
- 받아온 값(인격 데이터 List)을 c태그의 for문을 사용
- **보유 시:**
    - 이미지 색상 컬러
    - 문구 ✅ 보유
- **미보유 시:**
    - 이미지 색상 흑백
    - 문구 ❌ 미보유

#### 자바스크립트

현재 없음
후에 캐릭터 카드 클릭 이벤트, 인격별 키워드 정리 기능 추가 예정

---

## 결론

<hr />