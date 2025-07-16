# XSS 5

## 취약점
- 타겟 Url : http://ctf.segfaulthub.com:4343/xss_6/notice_update.php
- 타겟 값 : 내용
- 입력 파라미터 : `<script>alert(1)</script>`
- 문제점 : XSS 공격
    - 내용의 값을 프론트에서 필터링하고 서버에서 필터링 하지 않아서 발생

### 결과 화면
![XSS 5](../../../img/study/pdf/XSS5/XSS5_js에%20필터링X.jpg)

## 해결법
- 필터링을 프론트에서만 진행하는 것이 아닌 서버에서도 진행 해야함
- html 이스케이프 처리
- 사용자가 입력한 값 검증 하여 사용
