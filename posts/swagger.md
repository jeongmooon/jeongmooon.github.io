# Swagger

## issue
- SpringSecurity와의 문제
![image](https://github.com/jeongmooon/jeongmooon.github.io/assets/92348108/c7eef641-7ea6-4d96-9db6-faece5261363)
> endpoint 로 ~/v3/api-docs/swagger-config 로 가는중 >> 요청은 ~/swagger-ui/index.html 요청 보냄

![image](https://github.com/jeongmooon/jeongmooon.github.io/assets/92348108/c8db3518-822f-432d-a432-988e84f23a69)
> 리소스가 정상적으로 접근이 되지않고 있음

> Security에서 WhiltList에 값을 추가해서 진행함
  > 실패
> 새로운 리스트 따서 requestMatchers 새로 만들어서 진행함
  > 성공

 - 뭐가다른거임???
