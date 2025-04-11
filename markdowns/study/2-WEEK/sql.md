<hr />

# DDL, DML, DCL

## DDL / DML / DCL이란?
SQL(Structured Query Language)은 데이터베이스를 관리하기 위해 아래와 같이 세 가지 명령어 집합으로 나눌 수 있습니다.

1. **DDL (Data Definition Language)**  
   데이터베이스의 **구조(스키마)**를 정의하거나 수정하는 언어.
   
2. **DML (Data Manipulation Language)**  
   데이터베이스 내의 데이터를 **조회, 삽입, 수정, 삭제**하는 언어.
   
3. **DCL (Data Control Language)**  
   데이터베이스 접근 **권한 관리 및 보안**을 위한 언어.

---

## 1. DDL (데이터 정의 언어)

### 주요 특징
- 데이터베이스의 **구조를 정의**하거나 **수정**하는 언어.
- 테이블, 열(Column)의 생성 및 삭제와 같은 스키마 작업을 수행.
- 명령 실행 후, 변경 내용이 즉시 **자동 COMMIT** 처리됩니다.

### 주요 명령어
- **CREATE**: 데이터베이스, 테이블, 인덱스 등의 객체를 생성.  

  ```sql
  CREATE TABLE test_table  (
    idx INT(10) NOT NULL AUTO_INCREMENT,
    name VARCHAR(20),
    score VARCHAR(20),
    --pass VARCHAR(20),
    PRIMARY KEY (idx)
  );
  ```

- **ALTER**: 기존 테이블의 구조를 변경.  

  ```sql
  ALTER TABLE test_table ADD pass VARCHAR(20);
  ```

- **DROP**: 데이터베이스 혹은 테이블 제거.

  ```sql
  DROP TABLE test_table;
  ```

- **TRUNCATE**: 모든 데이터를 삭제(테이블 구조는 유지).

  ```sql
  TRUNCATE TABLE test_table;
  ```

---

## 2. DML (데이터 조작 언어)

### 주요 특징
- **데이터 자체를 조회, 삽입, 수정, 삭제**하는데 사용.
- 데이터 구조는 변경하지 않고, 테이블의 **내용**만 조작.
- COMMIT, ROLLBACK을 통해 내용을 적용 또는 복구할 수 있음.


### 주요 명령어
- **SELECT**: 데이터 조회.  

  ```sql
  SELECT * FROM test_table;
  ```
  - **WHERE(조건)** 구문
    - **AND(그리고)** : 조건이 모두 참인 경우
    - **OR(또는)** : 조건이 하나라도 참인 경우
  
  ```sql
  SELECT * FROM test_table WHERE idx = 1;
  => test_table 에서 idx가 1인 걸 찾아라

  SELECT * FROM test_table WHERE name = 'sonhs' AND pass = '2222';
  => test_table에서 name이 'sonhs' 이고 pass가 '2222'인 걸 찾아라

  SELECT * FROM test_table WHERE name = 'sonhs' or pass = '2222';
  => test_table에서 name이 'sonhs' 이거나 pass가 '2222'인 걸 찾아라
  ```

- **INSERT**: 기존 테이블의 구조를 변경.  

  ```sql
  INSERT INTO test_table (name, score, pass) VALUES ('sohns','100','1234');
  ```

- **UPDATE**: 데이터를 수정.

  ```sql
  UPDATE test_table SET score = '30' WHERE idx = 1;
  ```

- **DELETE**: 데이터를 삭제.

  ```sql
  DELETE FROM test_table WHERE idx = 1;
  ```

---

## 3. DCL (데이터 제어 언어)

### 주요 특징
- 데이터베이스의 **접근 권한을 제어**하여 데이터를 보호.
- 데이터 보안, 권한 부여와 회수 작업을 수행.
- 실행 시, 적용 내용이 자동으로 **COMMIT** 처리.


### 주요 명령어
- **GRANT**: 특정 사용자에게 권한을 부여.  

  ```sql
  GRANT SELECT, INSERT ON test_table TO user1;
  ```

- **REVOKE**: 특정 사용자에게 권한을 회수.

  ```sql
  REVOKE INSERT ON test_table TO user1;
  ```

---

## DDL, DML, DCL의 차이점

| **특징**             | **HTTP**                              | **HTTPS**                                |
|----------------------|---------------------------------------|------------------------------------------|
| **보안**             | 데이터를 평문으로 전송               | 데이터를 암호화하여 안전하게 전송        |
| **포트 번호**         | 기본적으로 포트 `80` 사용            | 기본적으로 포트 `443` 사용               |
| **속도**             | 빠를 수 있으나 보안은 취약            | 보안 계층 추가로 약간 느릴 수 있음       |
| **주소 형식**         | `http://example.com`                 | `https://example.com`                    |

---

## 결론
SQL의 DDL, DML, DCL은 각기 다른 목적을 가지고 데이터베이스 관리하는 데 반드시 필요한 요소다.

- **DDL은 데이터 구조를 정의**, **DML은 데이터를 관리,조작**, **DCL은 보안과 접근 권한을 관리** 한다.
- 이를 결합하여 데이터를 효율적으로 관리하고 보호할수 있다.

<hr />