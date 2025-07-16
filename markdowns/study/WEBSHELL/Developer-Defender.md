# Developer-Defender

웹 애플리케이션에서 사용자로부터 업로드되는 파일(특히 이미지 파일 등)은 악성 스크립트를 포함할 수 있으며, 서버에 치명적인 영향을 줄 수 있다.<br>
개발자는 다음과 같은 방법을 통해 악성 스크립트를 식별하고 차단할 수 있다.

---

## 주요 방어 방법
1. 이미지 재처리 (Re-Rendering / Re-Encoding)
2. 파일 내용 전체 스캔
3. 안전한 저장 경로 및 실행 권한 제한

### 1.이미지 재처리 (Re-Rendering / Re-Encoding)
> 가장 효과적이고 권장되는 방법

- 업로드된 이미지 파일을 서버 측에서 **다시 인코딩하거나 썸네일 등으로 재생성**하여 저장

- 이 과정에서 이미지 내부에 포함된 악성 스크립트나 숨겨진 웹쉘 코드는 제거됨

- 이미지 헤더 이외의 불필요한 데이터, 주입된 PHP/JS 코드 등도 제거됨

#### 예시

```java
// Java 기반 예시
BufferedImage image = ImageIO.read(uploadedFile);
ImageIO.write(image, "jpg", new File("safe_uploads/safe.jpg"));
```
> 재처리 후 새 파일로 저장하므로, 원본 저장 없이도 안전성을 확보할 수 있음

### 2.파일 내용 전체 스캔
> 문자열 스캔으로 악성 코드 탐지

- 업로드된 파일을 바이트 또는 문자열로 읽어 특정 악성 코드 패턴 검색
- 탐지된 경우 업로드 차단

#### 예시

```python
with open('upload.jpg', 'rb') as f:
    content = f.read().decode(errors='ignore')
    if '<?php' in content or '<script>' in content:
        raise Exception("악성 코드 포함됨")
```
>  공격자는 난독화, 암호화, 인코딩 등을 통해 우회할 수 있기 때문에 단독으로는 신뢰할 수 없는 방법

### 3. 안전한 저장 경로 및 실행 권한 제한
> 악성 파일이 업로드되더라도 실행 불가 환경 구성

#### 웹 루트 외부에 저장
- 업로드된 파일은 `/var/www/html/uploads` 같은 웹 루트 내가 아닌,
`/var/uploads` 등 외부 디렉토리에 저장

- 클라이언트는 **별도의 API를 통해 접근**, 파일 직접 실행 불가능

#### 실행 권한 제거
- 업로드된 파일이 저장되는 디렉토리에 **실행 권한을 제거**한다.

- PHP/Apache 환경에서는 `.htaccess` 또는 서버 설정을 통해 실행 차단 가능

```apacheconf
# .htaccess
php_flag engine off
AddType text/plain .php .phtml .php3 .php5
```


## 참고 사이트
>[SegaFalut Academy](https://academy.segfaulthub.com/ "nomaltic 해킹 강의")

<hr />