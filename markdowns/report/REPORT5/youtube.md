
# 유튜브 API 연동 및 캐싱 적용

내 프로젝트 메인 페이지에서 **Limbus Company** 관련 최신 유튜브 영상을 가져오기 위해 유튜브 API를 활용했다.  
쇼츠(shorts) 문제로 직접 채널 최신 영상 조회가 어렵기에, 내가 만든 재생목록을 활용하여 최신 영상을 가져오는 방식을 선택했다.

---

## 전체 구조 및 동작 방식

1. **최신 영상 조회 시도**  
   - 원래는 프로젝트 채널의 최신 영상을 바로 가져오려고 했지만, 쇼츠 영상이 포함되어 이상하게 출력되는 문제가 있었다.  
   - 쇼츠가 영상 리스트에 섞여 있어 순서가 엉키고, 원하는 결과를 얻기 힘들었다.

2. **내 재생 목록 기반 최신 영상 조회**  
   - 직접 재생목록을 만들어서 그 안에 최신 영상만 가져오는 방식으로 변경하였다.  
   - 이 방식은 쇼츠 문제를 우회할 수 있었고, 안정적으로 최신 영상을 불러올 수 있었다.

3. **캐시 적용**  
   - 구글 API 무료 호출에는 쿼터 제한이 있기 때문에 캐시를 반드시 활용해야 했다.  
   - 영상 목록은 하루에 크게 변하지 않으므로, 하루 1회만 API 호출하고 그 결과를 캐시에 저장한다.  
   - 캐시는 매일 새벽 3시에 자동으로 비워져 다음 요청부터는 최신 정보를 다시 호출한다.

---

## 서버 소스 (YouTubeService.java)

```java
public class YouTubeService {

    private static final String APPLICATION_NAME = "limbusDeckMaker";
    private static final JacksonFactory JSON_FACTORY = JacksonFactory.getDefaultInstance();

    @Value("${youtube.api.key}")
    private String apiKey;

    private final CodeInfoRepository codeInfoRepository;

    @Autowired
    public YouTubeService(CodeInfoRepository codeInfoRepository){
        this.codeInfoRepository = codeInfoRepository;
    }

    /**
     * 특정 채널의 최신 영상 ID를 가져온다.
     * - 재생목록에서 원하는 제목을 가진 영상만 필터링해서 가져옴.
     * - 캐싱 적용(@Cacheable)으로 API 호출 횟수를 줄임.
     */
    @Cacheable(value="youtubeVideoCache", key="'last-roche-video'")
    public String getLatestVideoByChannel() throws GeneralSecurityException, IOException {
        log.info("callService - first call at {} from YouTubeService", LocalTime.now());

        // DB에서 유튜브 관련 설정값 읽기
        String channelId = codeInfoRepository.findById("YOUTUBE_CHANNELID").map(CodeInfo::getValue).orElse("");
        String getPlayListTitle = codeInfoRepository.findById("YOUTUBE_PLAYLIST").map(CodeInfo::getValue).orElse("");
        String getVideoTitle = codeInfoRepository.findById("YOUTUBE_VIDEO_TITLE").map(CodeInfo::getValue).orElse("");

        // 유튜브 API 초기화
        YouTube youtubeService = new YouTube.Builder(
                GoogleNetHttpTransport.newTrustedTransport(),
                JSON_FACTORY,
                null
        ).setApplicationName(APPLICATION_NAME).build();

        // 1. 채널 내 모든 재생목록 조회
        YouTube.Playlists.List playlistRequest = youtubeService.playlists()
                .list(Collections.singletonList("snippet"))
                .setChannelId(channelId)
                .setMaxResults(50L)
                .setKey(apiKey);

        PlaylistListResponse response = playlistRequest.execute();
        List<Playlist> playlists = response.getItems();

        for (Playlist playlist : playlists) {
            String title = playlist.getSnippet().getTitle();

            // 2. DB에 저장된 재생목록 이름과 비교하여 일치하는 재생목록 찾기
            if (title != null && title.equalsIgnoreCase(getPlayListTitle)) {
                
                // 3. 해당 재생목록에 포함된 영상들 조회
                YouTube.PlaylistItems.List myPlaylistRequest = youtubeService.playlistItems()
                        .list(Collections.singletonList("snippet"))
                        .setPlaylistId(playlist.getId())
                        .setMaxResults(50L)
                        .setKey(apiKey);

                PlaylistItemListResponse playlistResponse = myPlaylistRequest.execute();
                List<PlaylistItem> playlistItems = playlistResponse.getItems();

                if (playlistItems.isEmpty()) return null;

                // 4. 영상 ID 리스트 추출
                List<String> videoIds = playlistItems.stream()
                        .map(item -> item.getSnippet().getResourceId().getVideoId())
                        .collect(Collectors.toList());

                // 5. 영상 상세 정보(업로드일, 제목 등) 조회
                YouTube.Videos.List videosRequest = youtubeService.videos()
                        .list(Collections.singletonList("snippet"))
                        .setId(videoIds)
                        .setKey(apiKey);

                VideoListResponse videoResponse = videosRequest.execute();
                List<Video> videos = videoResponse.getItems();

                if (videos.isEmpty()) return null;

                // 6. 제목에 특정 키워드가 포함된 영상만 필터링 및 업로드 날짜 기준 정렬
                List<Video> filteredVideos = videos.stream()
                        .filter(v -> {
                            String videoTitle = v.getSnippet().getTitle();
                            return videoTitle != null && videoTitle.toLowerCase().contains(getVideoTitle.toLowerCase());
                        })
                        .sorted(Comparator.comparing(v -> v.getSnippet().getPublishedAt().getValue()))
                        .toList();

                if (filteredVideos.isEmpty()) return null;

                // 7. 가장 최신 영상 ID 반환
                Video latest = filteredVideos.get(filteredVideos.size() - 1);
                return latest.getId();
            }
        }

        return null;
    }

    /**
     * 매일 새벽 3시에 캐시를 비워 최신 영상 정보를 다시 호출할 수 있게 한다.
     */
    @Scheduled(cron = "0 0 3 * * *")
    @CacheEvict(value = "youtubeVideoCache", key = "'last-roche-video'")
    public void clearCache() {
        log.info("Scheduler - Cache evicted at {} from YouTubeService", LocalTime.now());
    }
}
```

### 주요 포인트 및 첨언

- **캐시 적용**  
  `@Cacheable`과 `@CacheEvict` 어노테이션을 사용해 하루 1회만 API 호출하도록 제한.  
  이는 구글 API 호출 쿼터 초과를 방지하는 매우 중요한 전략이다.

- **설정값 외부화**  
  채널 ID, 재생목록명, 영상 제목 필터 키워드를 DB에 저장하여 유연하게 변경 가능하도록 구현했다.

- **쇼츠 문제 우회**  
  쇼츠 영상은 재생목록에 포함되지 않게 하여, 목록을 직접 관리함으로써 영상 리스트가 깔끔해졌다.

- **정렬과 필터링**  
  업로드 날짜 기준으로 정렬하여 가장 최신 영상을 쉽게 찾고, 영상 제목에 특정 키워드가 포함된 영상만 선택해 정확도를 높였다.

- **예외처리**  
  실제 운영 시에는 `null` 반환 외에도 예외 상황에 대한 로깅과 대응이 필요하다.

---

## UI 결과 화면

![메인 화면](https://jeongmooon.github.io/img/report/youtube/youtube.png)

- 메인 페이지 중앙에 유튜브 영상 플레이어가 노출된다.  
- 최신 영상이 실시간으로 반영되므로 사용자에게 신선한 콘텐츠를 제공할 수 있다.

---

## 결론

- 유튜브 API를 직접 호출하기보다, 재생목록 기반으로 영상을 가져오는 것이 쇼츠 문제 회피 및 안정성 면에서 유리하다.  
- 캐시를 통해 호출 횟수를 줄임으로써 구글 API 무료 한도 내에서 효율적인 운영이 가능하다.  
- DB에서 유튜브 관련 설정값을 관리하여 유지보수도 편리하다.  
- 전체적으로 이 구조는 서비스 안정성과 비용 절감을 모두 잡은 합리적인 선택이다.

---
