<hr />

# MINI-MISSON(데이터 베이스와 조회 값 확인)

- GET Method로 파라미터를 name을 줘서 score 값을 적어라.
- ex) OOO 학생의 점수는 00점 입니다.

### 테스트용 테이블

```sql
CREATE TABLE test_table (
	IDX INT(10) NOT NULL AUTO_INCREMENT,
	name VARCHAR(20),
	score VARCHAR(20),
	pass VARCHAR(20),
	PRIMARY KEY (idx)
);
```
### 테스트 테이블 값

- 4개의 로우 ISNERT

```sql
INSERT INTO USER_INFO(name, score, pass)
VALUES('doldol','33','1234');

INSERT INTO USER_INFO(name, score, pass)
VALUES('nomaltic','80','2222');

INSERT INTO USER_INFO(name, score, pass)
VALUES('admin','80','admin');

INSERT INTO USER_INFO(name, score, pass)
VALUES('jeongmoon','50','3333');
```

### ScoreController.java

```java
    @GetMapping("/score")
    public String getLoginPage(@RequestParam("name") String name, Model model) throws Exception{
        Map<String, Object> result = dbConnection.get("SELECT * FROM test_table WHERE name = '"+name + "'");
        model.addAttribute("result", result);
        return "score";
    }
```
- 조회 테이블 : test_table
- 조회 조건 : name
- 조회 대상 : *(모든 컬럼)

### score.jsp

```html java
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>score</title>
</head>
<body>
    ${result.name} 학생의 점수는 ${result.score}점 입니다.
</body>
</html>
```
- EL(Expression Language) 사용하여 표기
- 결과 값의 name, score 컬럼 사용

## 결과

#### (1) doldol의 결과 값
![doldol 화면](https://jeongmooon.github.io/img/study/mini-mission/doldol-mini.png)

- **파라미터:**
    - /score?name=doldol

#### (2) admin의 결과 값
![admin 화면](https://jeongmooon.github.io/img/study/mini-mission/admin-mini.png)
- **파라미터:**
    - /score?name=admin

<hr />
