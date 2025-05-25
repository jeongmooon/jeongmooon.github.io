# 블라인드 SQL 인젝션

`Blind SQL Injection`은 공격자가 **쿼리의 직접적인 결과나 오류 메시지를 받을 수 없는 상황**에서, 응용 프로그램의 응답 차이를 기반으로 **데이터베이스 정보를 유추하는 공격 방식**이다.  
일반적인 SQL Injection과는 달리 명확한 피드백이 없기 때문에 더 느리고 반복적인 작업이 필요하지만, **치명적인 정보 탈취가 가능한 정교한 인젝션 기법**이다.

애플리케이션이 오류를 숨기거나 사용자에게 쿼리 결과를 직접적으로 보여주지 않도록 처리하더라도, 응답 시간이나 콘텐츠의 미묘한 차이를 분석함으로써 공격자는 내부 데이터를 유추할 수 있다.

---

## 주요 기법

| 기법              | 설명                                                                 | 작동 방식                                                   |
|------------------|----------------------------------------------------------------------|------------------------------------------------------------|
| **불리언 기반**   | 조건이 `참`일 경우와 `거짓`일 경우 애플리케이션의 응답 차이를 비교   | 페이지 콘텐츠의 유무, 메시지 유무, 리디렉션 차이 등으로 판별 |
| **시간 기반**     | 조건이 `참`일 때 의도적으로 **응답 지연**을 발생시킴                 | 응답 시간 지연 유무를 통해 조건 만족 여부를 판단            |

- **불리언 기반 Blind SQLi**
    - 조건이 참일 때와 거짓일 때의 응답 메시지 또는 출력 결과의 차이를 이용한다.
    - 예시:  
      ```sql
      ' AND (SELECT COUNT(*) FROM users WHERE username='admin') > 0 --
      ```

- **시간 기반 Blind SQLi**
    - `SLEEP()` 함수 등을 사용하여 조건이 참일 때만 **지연**시키는 방식이다.
    - 예시:
      ```sql
      ' AND IF((SELECT SUBSTRING(password,1,1) FROM users WHERE username='admin')='a', SLEEP(5), 0) --
      ```

---

## 공격 절차 및 예시 흐름

1. **주입 지점 탐지**
2. **참/거짓 조건 확인**
3. **데이터 열거**
4. **문자 단위 추출**
5. **자동화 도구 활용**

---

## Boolean 기반 추출 순서도

```mermaid
graph TD
    A[입력값 변조 후 응답 변화 확인] --> B{응답이 다름?}
    B -- 예 --> C[조건: 1=1, 1=2로 테스트]
    C --> D{차이 확인됨?}
    D -- 예 --> E[문자 추출용 SUBSTRING(), ASCII() 사용]
    E --> F[한 글자씩 조건 비교]
    F --> G[데이터 조각 완성]
    D -- 아니오 --> H[응답 방식 변경 필요]
    B -- 아니오 --> I[다른 파라미터 또는 위치 탐색]
```

---

## 자주 쓰이는 Boolean 기반 페이로드 예시

| 목적                         | 페이로드 예시 |
|------------------------------|----------------|
| 참 조건 확인                 | `' OR 1=1 --` |
| 거짓 조건 확인               | `' OR 1=2 --` |
| 특정 유저 존재 확인          | `' AND (SELECT COUNT(*) FROM users WHERE username='admin') > 0 --` |
| 비밀번호 한 글자 추출 (a)    | `' AND SUBSTRING((SELECT password FROM users WHERE username='admin'),1,1)='a' --` |
| 비밀번호 첫 글자 ASCII 확인  | `' AND ASCII(SUBSTRING((SELECT password FROM users WHERE username='admin'),1,1))=97 --` |

---

## 정리

> `Blind SQL Injection`은 출력 결과 없이도 공격이 가능한 은밀하고 효과적인 인젝션 기법이다.

> 응답 변화 또는 시간 지연을 기반으로 조건의 참/거짓을 유추하여 **데이터를 하나씩 추출**해 낼 수 있으며, **자동화 도구의 활용과 수동 분석의 병행이 핵심**이다.

> 복잡하고 방어가 잘 된 시스템일수록 이 방식은 더욱 유용하게 사용될 수 있으며, 웹 보안의 핵심 위협 요소 중 하나이다.

## 참고 사이트
>[NetSPI](https://sqlwiki.netspi.com/injectionTypes/blindBased/#mysql "Blind 기반 SQL 인젝션")

>[Oracle](https://pentestmonkey.net/cheat-sheet/sql-injection/oracle-sql-injection-cheat-sheet "Oracle SQL Injection Cheat Sheet")

<hr />