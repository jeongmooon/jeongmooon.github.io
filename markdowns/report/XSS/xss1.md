# XSS 1

## 취약점
- 타겟 Url : http://ctf.segfaulthub.com:4343/xss_1/notice_read.php?id=327&view=1
- 타겟 값 : 제목
- 입력 파라미터 : `<script>alert(1)</script>`
- 문제점 : XSS 공격
    - 제목 부분에 XSS 공격 발생

### 결과 화면
![화면이 바뀌었을 때](../../../img/study/pdf/XSS1/XSS1.jpg)


## 해결법
- html 이스케이프 처리
- 사용자가 입력한 값 검증 하여 저장