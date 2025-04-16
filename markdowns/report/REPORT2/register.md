<hr />

# 웹페이지
최근 흥미 있게 하고 있는 모바일 게임 **림버스컴퍼니**를 주제로 웹페이지를 만들어 보려고 한다.  
단순히 과제용으로만 웹사이트를 제작하면 재미가 떨어지기 때문에, **게임 컨셉과 접목한 기능**을 구현하는 목표로 진행한다.  

---

## 주요 기능 구상

1. **로그인:** 사용자 로그인을 구현합니다.(1주차)
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

<hr />