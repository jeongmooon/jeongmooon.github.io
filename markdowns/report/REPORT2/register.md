<hr />

# 웹페이지
최근 흥미 있게 하고 있는 모바일 게임 **림버스컴퍼니**를 주제로 웹페이지를 만들어 보려고 한다.  
단순히 과제용으로만 웹사이트를 제작하면 재미가 떨어지기 때문에, **게임 컨셉과 접목한 기능**을 구현하는 목표로 진행한다.  

---

## 주요 기능 구상

1. **로그인:** 사용자 로그인을 구현합니다.(1주차)
2. ==**회원가입:** 회원가입 시 **게임 코드 입력** 기능을 추가합니다.(2주차)==
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

## 회원가입 서버 소스

초기 단계에서는 간단히 구현하기 위해 Controller에서 직접 DB 연결을 호출하도록 설정했다.
나중에 필요하면 Service 및 Repository 계층으로 구조를 분리하여 확장할 계획이다.

### 1.AuthController 소스

```AuthController.java
    @PostMapping("/register")
    public String registerUser(@Valid UserCreateRequest userCreateRequest, Model model, HttpSession session) throws Exception{
        String message = userCreateRequestValidator.validate(userCreateRequest);

        if (message != null) {
            model.addAttribute("userCreateRequest", userCreateRequest);
            model.addAttribute("result", message);
            return "auth/register";
        }

        Map<String, Object> result = dbConnection.get("SELECT * FROM USER_INFO WHERE USER_ID = '"+userCreateRequest.getUserId() + "'");

        if(result.get("USER_ID") != null){
            model.addAttribute("userCreateRequest", userCreateRequest);
            message = "중복된 아이디가 존재합니다.";
            model.addAttribute("result",message);
            return "auth/register";
        }
        int resultInt = dbConnection.insert("INSERT INTO USER_INFO(USER_ID, PASS,GAME_CODE) VALUES('"+userCreateRequest.getUserId() + "', '"+userCreateRequest.getPass()+"', '"+userCreateRequest.getLimbusGameCode()+"')");

        if(resultInt > 0){
            result = dbConnection.get("SELECT * FROM USER_INFO WHERE USER_ID = '"+userCreateRequest.getUserId() + "'");
            message = "정상 가입 되었습니다.";
            session.setAttribute("user", result.get("IDX"));
            session.setAttribute("userId", result.get("USER_ID"));
            model.addAttribute("result",message);
            return "redirect:/main";
        }

        return "auth/register";
    }
```
- **파라미터 검증:**UserCreateRequestValidator로 아이디, 비밀번호, 게임 코드 값을 검증.
    - 검증 실패 시, 오류 메시지와 함께 회원가입 페이지로 리턴.
- **아이디 중복 체크:**DB에서 입력받은 아이디가 이미 존재하는지 확인.
    - 중복된 아이디가 있을 경우, 회원가입 페이지로 리턴.
- **DB 삽입:**검증된 데이터를 DB에 삽입.
    - 삽입 성공 시, 세션에 유저 정보(PK와 아이디)를 저장하고 메인 페이지로 이동.
- **회원가입 실패 처리:**데이터 삽입 실패 시, 회원가입 페이지로 리턴.

### 2.UserCreateRequestValidator

UserCreateRequestValidator 클래스는 파라미터 검증을 수행.
회원가입 요청에서 입력된 데이터를 아래 규칙에 맞게 검사하고, 문제가 발생 시 에러 메시지를 반환.

```UserCreateRequestValidator.java
    public String validate(UserCreateRequest request) {
        Map<String, Supplier<String>> fields = Map.of(
                "아이디", request::getUserId,
                "비밀번호", request::getPass,
                "게임 코드", request::getLimbusGameCode
        );

        Pattern koreanPattern = Pattern.compile("[ㄱ-ㅎㅏ-ㅣ가-힣]");

        for (Map.Entry<String, Supplier<String>> entry : fields.entrySet()) {
            String label = entry.getKey();
            String value = entry.getValue().get();

            // 빈값 체크
            if (value.isEmpty()) {
                return label + "를 입력하세요.";
            }

            // 40자 넘는지 체크
            if (value.length() > 40) {
                return label + "는 40자 이하로 입력해주세요.";
            }

            // 아이디 한글 포함 여부만 검사
            if (label.equals("아이디") && koreanPattern.matcher(value).find()) {
                return "아이디에는 한글을 사용할 수 없습니다.";
            }
        }
```
#### 유효성 검증 규칙
- **빈 값 검증:**
    - "아이디", "비밀번호", "게임 코드"가 비어 있는 경우: "<필드명>를 입력하세요."라는 에러 메시지 반환.
- **길이 제한 검증:**
    - 각 값이 **40자를 초과**할 경우: "<필드명>는 40자 이하로 입력해주세요."라는 에러 메시지 반환.
- **아이디 한글 포함 여부 검증:**
    - "아이디" 필드에 **한글이 포함된 경우:** "아이디에는 한글을 사용할 수 없습니다."라는 에러 메시지 반환.
- **모든 검증 통과 시:**
    - null이 반환되며 데이터는 유효.

### DBConnection 소스 추가
```DBConnection.java insert()
    public int insert(String sql) {
        Connection con = null;
        Statement stmt = null;
        int result = 0;

        try {

            Class.forName(JDBC_DRIVER);
            System.out.println("JDBC Driver load Succ");

            con = DriverManager.getConnection(JDBC_URL, USER, PASSWORD);
            System.out.println("DB Connections...");
            stmt = con.createStatement();

            String selectSQL = sql;//"SELECT * FROM test_table";
            result = stmt.executeUpdate(sql);

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
        return result;
    }
```
- **int 형태 반환**: insert는 select와 다르게 executeUpdate()메서드를 사용해야해서 insert용 메서드 추가했다.
- 성공한다면 1이상의 값이 리턴된다.

### 3.동작 요약

회원가입 요청 시 전체 흐름.

- **클라리언트로 부터 데이터 수신:**
    - 사용자 입력 데이터(UserCreateRequest)를 컨트롤러에서 수신.
- **유효성 검증:**
    - Validator 클래스를 사용하여 데이터를 검증:
        - 빈 값 체크
        - 최대 길이 초과 여부 체크
        - 아이디 한글 사용 여부 체크
    - 검증 실패 시, 회원가입 페이지로 이동 및 오류 메시지 전달.
- **DB 중복 체크 및 삽입:**
    - 입력된 아이디가 DB에 이미 존재하는지 확인.
    - 중복된 아이디가 없는 경우, DB에 삽입 실행.
- **성공 처리:**
    - 회원가입 성공 시, 세션에 유저 정보를 저장하고 메인 페이지로 리다이렉트.
- **실패 처리:**
    - 검증 실패, 아이디 중복, 데이터 삽입 실패 등 모든 상황에 대해 적절한 오류 메시지를 사용자에게 전달.


---

## 회원가입 화면 생성

### 1. 회원가입 UI

#### 기본 화면 UI
![회원가입 화면](https://jeongmooon.github.io/img/report/register/registerMain.png)
- **아이디**, **비밀번호**, **비밀번호 확인**, **게임 코드** 입력하여 회원가입 진행한다. 

### 2. 회원가입 실패 UX/UI

#### (1) **빈 값이 있을 때**
![회원가입 실패 화면](https://jeongmooon.github.io/img/report/register/registerFail.png)
- 빈 값이 존재하여 회원가입 실패 시 **"~~~를 입력하세요."**라는 팝업이 표시됩니다.

#### (2) **아이디에 한글이 포함될 때**
![회원가입 실패 화면](https://jeongmooon.github.io/img/report/register/registerFailHangeul.png)
- 아이디에 한글이 존재하여 회원가입 실패 시 **"아이디에는 한글을 사용할 수 없습니다."**라는 팝업이 표시됩니다.

#### (3) **값이 40글자를 초과했을 때**
![회원가입 실패 화면](https://jeongmooon.github.io/img/report/register/registerFailLength.png)
- 값이 40글자가 초과하여 회원가입 실패 시 **"~~~는 40자 이하로 입력해주세요."**라는 팝업이 표시됩니다.

### 클라이언트 및 서버 체크
- 입력 값 검증은 **클라이언트와 서버 모두**에서 진행.
- 클라이언트에서 JS를 우회하는 방법으로 악의적인 시도를 할 수 있기 때문에, **서버 단에서의 검증**을 반드시 포함 해야함.

### 3. 회원가입 화면 소스

#### (1) 회원가입 HTML 화면
```register.jsp
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>회원가입</title>

  <!-- Tailwind 및 공통 스타일 -->
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="/static/css/style.css" />
  <script src="/static/js/register.js"></script>
</head>
<body class="flex items-center justify-center min-h-screen">

  <div class="login-box w-[420px] p-8 rounded-xl text-center">
    <h1 class="text-3xl text-yellow-300 mb-6 tracking-widest">회원가입</h1>

    <form class="space-y-5" method="POST" action="/register">
      <div>
        <label class="block mb-1 text-sm text-gray-400 text-left">관리자 ID</label>
        <input type="text" class="input-field w-full py-2 px-4 rounded-md" id="userId" name="userId" placeholder="아이디 입력" value="${userCreateRequest.userId}" />
      </div>

      <div>
        <label class="block mb-1 text-sm text-gray-400 text-left">비밀번호</label>
        <div class="relative">
          <input type="password" id="password" class="input-field w-full py-2 px-4 rounded-md" name="pass" placeholder="비밀번호 입력" />
          <button type="button" onclick="togglePassword('password')" class="absolute right-3 top-2 text-sm text-gray-400">👁</button>
        </div>
      </div>

      <div>
        <label class="block mb-1 text-sm text-gray-400 text-left">비밀번호 확인</label>
        <div class="relative">
          <input type="password" id="confirmPassword" class="input-field w-full py-2 px-4 rounded-md" name="confirmPass" placeholder="비밀번호 재입력" />
          <button type="button" onclick="togglePassword('confirmPassword')" class="absolute right-3 top-2 text-sm text-gray-400">👁</button>
        </div>
      </div>

      <div>
        <label class="block mb-1 text-sm text-gray-400 text-left">게임 코드</label>
        <input type="text" class="input-field w-full py-2 px-4 rounded-md" id="limbusGameCode" name="limbusGameCode" placeholder="sdfr4en" value="${userCreateRequest.limbusGameCode}" />
      </div>

      <button type="submit" class="glow-btn w-full py-3 mt-4 rounded-md">가입하기</button>
      <button type="button" class="glow-btn w-full py-3 mt-4 rounded-md" onclick="location.href='/login'">로그인으로</button>

      <p class="text-xs text-gray-500 mt-3">ⓒ Limbus Co. - 모든 권한 보유.</p>
    </form>
  </div>

    <!-- 알림용 히든 값 -->
    <input type="hidden" id="error-flag" value="${result}" />
</body>
</html>
```
- 비동기 형태로 validate를 체크하고 있지 않으니 회원가입 실패 시 회원가입 페이지 재호출 하고 팝업창을 위한 값을 input태그에 설정

#### (2) 자바스크립트 검증 로직

회원가입 로직에는 기본적인 입력 **검증 유효성 검사**와 **비밀 번호 보기 기능** 등이 포함됩니다.

#### **주요 기능:**

- **비밀번호 보기 토글:**
    - 사용자가 비밀번호 입력값을 확인할 수 있도록 <눈 모양 버튼>으로 구현
- **에러 메시지 처리:**
    - 회원가입 실패 시, 페이지가 재호출되면 error-flag 값을 통해 오류 메시지가 팝업으로 출력
- **validateField 함수**를 이용해서 빈 값 체크, 길이 제한, 아이디 한글 체크 한번에 처리
- **form** 제출 시 모든 유효성 검사를 이 함수로 처리하고, 오류가 생길 시 **alert 함수**로 메세지 표시
- **비밀번호 일치 여부**는 별도로 체크

```register.js
function togglePassword(id) {
    const field = document.getElementById(id);
    if (field.type === 'password') {
        field.type = 'text';
    } else {
        field.type = 'password';
    }
}

// 오류 메시지 알림
function showError(message) {
    alert(message);
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');

    const validateField = (value, fieldName, maxLength = 40, isKorean = false) => {
        if (value === '') {
            return `${fieldName}를 입력하세요.`;
        }
        if (value.length > maxLength) {
            return `${fieldName}는 ${maxLength}자 이하로 입력해주세요.`;
        }
        if (isKorean && /[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(value)) {
            return `${fieldName}에는 한글을 사용할 수 없습니다.`;
        }
        return null;
    };

    if (form) {
        form.addEventListener('submit', function (e) {
            const userId = document.getElementById('userId').value;
            const limbusGameCode = document.getElementById('limbusGameCode').value;
            const pw = document.getElementById('password').value;
            const confirmPw = document.getElementById('confirmPassword')?.value;

            // 유효성 검사
            let message = validateField(userId, '아이디', 40, true) ||
                          validateField(pw, '비밀번호') ||
                          validateField(limbusGameCode, '게임 코드');

            // 비밀번호 확인 체크
            if (!message && confirmPw !== undefined && pw !== confirmPw) {
                message = '비밀번호가 일치하지 않습니다.';
            }

            if (message) {
                alert(message);
                return e.preventDefault();
            }
        });
    }

    const errorFlag = document.getElementById("error-flag");
    if (errorFlag && errorFlag.value !== '') {
        showError(errorFlag.value);
    }
});
```

### 4. 회원가입 로직 요약

#### (1) 클라이언트 측 검증

- **빈 값 검사:**
    - 입력 필드가 비어 있으면 해당 필드명을 포함한 경고 메시지를 표시.
    - 예: "아이디를 입력하세요."
- **최대 글자 수 제한 (40자):**
    - 값이 40자 이상이면 경고 메시지를 표시.
    - 예: "아이디는 40자 이하로 입력해주세요."
- **아이디 한글 포함 여부 검사:**
    - 아이디에 한글이 포함되어 있으면 경고 메시지를 표시.
    - 예: "아이디에는 한글을 사용할 수 없습니다."
- **비밀번호 확인:**
    - 비밀번호와 비밀번호 확인이 다를 경우 경고 메시지 표시.
    - 예: "비밀번호가 일치하지 않습니다."

#### (2) 서버 측 검증

- 클라이언트 검증을 우회할 수 있기 때문에, 서버에서도 **똑같은 검증 로직**을 적용.
- 검증 실패 시, 오류 메시지를 반환하고 클라이언트에서 팝업 창으로 이를 표시.

---

## 결론

- 간단한 **회원가입 기능**을 구현하면서 **DriverManager** 패턴과 **validator** 구현.
- 추후 필요하면 구조를 확장하여 **Service 계층**과 **Repository 계층**으로 리팩토링할 계획이다.
- 사용자의 **보안 보호**와 **사용자 경험**을 개선하기 위해 비밀번호 보기 토글과 에러 메시지 처리를 추가했다.
- **PreparedStatement** 차후에 나올거 같아서 현재는 적용하지 않았다.
- - **비밀번호 암호화:** 비밀번호는 암호화된 상태(SHA-256, bcrypt 등)로 저장해야 하며, 현재 환경에서는 오직 텍스트로 저장되므로 보안 취약점이 존재.

<hr />