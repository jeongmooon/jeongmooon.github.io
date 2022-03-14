# Servlet Container

## Servlet Life Cycle

### init()
- 서블릿이 시작할 때, 인스턴스가 되면서 한번 실행되는 메소드

### service()
- request/response 패턴을 사용하는 클라이언트로부터 받은 모든 request에 대한 서비스
- 스레드를 사용하는 것으로 다른곳에서 여러번 호출되면 스레드를 이용해 여러번 호출됨
- 자바는 때문에, 다른 웹들은 프로세스로 돌아가지만 스레드로 돌아가서 효율이 좋음

### destroy()
- 서블릿 라이프의 끝, shutdown이 되거나, 컴파일을 하여 수정이 된다면 init()으로 만든 자원들을 반납하기 위해 실행

## getWriter
- OutputStream이 캡슐화해서 변환된 것
- 때문에 Wirter로 바로 받는 것이 가능

## Overriding

### service()
- URL or URI로 호출시 실행되는 것
- 안에 있는 것들을 전부 실행함

### doGet()
- service()를 servlet에서 찾아서 호출하고 GET method가 호출된다면 service안에서 doGet()을 실행되는 곳에서 오버라이딩이 되어있다면 실행됨
- 오버라이딩하지 않고 GET method를 사용한다면 오류가 나오게 설정되어 있음
- GET method를 사용하는 것으로 head부분에 데이터가 담겨져서 가게됨

### doPost()
- service()를 servlet에서 찾아서 호출하고 POST method가 호출된다면 service안에서 doPost()을 실행되는 곳에서 오버라이딩이 되어있다면 실행됨
- 오버라이딩하지 않고 Post method를 사용한다면 오류가 나오게 설정되어 있음
- POST method를 사용하는 것으로 body부분에 데이터가 담겨져서 가게됨