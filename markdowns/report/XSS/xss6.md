# XSS 6

## 취약점
- 타겟 Url : http://ctf.segfaulthub.com:4343/xss_7/notice_update.php
- 타겟 값 : 제목
- 입력 파라미터 : `1" onclick="alert(1)`
- 문제점 : XSS 공격
    - 값을 input에다가 그대로 사용하여 발생

### 결과 화면
![XSS 6](../../../img/study/pdf/XSS6/XSS6_제목에%20넣기.jpg)

## 해결법
- 필터링을 `"`,`'` 을 적용 하는 방안 제시
- 사용자가 입력한 값 검증 하여 사용
