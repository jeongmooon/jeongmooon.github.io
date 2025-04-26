<hr />

# 여러개의 로그인 방식 구현
서로 다른 로그인 방식을 구현한다.<br>
과제로는 총 4가지 였지만 추가적으로 몇개를 늘렸다. 5번 이후로는 추가적인 구현 사항이다.<br>

## Login-Method
1. 식별/인증 동시
2. 식별/인증 분리
3. 식별/해시인증 동시
4. 식별/해시인증 분리
5. 식별/bcryte 해시인증 동시
6. 식별/bcryte 해시인증 분리
7. 식별/인증 개행 동시
8. 식별/인증 파라미터 개행 동시
9. 식별/해시인증 개행 동시
10. 식별/bcryte 해시인증 파라미터 개행 동시 후에 JWT
---

## 주요 기능 구상

1. ==**로그인:** 사용자 로그인을 구현합니다.(1주차) ~~완료~~ -> `develop`==
2. ~~**회원가입:** 회원가입 시 **게임 코드 입력** 기능을 추가합니다.(2주차)~~
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

    // ✅ 암호화 라이브러리
	implementation group: 'org.mindrot', name: 'jbcrypt', version: '0.3m' // gradle

    // ✅ JWT 라이브러리
	implementation 'io.jsonwebtoken:jjwt-api:0.11.5'
	runtimeOnly 'io.jsonwebtoken:jjwt-impl:0.11.5'
	runtimeOnly 'io.jsonwebtoken:jjwt-jackson:0.11.5'
```

#### application.properties 설정
```application.properties
# JSP 파일 경로 설정
spring.mvc.view.prefix=/WEB-INF/views/
spring.mvc.view.suffix=.jsp
```

---

## 테스트용 테이블 생성
#### USER_TEST_INFO 테이블 생성
- ID: 아이디
- PASS: 평문/암호화 전부 저장 예정
- SALT: bcryte 저장 시 활용
```sql
CREATE TABLE USER_TEST_INFO (
	USER_ID VARCHAR(20),
	PASS VARCHAR(100),
	SALT VARCHAR(16),
	PRIMARY KEY (USER_ID)
);
```

---

## Login-Method 소스
> **Login 규칙:** 
>   - HTTP Method는 `POST`로 할 것
>   - `preparedstatement`는 사용하지 않았음
>       - 사용한다면 같은 로직이 2배로 늘어나기 때문
>   - `HashUtil`에는 해쉬화와 암호화가 구현되어 있다.
>   - `JwtUtil`에는 Jwt 토큰을 만드는게 구현되어 있다.
>   - `HttpUtil`에는 cookie를 저장하는 로직이 구현되어 있다.

---

### 1. 식별/인증 동시
> ID,PASS가 평문으로 동시에 체크하는 로직

```java
    @PostMapping("/test/login-auth-all")
    public String loginIdAuthAll(@RequestParam("userId") String userId, @RequestParam("pass") String pass, Model model, HttpSession session, HttpServletResponse res){
        String query = "SELECT COUNT(1) cnt FROM USER_TEST_INFO WHERE USER_ID ='"+userId+"' AND PASS = '"+pass+"'";
        Map<String,Object> result = dbConnection.get(query);
        if(result.get("cnt") != null && Integer.parseInt(result.get("cnt").toString()) == 1){
            HttpUtil.setCookie(res, "userId", userId, 60*2);
            model.addAttribute("message","성공");
        } else {
            model.addAttribute("message","실패");
        }
        return "3week/login";
    }
```
#### 설명
> `parameter`로 받은 userId와 pass로 query를 동적으로 생성하여 `USER_TEST_INFO`테이블에서 조회함<br>
> 조회 성공 시에는 `cookie`에 userId를 넣어서 저장함<br>

---

### 2. 식별/인증 분리
> ID,PASS가 평문으로 userId를 통해 식별 후에 조회된 PASS와 pass로 인증을 분리하여 체크하는 로직

```java
    @PostMapping("/test/login-auth-divide")
    public String loginIdAuthDivide(@RequestParam("userId") String userId, @RequestParam("pass") String pass, Model model, HttpSession session){
        String query = "SELECT PASS FROM USER_TEST_INFO WHERE USER_ID ='"+userId+"'";
        Map<String,Object> result = dbConnection.get(query);
        if(result.get("PASS") != null){
            if(pass.equals(result.get("PASS").toString())){
                HttpUtil.setCookie(res, "userId", userId, 60*2);
                model.addAttribute("message","성공");
            }   else {
                model.addAttribute("message","실패");
            }
        }
        return "3week/login";
    }
```
#### 설명
> `parameter`로 받은 userId로 query를 동적으로 생성하여 `USER_TEST_INFO`테이블에서 PASS 조회함<br>
> 조회 후에 PASS 값으로 `parameter`에서 넘어온 pass와 비교하여 같을 시에 로그인 성공<br>

---

### 3. 식별/해시인증 동시
> ID가 평문으로 userId를 통해 식별 후에 조회된 PASS와 해쉬화된 pass로 인증을 분리하여 체크하는 로직

```java
    @PostMapping("/test/login-auth-all-hash")
    public String loginIdAuthAllHash(@RequestParam("userId") String userId, @RequestParam("pass") String pass, Model model, HttpSession session){
        String query = "SELECT COUNT(1) cnt FROM USER_TEST_INFO WHERE USER_ID ='"+userId+"' AND PASS = '"+HashUtil.getSha256(pass)+"'";
        Map<String,Object> result = dbConnection.get(query);
        if(result.get("cnt") != null && Integer.parseInt(result.get("cnt").toString()) == 1){
            HttpUtil.setCookie(res, "userId", userId, 60*2);
            model.addAttribute("message","성공");
        } else {
            model.addAttribute("message","실패");
        }
        return "3week/login";
    }
```
#### 설명
> `parameter`로 받은 pass를 `HashUtil`을 통해 SHA256 해쉬화를 진행 후에 userId와 해쉬화된 pass로 query를 동적으로 생성하여 `USER_TEST_INFO`테이블에서 조회함<br>
> 조회 성공 시에는 `cookie`에 userId를 넣어서 저장함<br>

---

### 4. 식별/해시인증 분리
> ID,PASS가 평문으로 userId를 통해 식별 후에 조회된 PASS와 SHA256 해시화 된 pass로 인증을 분리하여 체크하는 로직

```java
    @PostMapping("/test/login-auth-divide-hash")
    public String loginIdAuthDivideHash(@RequestParam("userId") String userId, @RequestParam("pass") String pass, Model model, HttpSession session){
        String query = "SELECT PASS FROM USER_TEST_INFO WHERE USER_ID ='"+userId+"'";
        Map<String,Object> result = dbConnection.get(query);
        if(result.get("PASS") != null){
            if(HashUtil.getSha256(pass).equals(result.get("PASS").toString())){
                HttpUtil.setCookie(res, "userId", userId, 60*2);
                model.addAttribute("message","성공");
            }   else {
                model.addAttribute("message","실패");
            }
        }
        return "3week/login";
    }
```
#### 설명
> `parameter`로 받은 userId로 query를 동적으로 생성하여 `USER_TEST_INFO`테이블에서 PASS 조회함<br>
> 조회 후에 `parameter`에서 넘어온 pass를 `HashUtil`을 통해 SHA256 해쉬화하여 조회 된 PASS 값과 비교하여 같을 시에 로그인 성공<br>

---

### 5. 식별/bcryte 해시인증 동시
> ID는 평문 PASS가 bcryte 암호화로 동시에 체크하는 로직

```java
    @PostMapping("/test/login-auth-all-hash-bcryte")
    public String loginIdAuthAllHashBCryte(@RequestParam("userId") String userId, @RequestParam("pass") String pass, Model model, HttpSession session){
        String query = "SELECT SALT FROM USER_TEST_INFO WHERE USER_ID ='"+userId+"'";
        Map<String,Object> result = dbConnection.get(query);

        if(result.get("SALT") != null){
            String salt = "$2a$10$"+HashUtil.baseEncodeSalt(result.get("SALT").toString());
            String byPass = HashUtil.getBCryptBySalt(pass,salt);

            query = "SELECT COUNT(1) cnt FROM USER_TEST_INFO WHERE USER_ID ='"+userId+"' AND PASS = '"+byPass+"'";

            result = dbConnection.get(query);
            if(result.get("cnt") != null && Integer.parseInt(result.get("cnt").toString()) == 1){
                HttpUtil.setCookie(res, "userId", userId, 60*2);
                model.addAttribute("message","성공");
            } else {
                model.addAttribute("message","실패");
            }
        }

        return "3week/login";
    }
```
#### 설명
> `parameter`로 받은 userId로 query를 동적으로 생성하여 `USER_TEST_INFO`테이블에서 SALT값을 조회<br>
> 조회 된 이후에 `parameter`로 받은 pass와 조회된 SALT 값으로 `HashUtil`을 통해 pass를 bcryte암호화 진행<br> 
> 평문 userId와 암호화된 pass로 `USER_TEST_INFO`테이블을 식별/인증 진행<br>
> 조회 성공 시에는 `cookie`에 userId를 넣어서 저장함<br>
> 위험성 : ~~

---

### 6. 식별/bcryte 해시인증 분리
> ID는 평문 PASS가 bcryte 암호화로 분리하여 체크하는 로직

```java
    @PostMapping("/test/login-auth-divide-hash-bcryte")
    public String loginIdAuthDivideHashBCryte(@RequestParam("userId") String userId, @RequestParam("pass") String pass, Model model, HttpSession session){
        String query = "SELECT SALT, PASS FROM USER_TEST_INFO WHERE USER_ID ='"+userId+"'";
        Map<String,Object> result = dbConnection.get(query);

        if(result.get("SALT") != null){
            String salt = "$2a$10$"+HashUtil.baseEncodeSalt(result.get("SALT").toString());
            String byPass = HashUtil.getBCryptBySalt(pass,salt);

            if(result.get("PASS").toString().equals(byPass)){
                HttpUtil.setCookie(res, "userId", userId, 60*2);
                model.addAttribute("message","성공");
            } else {
                model.addAttribute("message","실패");
            }
        }

        return "3week/login";
    }
```
#### 설명
> `parameter`로 받은 userId로 query를 동적으로 생성하여 `USER_TEST_INFO`테이블에서 PASS, SALT값을 조회<br>
> 조회 된 이후에 `parameter`로 받은 pass와 조회된 SALT 값으로 `HashUtil`을 통해 pass를 bcryte암호화 진행<br> 
> 조회 된 PASS와 bcryte암호화 된 pass를 비교<br>
> 성공 시에는 `cookie`에 userId를 넣어서 저장함<br>

---

### 7. 식별/인증 개행 동시
> ID,PASS가 평문으로 동시에 체크하는 로직<br>
> 동적으로 생성된 query가 중간에 개행이 존재

```java
    @PostMapping("/test/login-auth-all-newline")
    public String loginIdAuthAllNewLine(@RequestParam("userId") String userId, @RequestParam("pass") String pass, Model model, HttpSession session){
        String query = "SELECT COUNT(1) cnt FROM USER_TEST_INFO WHERE USER_ID ='"+userId+"'\n" +
                "AND PASS = '"+pass+"'";
        Map<String,Object> result = dbConnection.get(query);
        if(result.get("cnt") != null && Integer.parseInt(result.get("cnt").toString()) == 1){
            HttpUtil.setCookie(res, "userId", userId, 60*2);
            model.addAttribute("message","성공");
        } else {
            model.addAttribute("message","실패");
        }
        return "3week/login";
    }
```
#### 설명
> `parameter`로 받은 userId와 pass로 query를 동적으로 생성하여 `USER_TEST_INFO`테이블에서 조회함
>   - 동적으로 생성 시에 userId 이후에 개행을 추가

> 조회 성공 시에는 `cookie`에 userId를 넣어서 저장함<br>

---

### 8. 식별/인증 파라미터 개행 동시
> ID,PASS가 평문으로 동시에 체크하는 로직<br>
> 동적으로 생성된 query에 파라미터 넣는 부분에 개행을 추가

```java
    @PostMapping("/test/login-auth-all-param-newline")
    public String loginIdAuthAllParamNewLineNewLine(@RequestParam("userId") String userId, @RequestParam("pass") String pass, Model model, HttpSession session){
        StringBuilder query = new StringBuilder();
        query.append("SELECT COUNT(1) cnt FROM USER_TEST_INFO WHERE (USER_ID =REPLACE(REPLACE('"+userId+"\n");
        query.append( "', '\n', ''), '\r', ''))");
        query.append("AND (PASS = REPLACE(REPLACE('"+pass+"\n");
        query.append("', '\n', ''), '\r', ''))");
        Map<String,Object> result = dbConnection.get(query.toString());
        if(result.get("cnt") != null && Integer.parseInt(result.get("cnt").toString()) == 1){
            HttpUtil.setCookie(res, "userId", userId, 60*2);
            model.addAttribute("message","성공");
        } else {
            model.addAttribute("message","실패");
        }
        return "3week/login";
    }
```
#### 설명
> `parameter`로 받은 userId와 pass로 query를 동적으로 생성하여 `USER_TEST_INFO`테이블에서 조회함
>   - 동적으로 생성 시에 userId와 pass 파라미터에 개행을 추가함
>   - 개행이 파라미터에 추가되었기에 파라미터에 REPLACE함수를 사용하여 개행 제거

> 조회 성공 시에는 `cookie`에 userId를 넣어서 저장함<br>

---

### 9. 식별/해시인증 개행 동시
> ID평문, PAS가 SAH256 해쉬로 동시에 체크하는 로직<br>
> 동적으로 생성된 query가 중간에 개행이 존재

```java
    public String loginIdAuthDivideHash(@RequestParam("userId") String userId, @RequestParam("pass") String pass, Model model, HttpSession session){
        String query = "SELECT COUNT(1) cnt FROM USER_TEST_INFO WHERE USER_ID ='"+userId+"'\n" +
                "AND PASS = '"+HashUtil.getSha256(pass)+"'";

        Map<String,Object> result = dbConnection.get(query);
        if(result.get("cnt") != null && Integer.parseInt(result.get("cnt").toString()) == 1){
            HttpUtil.setCookie(res, "userId", userId, 60*2);
            model.addAttribute("message","성공");
        } else {
            model.addAttribute("message","실패");
        }
        return "3week/login";
    }
```
#### 설명
> `parameter`로 받은 userId와 `HashUtil`로 SHA256 해쉬화된 pass로 query를 동적으로 생성하여 `USER_TEST_INFO`테이블에서 조회함
>   - 동적으로 생성 시에 userId 이후에 개행을 추가

> 조회 성공 시에는 `cookie`에 userId를 넣어서 저장함<br>

---

### 10. 식별/bcryte 해시인증 파라미터 개행 동시 후에 JWT
> ID평문, PASS가 bcryte암호화로 동시에 체크하는 로직<br>
> 동적으로 생성된 query가 파라미터에 개행이 존재<br>
> 로그인 이후에 JWT토큰 발행

```java
    @PostMapping("/test/login-auth-all-hash-bcryte")
    public String loginIdAuthAllHashBCryte(@RequestParam("userId") String userId, @RequestParam("pass") String pass, Model model, HttpSession session){
        String query = "SELECT SALT FROM USER_TEST_INFO WHERE USER_ID ='"+userId+"'";
        Map<String,Object> result = dbConnection.get(query);

        if(result.get("SALT") != null){
            String salt = "$2a$10$"+HashUtil.baseEncodeSalt(result.get("SALT").toString());
            String byPass = HashUtil.getBCryptBySalt(pass,salt);

            StringBuilder queryBuilder = new StringBuilder();
            queryBuilder.append("SELECT COUNT(1) cnt FROM USER_TEST_INFO WHERE (USER_ID =REPLACE(REPLACE('"+userId+"\n");
            queryBuilder.append( "', '\n', ''), '\r', ''))");
            queryBuilder.append("AND (PASS = REPLACE(REPLACE('"+byPass+"\n");
            queryBuilder.append("', '\n', ''), '\r', ''))");

            result = dbConnection.get(queryBuilder.toString());
            if(result.get("cnt") != null && Integer.parseInt(result.get("cnt").toString()) == 1){
                String ip = req.getRemoteAddr();
                String userAgent = req.getHeader("User-Agent");
                String deviceId = HashUtil.getSha256(ip + userAgent);
                String accessToken = JwtUtil.generateAccessToken(userId, deviceId);
                String refreshToken = JwtUtil.generateRefreshToken(userId, deviceId);

                HttpUtil.setCookie(res, "accessToken", accessToken, (int) Duration.ofMinutes(15).getSeconds());
                HttpUtil.setCookie(res, "refreshToken", refreshToken, (int) Duration.ofDays(7).getSeconds());

                model.addAttribute("message","성공");
            } else {
                model.addAttribute("message","실패");
            }
        }

        return "3week/login";
    }
```
#### 설명
> `parameter`로 받은 userId로 query를 동적으로 생성하여 `USER_TEST_INFO`테이블에서 SALT 조회함<br>
> 조회 된 SALT와 `parameter`로 받은 pass로 `HashUtil`을 통하여 bcryte 암호화 진행
> 암호화된 pass와 평문 userId로 query동적으로 생성
>   - 동적으로 생성 시에 userId, passd의 파라미터에 개행 추가
>   - 개행이 파라미터에 추가되었기에 파라미터에 REPLACE함수를 사용하여 개행 제거

> 조회 성공 시에는 `HttpServletRequest`를 통하여 사용자의 `ip`와 `agent`를 가지고 와서 합친 이후에 `HashUtil`을 통하여 SHA256 해쉬화 진행<br>
> 해쉬화된 이 값은 `jwt`의 `Claim`에 `deviceId`로 추가하여 로그인 유지 시에 비교할 예정<br>
> `jwt`는 `accessToken`과 `refreshToken` 발행
>   - `accessToken`은 유효 시간을 15분으로 설정
>   - `refreshToken`은 유효 시간을 7일으로 설정

> 이 후에 `accessToken`과 `refreshToken`을 쿠키에 저장

---

## 결론

### 인증 구조 분류

구분 | 방식 | 인증 흐름 | 보안 방식
|-----|----|----|----|
1~2 | 평문 ID/PW - 동시/분리 | userId + pass → DB | 평문 비교
3~4 | SHA256 해시 인증 - 동시/분리 | pass → SHA256 후 DB 비교 | 단방향 해시
5~6 | BCrypt 해시 인증 - 동시/분리 | pass + salt → BCrypt 후 DB 비교 | 강한 단방향 해시 + salt
7~9 | 개행 조작 시나리오 | ID/PASS에 개행 포함된 쿼리 | 인젝션 우회 탐지
10 | BCrypt + 개행 처리 + JWT | 인증 후 deviceId 생성 + JWT 발급 | 세션리스 인증, 고보안 방식

<hr />