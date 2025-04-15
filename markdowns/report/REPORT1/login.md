<hr />


# 웹페이지
그냥 과제용으로만 웹페이지를 만들면 재미가 떨어지니 최근 흥미있게 하고있는 모바일 게임 림버스컴퍼니의 게임과 관련지어 웹페이지를 만들어 보려고 한다.
로그인 -> 회원가입 -> 회원가입 시 게임코드 입력 -> 마이페이지에서 보유 캐릭터 체크 -> 메인화면에서는 보유 캐릭 확인 및 도감작 확인
으로 대략적으로 구상중

## 환경 설정
SpringBoot/MySql/jsp 사용

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
spring.mvc.view.prefix=/WEB-INF/views/
spring.mvc.view.suffix=.jsp
```

---

## 로그인 서버 소스

```
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

## 로그인 화면 생성

![로그인 화면](https://jeongmooon.github.io/img/report/login/loginMain.png)

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

<hr />