<hr />


# Request & Response
- 시작줄 : HTTP요청/ 요청에따른 성공or실패 기록
- Header : 요청에 대한 설명/ 본문에 대한 설명
- 본문 : 요청과 관련된 데이터/ 응답과 관련된 문서

- HTTP 메시지의 시작 줄과 HTTP 헤더를 묶어서 요청 헤드(head) 라고 부르며, 이와 반대로 HTTP 메시지의 페이로드는 본문(body) 이라고 한다.

## Request(요청)
- 요청(request)은 클라이언트가 서버로 전달하는 메시지로, 서버 측 액션을 유도한다.(클라이언트 -> 서버)
- startLine에 HTTP method/URL 요청 사항 기입
- Header : body값에 대한 기본설명
- Body : 전달 값

## Response(응답)
- 응답(response)은 요청에 대한 서버의 답변 이다.
- startLine : HTTP 응답의 시작 줄은 상태 줄(status line)이라고 말한다.(프로토콜버전,상태코드,상태설명)
- Header : 상태 줄에 미처 들어가지 못했던 서버에 대한 추가 정보를 제공한다.(Access-Control-Allow-Origin, Set-Cookie,
- Body : 

<hr />