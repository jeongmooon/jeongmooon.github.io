<hr />

# URL(uniform resource locator)
- 컴퓨터 네트워크 상에서 리소스가 어디 있는지 알려주기 위한 규약이다

# URI(uniform resource identifier)
- URI는 특정 리소스를 식별하는 **통합자원식별자**를 의미한다
- 웹기술에서 사용하는 논리적 or 물리적 리소스를 식별하는 고유한 문자열 시퀸스

```
일반적인 URI구조
[Protocol]://[Domain or IP]:[Port]/[File Path]?[Query]#[Fragment]

1. Protocol : 프로토콜 유형
2. Domain or IP : 접근할 대상(서버) 호스트명
3. Port : 접근할 대상(서버) 포트번호
=> Well known Port : 각 프로토콜별 기본적인 포트 번호를 약속으로 정함
    ex) http(80), https(443)
4. File Path : 접근할 대상(서버)의 상세정보
5. Query : 접근할 대상에 전달하는 추가적인 정보(파라미터)
6. Fragment : 메인 리소스 내에 존재하는 서브 리소스에 접근할 때 이를 식별하기 위한 정보
```


<hr/>


# XML
- eXtensible Markup Language로 다목적 마크업 언어
- 인터넷에 연결된 시스템끼리 데이터를 쉽게주고 받을 수 있게하여 HTML의 한계 극복

# JSON
- JavaScript Object National 자바스크립트구조화 데이터
- 서버에서 클라이언트로 데이터 전송하거나 반대의 경우에 일반적으로 사용


# 동기 & 비동기
- 동기는 추구하는 같은 행위가 동시에 이루어지고, 비동기는 추구하는 행위가 다를 수도있고, 동시에 이루어지지도 않는다.

## 동기(synchronous)
- 동시에 일어난다. 요청결과가 얼마나 걸리든 요청할때 결과가 주어야함

## 비동기(asynchronus)
- 동시에 일어나지 않는다. 요청한 그 자리에서 결과가 주어지지 않음 