package hansung.popupstore.Naver;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import hansung.popupstore.model.PopupStore;
import org.jsoup.Jsoup;
import org.jsoup.safety.Whitelist;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.RequestEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.net.URI;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class NaverService {

    private static final Logger logger = LoggerFactory.getLogger(NaverService.class);

    private final PopupStoreRepository popupStoreRepository;
    private final ObjectMapper objectMapper;

    @Value("${naver.client.id}")
    private String clientId;

    @Value("${naver.client.secret}")
    private String clientSecret;

    public NaverService(PopupStoreRepository popupStoreRepository, ObjectMapper objectMapper) {
        this.popupStoreRepository = popupStoreRepository;
        this.objectMapper = objectMapper;
    }

    public static String removeHtmlTags(String html) {
        // 모든 HTML 태그 제거
        String cleaned = Jsoup.clean(html, Whitelist.none());
        return cleaned;
    }

    public void savePopupStores(String result) {
        // 데이터베이스에서 이미 저장된 팝업 스토어 타이틀 가져오기
        Set<String> existingTitles = popupStoreRepository.findAll()
                .stream()
                .map(PopupStore::getTitle)
                .collect(Collectors.toSet());

        Set<String> titleSet = new HashSet<>(existingTitles); // 중복 제거를 위한 Set 사용
        List<PopupStore> storesToSave = new ArrayList<>();

        try {
            JsonNode rootNode = objectMapper.readTree(result);
            JsonNode itemsNode = rootNode.path("items");

            for (JsonNode itemNode : itemsNode) {
                String originalTitle = itemNode.path("title").asText();
                String cleanedTitle = removeHtmlTags(originalTitle); // HTML 태그 제거

                if (!titleSet.contains(cleanedTitle)) { // 중복 체크
                    titleSet.add(cleanedTitle);
                    PopupStore store = new PopupStore();
                    store.setTitle(cleanedTitle);
                    store.setCategory(itemNode.path("category").asText());
                    store.setAddress(itemNode.path("address").asText());
                    store.setRoadAddress(itemNode.path("roadAddress").asText());
                    store.setMapx(itemNode.path("mapx").asText());
                    store.setMapy(itemNode.path("mapy").asText());
                    storesToSave.add(store);
                }
            }

            popupStoreRepository.saveAll(storesToSave);
            logger.info("총 {}개의 팝업 스토어를 저장했습니다.", storesToSave.size());

        } catch (IOException e) {
            logger.error("JSON 처리 중 오류 발생: ", e);
        }
    }

    public String fetchNaverSearchResults(String query) {
        URI uri = UriComponentsBuilder
                .fromUriString("https://openapi.naver.com")
                .path("/v1/search/local.json")
                .queryParam("query", query)
                .queryParam("display", 5)
                .queryParam("start", 1)
                .queryParam("sort", "random")
                .encode()
                .build()
                .toUri();

        RequestEntity<Void> requestEntity = RequestEntity
                .get(uri)
                .header("X-Naver-Client-Id", clientId)
                .header("X-Naver-Client-Secret", clientSecret)
                .build();

        RestTemplate restTemplate = new RestTemplate();

        try {
            ResponseEntity<String> response = restTemplate.exchange(requestEntity, String.class);
            return response.getBody();
        } catch (Exception e) {
            logger.error("Naver API 요청 중 오류 발생: ", e);
            throw new RuntimeException("Naver API 요청 중 오류 발생", e);
        }
    }

    public List<PopupStore> getAllPopupStores() {
        return popupStoreRepository.findAll();
    }

    public Optional<PopupStore> searchPopupStores(String query){
        return popupStoreRepository.findByTitleContaining(query);
    }
}