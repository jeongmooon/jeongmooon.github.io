<hr />

# ProxyTool

## 대표적인 프록시 툴(Paros, Burp Suite, Fiddler)
주로 웹 취약점 분석에서 Burp Suite가 가장 빈번히 사용되며, Fiddler는 HTTP 디버깅에 특화

|구분|Paros|Burp Suite|Fiddler|
|---|---|---|---|
|개발사|오픈소스(개발중단)|PortSwigger|Telerik/Progress Software|
|주요용도|웹 보안 테스트, 기본적인 프록시|웹 보안 테스트, 취약점 분석|HTTP 디버깅, 웹 개발 지원|
|주요기능|기본적인 스캐닝, HTTP/HTTPS 트래픽 분석, 간단한 프록시 기능|고급 스캐닝, 트래픽 수정/인터셉트, 자동화된 공격, 리포팅, 다양한 플러그인|HTTP 디버깅, 세션 분석, HTTPS 디코딩, 스크립팅, 성능 모니터링|
|장점|무료 사용, 간단한 UI, 입문자 친화적|강력한 기능, 풍부한 플러그인, 업계 표준 도구, 커뮤니티 활성화|직관적인 UI, 뛰어난 디버깅 기능, .NET 환경 최적화, 무료 버전 강력|
|단점|개발 중단, 기능 제한적, 호환성 문제|높은 유료 버전 가격, 복잡한 UI, 초기 학습곡선|보안 테스트 기능 제한, 개발 디버깅 중심, Windows 환경 중심|
|가격|무료|Community(무료)/Pro(유료)|무료/Everywhere(유료)|

## Paros
- **특징:**
    - 웹 애플리케이션 보안 테스트를 위해 만들어진 오픈소스 프록시 도구
    - HTTP/HTTPS 트래픽 분석 및 간단한 스캐닝 기능 제공
    - 지금은 개발이 중단되었으나, 가벼운 UI와 기본 기능 위주로 활용 가능

- **장점:**
    - 오픈소스이므로 무료 사용 가능
    - 최소한의 기능만 있어, 입문자에게는 직관적

- **단점:**
    - 개발이 중단되어 업데이트가 없고, 최신 환경에서는 동작 안정성이 부족할 수 있음
    - Burp Suite나 다른 툴과 비교했을 때 기능이 제한적

## Burp Suite
- **특징:**
    - PortSwigger에서 개발한 웹 보안 테스트용 프록시 도구
    - HTTP/HTTPS 트래픽 수정, 반복 공격, 자동 스캐너, 리포팅 등 강력한 기능 제공
    - 유료 버전(Burp Suite Professional)은 자동화된 취약점 스캐너와 강력한 플러그인 사용이 가능

- **장점:**
    - 가장 많이 사용되는 웹 보안 도구 중 하나로, 다양한 플러그인 생태계 형성
    - 트래픽 인터셉트, 리피터, 인트루더, 스캐너 등 풍부한 모듈
    - 커뮤니티 판(무료 버전)도 기본 기능 사용 가능

- **단점:**
    - 유료 버전 가격이 비쌈
    - 입문자에게는 UI가 다소 복잡하게 느껴질 수 있음

## Fiddler
- **특징:**
    - Telerik(Progress Software)에서 개발한 HTTP 디버깅 프록시 도구
    - 주로 웹 애플리케이션 개발 과정에서 HTTP 트래픽을 디버깅하는 용도로 많이 쓰임
    - Windows 환경에서 사용이 편리하며, .NET 기반 환경과도 잘 통합

- **장점:**
    - UI가 직관적이고, 기본 디버깅 기능이 뛰어남
    - HTTPS 디코딩, 요청/응답 수정, 스크립팅 기능 등 광범위한 기능 제공
    - 무료 버전도 충분히 강력

- **단점:**
    - 전문적인 보안 분석보다는 주로 애플리케이션 디버깅에 초점
    - Burp Suite처럼 공격 자동화나 보안 테스팅에 특화된 기능은 상대적으로 제한적

---

## Burp Suite 사용
### proxy 설정 기본 화면
![Proxy 설정 기본 화면](https://jeongmooon.github.io/img/study/4-WEEK/proxy-tool/brup-proxy.png)

### intercept 설정 화면
![Proxy 설정 기본 화면](https://jeongmooon.github.io/img/study/4-WEEK/proxy-tool/brup-proxy-intercept.png)

### hist 화면
![Proxy 설정 기본 화면](https://jeongmooon.github.io/img/study/4-WEEK/proxy-tool/brup-proxy-hist.png)

## 결론
지금 배우는 강의에서는 **Burp Suite의 커뮤버전**을 사용한다.

<hr />