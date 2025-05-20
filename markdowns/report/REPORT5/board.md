
# 커뮤니티 게시판

게시판을 통해 사용자들끼리 자유롭게 소통할 수 있습니다.

---

## 전체 구조 및 동작 방식

1. **게시판 리스트**  
   - 게시글 리스트에는 제목, 작성자, 작성일, 조회수가 표시됩니다.  
   - 제목을 클릭하면 해당 게시글 상세 페이지로 이동하며 조회수가 1 증가합니다.

2. **상세 게시글**  
   - 게시글 상세에는 제목, 작성자, 본문 내용이 표시됩니다.

3. **게시글 작성**  
   - 제목과 내용 입력 가능하며, 이미지 삽입은 현재 불가능하도록 제한되어 있습니다.

---

## 서버 소스 (BoardService.java)

```java
public class BoardService {
    private final UserInfoRepository userInfoRepository;
    private final BoardRepository boardRepository;

    // 게시판 리스트 조회 (페이징 처리)
    public List<BoardInfo> getBoardList(Pageable pageable){
        List<BoardInfo> boardList = boardRepository.findBoardInfos(pageable);
        return boardList;
    }

    // 특정 게시글 조회 및 조회수 증가 처리
    @Transactional
    public BoardDTO getBoard(Long id){
        Board board =  boardRepository.findById(id)
                        .orElseThrow(() -> new BizException(ErrorCode.NOT_BOARD_ID));
        board.updateView(); // 조회수 1 증가
        return Board.toEntity(board);
    }

    // 게시글 작성 화면용 작성자 정보 조회 (accessToken으로 사용자 정보 추출)
    public BoardDTO getBoardWrite(String accessToken){
        Long userId = Long.parseLong(Objects.requireNonNull(JwtUtil.validate(accessToken)));
        UserInfo user = userInfoRepository.getReferenceById(userId);
        return BoardDTO.builder().author(user.getGameCode()).build();
    }

    // 게시글 등록 처리
    public String addBoard(BoardRequestDTO boardRequestDTO, String accessToken){
        Long userId = Long.parseLong(Objects.requireNonNull(JwtUtil.validate(accessToken)));
        UserInfo user = userInfoRepository.getReferenceById(userId);

        // 게시글 내용 내 이미지 태그 제거 및 마크다운 이미지 링크 제거
        String content = boardRequestDTO.getContent();
        String sanitizedContent = JsoupUtil.replaceTag(content, "img").replaceAll("!\[[^\]]*\]\([^)]*\)", "");
        sanitizedContent = JsoupUtil.safeXss(sanitizedContent);

        if (sanitizedContent.trim().isEmpty()) {
            throw new BizException(ErrorCode.INVALID_BOARD_CONTENT);
        }

        Board board = Board.createBoard(boardRequestDTO.getTitle(), sanitizedContent, user);
        boardRepository.save(board);
        return "success";
    }
}
```

- **getBoardList**: 페이징된 게시글 리스트를 DB에서 조회해 반환  
- **getBoard**: 게시글 상세 조회 시 조회수를 1 증가시키고 게시글 데이터를 반환  
- **getBoardWrite**: 작성 화면에서 로그인한 사용자의 게임코드를 작성자 정보로 제공  
- **addBoard**: 게시글 등록 시 이미지 태그 및 마크다운 이미지 링크를 제거하고 XSS 필터링 후 저장. 내용이 없으면 예외 발생

---

## 프론트 화면

### 게시판 Javascript

```javascript
let page = 0;
let isLoading = false;
let hasMore = true;

const postListEl = document.getElementById('post-list');
const loading = document.getElementById("loading");

// 게시글 리스트 렌더링 함수
function renderPosts(posts) {
    posts.forEach(post => {
        const row = document.createElement('tr');
        row.className = 'border-t border-gray-600 hover:bg-gray-700 transition';
        for (let key in post) {
            if(key === "content") continue; // 내용은 리스트에 표시하지 않음
            const td = document.createElement('td');
            td.className = "p-3";

            if(key === "title"){
                const div = document.createElement('div');
                div.className = "text-yellow-300 hover:underline cursor-pointer";
                div.textContent = `${post.title}`;
                div.onclick = () => hrefUrl(`/board/${post.id}`); // 제목 클릭 시 상세 페이지 이동
                td.append(div);
            } else {
                td.textContent = `${post[key]}`;
            }
            row.append(td);
        }
        postListEl.appendChild(row);
    });
}

// 게시글 리스트 API 호출 및 처리
function fetchPosts() {
    if (isLoading || !hasMore) return;
    isLoading = true;

    fetchUse(`/board/list?page=${page}&size=10`, "GET", null, null, "로딩 중입니다...")
        .then(response => {
            if (!response.ok) {
                return response.text().then(msg => {
                    throw new Error(msg);
                });
            }
            return response.json();
        })
        .then(result => {
            renderPosts(result.list);
            page++;
            hasMore = !result.last; // 마지막 페이지 여부 확인
            isLoading = false;
            checkAndFetchIfNotFull();
        })
        .catch(error => {
            try {
                alert(JSON.parse(error.message).message);
            } catch (e) {
                alert("게시글을 불러오는 중 오류가 발생했습니다.");
            }
            console.error('게시글 로딩 중 오류:', error.message);
        })
        .finally(() => {
            isLoading = false;
            loading.style.display = "none";
        });
}

// 화면에 게시글 리스트가 충분하지 않아 스크롤이 없는 경우 추가 호출
function checkAndFetchIfNotFull() {
    if (!isLoading && hasMore && document.body.scrollHeight <= window.innerHeight) {
        fetchPosts();
    }
}

// 무한 스크롤 이벤트: 스크롤이 거의 바닥에 도달하면 다음 페이지 요청
window.addEventListener('scroll', () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 300) {
        fetchPosts();
    }
});

// 초기 로딩 시 첫 페이지 게시글 불러오기 및 부족 시 추가 요청
document.addEventListener('DOMContentLoaded', () => {
    fetchPosts();
    checkAndFetchIfNotFull();
});
```

- **무한 스크롤 구현**: 스크롤이 페이지 하단 근처에 도달하면 자동으로 다음 페이지 게시글을 불러옴  
- **로딩 상태 관리**: 중복 호출 방지 및 마지막 페이지 도달 여부 체크  
- **게시글 제목 클릭 시 상세 페이지로 이동**  
- **내용은 리스트에서 생략**하여 간결한 목록 제공  
- **에러 처리** 시 사용자에게 알림 표시 및 콘솔에 로그 출력  

---

## 결론

- 게시판은 기본적인 CRUD 중 리스트, 상세, 작성 기능을 포함하며, 작성 시 XSS 및 이미지 태그 필터링 처리로 보안을 강화함  
- 프론트엔드에서는 무한 스크롤로 편리한 사용자 경험 제공  
- 앞으로 댓글, 수정, 삭제, 이미지 지원 등 확장 가능성이 열려 있음  
