# 서버 호스팅

내가 만든 웹페이지를 세상에 띄우려면 서버가 필요하다. 그래서 선택한 건 **CloudType**.

> 무료! (중요)<br/>
> 깃허브 연동도 간편하게 웹에서 클릭 몇 번이면 가능<br/>
> 단점: 프리티어는 매일 한 번 서버가 꺼진다. (치명적)<br/>

---

## 서버 호스팅이란?

간단히 말하면, **웹사이트나 앱을 인터넷에 띄우기 위해 서버를 빌리는 것**이다.

### 종류별 정리

* **웹 호스팅**: 가장 흔한 형태. 정적 웹사이트나 간단한 블로그 등.
* **이메일 호스팅**: 도메인 기반 이메일을 사용하고 싶을 때.
* **전용 서버 호스팅**: 한 대 서버 통째로! 리소스 많이 쓰는 프로젝트에 적합.
* **클라우드 호스팅**: 리소스 탄력적. 필요하면 늘리고 줄일 수 있음.

### 서버 호스팅의 핵심 특징

* **안정성**: 전문가가 관리해줘서 안심
* **보안**: SSL, 방화벽, 스팸 필터 등 기본 장착
* **성능**: 빠른 속도 + 넉넉한 자원 제공
* **확장성**: 유저 늘어나면 바로 리소스 업그레이드 가능
* **편리성**: 관리도구, 자동백업 등 있어 운영 편함

---

## 백엔드 배포 방식

### 1. Docker로 배포

내 웹은 Spring Boot + Gradle 구조라 도커 빌드파일을 만들어서 배포함.

```dockerfile
# Build
FROM eclipse-temurin:17-alpine AS build
RUN apk add --no-cache bash

WORKDIR /app

COPY gradlew .
RUN chmod +x ./gradlew

COPY gradle gradle
COPY build.gradle settings.gradle ./

RUN ./gradlew dependencies --no-daemon

COPY src/main/resources /app/src/main/resources
COPY src/main/resources/static /app/src/main/resources/static
COPY src/main/java /app/src/main/java

COPY . .
RUN chmod +x ./gradlew

RUN ./gradlew build --no-daemon -x test

# Runtime
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

RUN addgroup -g 1000 worker && \
    adduser -u 1000 -G worker -s /bin/sh -D worker

COPY --from=build --chown=worker:worker /app/build/libs/*.jar ./main.jar

USER worker:worker

EXPOSE 8080

ENTRYPOINT ["java", "-Dspring.profiles.active=${PROFILE}", "-jar", "main.jar"]
```

> 도커 파일 요약:
>
> * 빌드 단계에서 jar 생성
> * 실행 단계에서 jar 실행
> * 환경 프로필 분리 가능 (`PROFILE` 설정)

### 2. DB

* **MariaDB** 설치 후 내 DB도 함께 호스팅

---

## 다른 백엔드 호스팅 서비스는?

| 서비스              | 특징             | 가격       |
| ---------------- | -------------- | -------- |
| **Heroku**       | 간편 배포 + SQL 지원 | 월 \$5\~  |
| **Firebase**     | 실시간 DB + 빠른 배포 | 무료 / 종량제 |
| **AWS**          | 전 세계 서버 + 다양함  | 사용량만큼 과금 |
| **Google Cloud** | GCP 기반 + 쿠버네티스 | 무료 티어 존재 |
| **DigitalOcean** | IaaS + 저렴한 가격  | 월 \$4\~  |
| **Cloudflare**   | FaaS + 엣지 컴퓨팅  | 월 \$5\~  |

> 나는 **무료** + **간편**을 택함 → CloudType

---

## 결론

* 이젠 **어디서든 내가 만든 웹사이트에 접속 가능**하다
