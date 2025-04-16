<hr />


# 웹페이지
최근 흥미 있게 하고 있는 모바일 게임 **림버스컴퍼니**를 주제로 웹페이지를 만들어 보려고 한다.  
단순히 과제용으로만 웹사이트를 제작하면 재미가 떨어지기 때문에, **게임 컨셉과 접목한 기능**을 구현하는 목표로 진행한다.  

---

## 주요 기능 구상

1. ==**로그인:** 사용자 로그인을 구현합니다.(1주차)==
2. **회원가입:** 회원가입 시 **게임 코드 입력** 기능을 추가합니다.(2주차)
3. **마이페이지:** 보유 캐릭터를 확인하거나 체크할 수 있습니다.(2주차)
4. **메인화면:** 보유 캐릭터를 확인하고, **도감 작성 상태**를 보여줍니다.(2주차)

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

## 로그인 서버 소스

초기 단계에서는 간단히 구현하기 위해 Controller에서 직접 DB 연결을 호출하도록 설정했다.
나중에 필요하면 Service 및 Repository 계층으로 구조를 분리하여 확장할 계획이다.

#### DB 연결 방식
- MyBatis나 JPA 대신, 초기에 사용했던 **DriverManager(java.sql 패키지)**를 활용해 DB 연결을 구현.
- 반복되는 DB 연결 코드를 줄이기 위해 DBConnection.java 클래스를 구현하여 사용.

### MainController 소스
```MainController.java
    @PostMapping("/login")
    public String authenticateUser(@RequestParam("userId") String userId, @RequestParam("pass") String pass, Model model, HttpSession session) throws Exception{
        Map<String, Object> result = dbConnection.get("SELECT * FROM USER_INFO WHERE USER_ID = '"+userId + "' AND PASS = '"+pass+"'");

        if(result.get("USER_ID") == null) {
            model.addAttribute("result", result.get("USER_ID") == null);
            model.addAttribute("userId",userId);
            return "auth/login";
        } else {
            session.setAttribute("user", result.get("IDX"));
            session.setAttribute("userId", result.get("USER_ID"));
            return "redirect:/main";
        }
    }
```
- 동작 설명:
    - **아이디와 비밀번호 검증**: DB에서 userId와 pass를 조회
    - **로그인 실패 처리**:
        - USER_ID가 없는 경우, Model 객체에 로그인 실패 결과(result = true)와 userId를 저장한 뒤 로그인 페이지로 이동
    - **로그인 성공 처리**:
        - 세션(HttpSession)에 **사용자 PK(IDX)**와 **사용자 ID(USER_ID)**를 설정한 뒤, /main 페이지로 리다이렉션 

### DBConnection 소스
```DBConnection.java get()
    public Map<String,Object> get(String sql) {
        Connection con = null;
        Statement stmt = null;
        ResultSet rs = null;
        Map<String,Object> resultMap = new HashMap<>();

        try {
            Class.forName(JDBC_DRIVER);
            System.out.println("JDBC Driver load Succ");

            con = DriverManager.getConnection(JDBC_URL, USER, PASSWORD);
            System.out.println("DB Connections...");
            stmt = con.createStatement();

            String selectSQL = sql;//"SELECT * FROM test_table";
            rs = stmt.executeQuery(selectSQL);

            ResultSetMetaData metaData = rs.getMetaData();
            int columnCount = metaData.getColumnCount();

            while (rs.next()) {
                // 각 행에서 모든 컬럼 출력
                for (int i = 1; i <= columnCount; i++) {
                    String columnName = metaData.getColumnLabel(i);
                    Object columnValue = rs.getObject(i);
                    resultMap.put(columnName, columnValue);
                }
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
        return resultMap;
    }
```
- **Map 형태 반환**: 컬럼의 라벨명(Column Label)을 키 값으로 활용하여 데이터를 반환

---

## 로그인 화면 생성

#### 로그인 UI
![로그인 화면](https://jeongmooon.github.io/img/report/login/loginMain.png)
- **아이디와 비밀번호 입력**하여 로그인 진행한다. 

#### 로그인 실패 화면
![로그인 실패](https://jeongmooon.github.io/img/report/login/loginFail.png)
- 로그인 실패 시 **"입력정보가 올바르지 않습니다."**라는 팝업이 표시됩니다.
- 사용자에게 아이디 혹은 비밀번호가 틀렸다고 상세히 알려주는거도 공격자에게 힌트가 되기 때문

### 로그인 화면 소스
```login.jsp
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %> <!--jsp 태그 라이브러리 설정-->

<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>login</title>

  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="/static/css/style.css" />
  <script src="/static/js/script.js"></script>
</head>
<body class="flex items-center justify-center min-h-screen">

  <div class="login-box w-[380px] p-8 rounded-xl text-center">
    <h1 class="text-3xl text-yellow-300 mb-6 tracking-widest">NETWORK LOGIN</h1>

    <form class="space-y-5" method="POST" action="/login">
      <div>
        <label class="block mb-1 text-sm text-gray-400 text-left">관리자 ID</label>
        <input type="text" class="input-field w-full py-2 px-4 rounded-md" placeholder="Enter your ID" name="userId" value="${userId}">
      </div>
      <div>
        <label class="block mb-1 text-sm text-gray-400 text-left">비밀번호</label>
        <div class="relative">
          <input type="password" id="password" name="pass" class="input-field w-full py-2 px-4 rounded-md" placeholder="Enter your password">
          <button type="button" onclick="togglePassword('password')" class="absolute right-3 top-2 text-sm text-gray-400">👁</button>
        </div>
      </div>

      <button type="submit" class="glow-btn w-full py-3 mt-4 rounded-md">시스템 접속</button>
      <button type="button" class="glow-btn w-full py-3 mt-4 rounded-md" onclick="location.href='/register'">회원가입</button>

      <p class="text-xs text-gray-500 mt-3">ⓒ Co. - jeongmooon.</p>
    </form>

    <!-- 에러 알림용 히든 값 -->
    <input type="hidden" id="error-flag" value="${result}" />
  </div>

</body>
</html>
```
- 비동기 형태로 아이디 비밀번호를 체크하고 있지 않으니 로그인 실패 시 로그인 페이지 재호출 하고 팝업창을 위한 값을 input태그에 설정

```script.js
// 비밀번호 보기 토글
function togglePassword(inputId) {
  const pwInput = document.getElementById(inputId);
  pwInput.type = pwInput.type === "password" ? "text" : "password";
}

// 오류 메시지 알림
function showError(message) {
  alert(message);
}

// 페이지 준비 시 초기 실행 (예: 에러 메시지 자동 실행)
document.addEventListener("DOMContentLoaded", () => {
  const errorFlag = document.getElementById("error-flag");
  if (errorFlag && errorFlag.value === "true") {
    showError("입력정보가 올바르지 않습니다.");
  }
});
```
- **비밀번호 보기 토글:**
    - 사용자가 비밀번호 입력값을 확인할 수 있도록 <눈 모양 버튼>으로 구현
- **에러 메시지 처리:**
    - 로그인 실패 시, 페이지가 재호출되면 error-flag 값을 통해 오류 메시지가 팝업으로 출력

---

## 결론

- 간단한 **로그인 기능**을 구현하면서 **DriverManager** 패턴으로 DB 연결을 제어했다.
- 추후 필요하면 구조를 확장하여 **Service 계층**과 **Repository 계층**으로 리팩토링할 계획이다.
- 사용자의 **보안 보호**와 **사용자 경험**을 개선하기 위해 비밀번호 보기 토글과 에러 메시지 처리를 추가했다.
- **PreparedStatement** 차후에 나올거 같아서 현재는 적용하지 않았다.


<hr />