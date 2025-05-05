<hr />

# SQL Injection CTF

## SQL Injection CTF
문제를 풀면서 살짝 어려웠던 문제 몇가지만 리뷰 작성할 예정이다.

---

## Login Bypass4
![기본 제공 정보](https://jeongmooon.github.io/img/study/5-WEEK/injection/LoginBypass4.png)

- 제공 값
    - 아이디 : doldol
    - 패스워드 : dol1234

- 조건
    - normaltic4로 로그인 하여라

---

## 공격 방법
1. SQL Injection이 가능한지 체크<br>
![로그인이 가능한지 체크](https://jeongmooon.github.io/img/study/5-WEEK/injection/check_injection.png)

- 정상 아이디로 로그인이 되었고 SQL Injection이 가능한지 확인이 되었다.
- 사용 쿼리 : `doldol' #`

2. 비밀번호 무작위 값 대입<br>
![비밀번호 무작위 값 대입](https://jeongmooon.github.io/img/study/5-WEEK/injection/incorrect_pass.png)

- 비밀번호와 아이디가 구분되어 체크되어 있다는 것이 추측 가능해졌다.
- 결과 값이 몇개의 컬럼이 존재하는지 확인을 할 차례이다.
- 사용 쿼리 : `doldol' #`

3. ORDER BY 를 이용한 컬럼 갯수 추출<br>
![컬럼 갯수 추출](https://jeongmooon.github.io/img/study/5-WEEK/injection/orderby.png)

- 컬럼을 `ORDER BY` 하여 컬럼의 수를 추출 하는 방법이다.
- 로그인이 성공한다면 해당 갯수 만큼의 컬럼이 존재한 다는 뜻이다.
- 로그인이 불가능 해진다면 해당 갯수 이상으로는 컬럼이 존재하지 않는 다는 뜻이다.
- 사용 쿼리 : `doldol' ORDER BY 3#`

4. UNION으로 로그인 해보기<br>
![유니온](https://jeongmooon.github.io/img/study/5-WEEK/injection/UNION_1.png)

- 어느 컬럼이 비밀번호인지는 알 수 없으니 두개다 1234로 넣는다.
- 로그인 불가능 시에는 비밀번호나 다른 어떤 것이 문제가 있다는 것이다.
- 사용 쿼리 : `doldol' AND 1=2 UNION SELECT '1234', '1234' FROM DUAL #`

5. 컬럼 값을 추출해보기<br>
![컬럼추출](https://jeongmooon.github.io/img/study/5-WEEK/injection/column.png)

- 이쪽 부터는 개발에 대해서 어느정도 지식이 있어야 가능한 추측이 들어가게 된다.
- 게싱공격으로 컬럼명을 추측해서 공격을 한다.
    - 공격 하는 곳은 `information_schema.columns`로 내 DB내에 컬럼명들을 확인 할 수 있다.
    - LIKE를 이용해서 한글자씩 넣어서 늘려가며 확인을 하는데 다른 컬럼들도 존재하니 오래걸리고 반복되는 작업이다.
    - 비밀번호 컬럼은 보통 pass, password pwd 이런식의 컬럼명으로 일반적으로 컬럼명을 지정해 놓기 때문에 게싱공격으로 먼저 확인을 해보는 것도 좋다.
- 정상 로그인 시에 컬럼 추출이 완료된다.
- 사용 쿼리 : `doldol' UNION SELECT column_name, NULL FROM information_schema.columns WHERE column_name like 'pass%' #`

6. 비밀번호 컬럼으로 비교 진행<br>
![비밀번호 비교](https://jeongmooon.github.io/img/study/5-WEEK/injection/pass_confirm.png)

- 비밀번호 컬럼과 내가 알고있는 정상 비밀번호를 넣어서 로그인이 되는지 확인한다.
- 로그인 불가능 시에는 비밀번호가 저장된 값이 다를 수도 있으니 길이를 비교해본다.
- 길이를 비교해도 같지 않다면 비밀번호가 특수한 처리가 됬을 추측을 할 수 있다.
    - 해쉬화, 암호화 등
    - 해쉬화를 먼저 예상하고 길이를 비교하여 체크한다.
        - MD5 : 32byte
        - SHA-1 : 40byte
        - SHA-256 : 64byte
        - SHA-512 : 128byte
    - 길이로 해쉬를 추측하여 추가적으로 공격을 진행해본다.
    - 지금 문제는 32자리로 나왔으므로 `MD5()` 함수를 추측하고 공격을 진행해본다.

- 해당 하는 곳에서 로그인이 불가능 하다면 비밀번호가 salt가 적용되어 해쉬화가 됬을 가능 성이 높고 salt의 값을 찾는 것 또한 난이도가 기하급수적으로 상승하여 해당 공격은 더 이상 진행을 못한다.

- 사용 쿼리 : 
    1. `doldol' AND pass = 'dol1234' #`
    2. `doldol' AND LENGTH(pass) = LENGTH('dol1234') #`
    3. `doldol' AND pass = MD5('dol1234') #`

7. UNION으로 로그인 해보기2<br>
![유니온](https://jeongmooon.github.io/img/study/5-WEEK/injection/UNION_2.png)

- 이제 몇 번째 컬럼이 아이디인지 비밀번호인지 확인이 필요한 작업이 존재한다.
- 첫 번째 값이 비밀번호라면 첫 번째에 적힌 값을 비밀번호에 넣고, 실패한다면 해당 작업을 뒷 컬럼으로 바꾸며 진행한다.
- 현재 문제는 첫 번째 컬럼이 아이디 인것으로 확인이 되었다.
- 사용 쿼리 : `doldol' AND 1=2 UNION SELECT MD5('doldol2'), MD5('doldol') FROM DUAL #`

8. `nomaltic4`로그인 진행(완료)<br>
![유니온](https://jeongmooon.github.io/img/study/5-WEEK/injection/suc.png)

- 위에 모든 과정을 종합하여 로그인을 진행한다.
- 사용 쿼리 : `doldol' AND 1=2 UNION SELECT 'normaltic4', MD5('1234') FROM DUAL #`

---
## 결론
`SQL Injection`은 단순히 로그인 우회를 넘어서, DB 내 **구조 파악, 데이터 추출, 권한 상승**까지 가능한 강력한 공격 기법이다.<br>
사용자가 입력하는 값이 그대로 쿼리에 삽입될 수 있다면, 공격자는 이를 조작하여 원하는 쿼리를 실행시킬 수 있다.<br>
특히 로그인 같은 단순한 입력창에서도 공격자는 `ORDER BY`, `UNION SELECT`, `information_schema` 접근, 해시/패턴 분석 등을 통해 내부 구조를 알아내고, 로그인 우회나 비밀번호 추출을 시도할 수 있다.<br>
하지만 `Prepared Statement` 등으로 입력값이 처리된다면 이런 공격은 실질적으로 무력화된다.<br>
따라서 **입력 검증, 파라미터 바인딩, 최소 권한 부여, 암호화 강화** 등 전방위적 보안 조치가 필요하다.


<hr />