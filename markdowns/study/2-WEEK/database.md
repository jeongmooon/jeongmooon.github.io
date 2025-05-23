<hr />

# DATABASE(데이터베이스)

## DATABASE란?
- **데이터베이스(Database)**는 데이터를 체계적으로 저장하고 관리하기 위한 논리적, 물리적 저장소이다.
- 데이터를 저장, 검색, 수정, 삭제 같은 작업을 효율적으로 처리하기 위해 설계되었다.
- 애플리케이션이나 서비스가 필요로 하는 데이터를 체계적으로 관리하고, 필요한 경우 이를 가공하여 제공하는 역할을 한다.

---

## 데이터베이스의 주요 특징
1. **조직화된 데이터 관리:**  
   데이터를 체계적으로 구조화하여 저장하며, 테이블과 같은 형태로 관리된다.
   
2. **데이터 무결성:**  
   데이터가 항상 정확하고 일관성을 유지하도록 관리된다.  
   (예: 중복 데이터 방지)

3. **상호 데이터 공유:**  
   여러 사용자가 동시에 데이터를 읽거나 수정할 수 있다.

4. **보안성:**  
   인증 절차와 권한 관리를 통해 민감한 데이터가 보호된다.

5. **데이터 독립성:**  
   애플리케이션이 데이터 구조 변경에 영향을 받지 않도록 설계되었다.

---

## 데이터베이스의 유형

### 1. **관계형 데이터베이스(Relational Database)**  
- 데이터를 **테이블(표)** 형식으로 저장하고, 각 테이블 간의 **관계(Relation)**를 정의한다.
- SQL(Structured Query Language)을 사용하여 데이터를 관리한다.
- **예:** MySQL, PostgreSQL, Oracle Database, Microsoft SQL Server

### 2. **비관계형 데이터베이스(NoSQL)**  
- 테이블 기반이 아닌, 비구조화 데이터를 저장하는 방식이다.
- JSON, Document, Key-Value 등 다양한 데이터 형태를 지원한다.
- 대규모 데이터 처리와 분산 시스템에 적합하다.
- **예:** MongoDB(문서형), Redis(키값 저장소), Cassandra(분산형), Neo4j(그래프형)

### 3. **시계열 데이터베이스(Time Series Database)**  
- 시간에 따라 변화하는 데이터를 효율적으로 저장 및 관리한다.
- IoT 데이터, 로그 데이터 등에 주로 사용된다.
- **예:** InfluxDB, TimescaleDB

---

## 데이터베이스의 주요 개념

### 1. **스키마(Schema)**  
- 데이터베이스의 구조를 정의하는 설계 청사진.
- 테이블, 열, 데이터 타입, 제약 조건 등을 포함한다.

### 2. **트랜잭션(Transaction)**  
- 데이터 수정 작업의 논리적 단위.  
- 하나의 트랜잭션은 모두 성공하거나 전혀 실행되지 않아야 한다. (Commit 또는 Rollback)

### 3. **ACID 속성**
데이터베이스 트랜잭션이 가져야 할 4가지 기본 특성.
- **A(원자성):** 모든 작업이 성공하거나, 실패 시 원상 복구.
- **C(일관성):** 데이터베이스가 트랜잭션 후에도 유효한 상태 유지.
- **I(격리성):** 여러 트랜잭션이 독립적으로 실행.
- **D(지속성):** 트랜잭션 완료 후 데이터는 영구적으로 저장.

### 4. **인덱스(Index)**  
- 데이터를 검색하는 속도를 높이기 위한 데이터 구조.
- 특정 열에 인덱스를 추가하면, 데이터를 빠르게 조회할 수 있다.

---

## 데이터베이스의 장단점

### 장점
- **데이터 중앙화 관리:** 데이터의 중복 제거 및 일관성 유지.
- **효율성:** 데이터를 구조화하여 효율적으로 저장 및 검색.
- **보안:** 데이터 접근 권한 설정 및 암호화를 통해 보안 강화.
- **확장성:** 데이터 용량 증가에 유연하게 대응 가능.

### 단점
- 설치 및 관리 비용 발생.
- 대규모 트래픽 처리 시 성능 저하 가능(적절한 튜닝 필요).
- 복잡한 설계가 요구되는 경우 시간이 소요됨.

---

## CONCLUSION(결론)
- **데이터베이스는 데이터를 저장·관리·검색하는 데 있어 필수적인 시스템**이다.
- 다양한 유형의 데이터베이스가 존재하며, 활용 목적에 따라 적합한 데이터베이스를 선택해야 한다.
- 데이터베이스 설계와 관리의 핵심은 **성능, 확장성, 보안, 무결성**을 균형 있게 유지하는 것이다.

<hr />