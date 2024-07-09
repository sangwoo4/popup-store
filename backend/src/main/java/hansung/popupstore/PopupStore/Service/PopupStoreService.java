package hansung.popupstore.PopupStore.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import hansung.popupstore.PopupStore.Dto.PopupStoreDto;
import hansung.popupstore.PopupStore.Repository.PopupStoreRepository;
import hansung.popupstore.model.PopupStore;
import org.jsoup.Jsoup;
import org.jsoup.safety.Whitelist;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
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
public class PopupStoreService {
    private static final Logger logger = LoggerFactory.getLogger(PopupStoreService.class);
    private final PopupStoreRepository popupStoreRepository;
    private final ObjectMapper objectMapper;

    @Value("${naver.client.id}")
    private String clientId;
    @Value("${naver.client.secret}")
    private String clientSecret;

    @Autowired
    public PopupStoreService(PopupStoreRepository popupStoreRepository, ObjectMapper objectMapper) {
        this.popupStoreRepository = popupStoreRepository;
        this.objectMapper = objectMapper;
    }

    public static String removeHtmlTags(String html) {
        return Jsoup.clean(html, Whitelist.none());
    }

    public void savePopupStores(String result) {
        Set<String> existingTitles = this.popupStoreRepository.findAll().stream()
                .map(PopupStore::getTitle)
                .collect(Collectors.toSet());
        Set<String> titleSet = new HashSet<>(existingTitles);
        List<PopupStore> storesToSave = new ArrayList<>();

        try {
            JsonNode rootNode = this.objectMapper.readTree(result);
            JsonNode itemsNode = rootNode.path("items");
            Iterator<JsonNode> var7 = itemsNode.iterator();

            while (var7.hasNext()) {
                JsonNode itemNode = var7.next();
                String originalTitle = itemNode.path("title").asText();
                String cleanedTitle = removeHtmlTags(originalTitle);
                if (!titleSet.contains(cleanedTitle)) {
                    PopupStoreDto popupStoreDto = PopupStoreDto.builder()
                            .id(itemNode.path("id").asLong())
                            .title(cleanedTitle)
                            .address(itemNode.path("address").asText())
                            .roadAddress(itemNode.path("roadAddress").asText())
                            .telephone(itemNode.path("telephone").asText())
                            .description(itemNode.path("description").asText())
                            .link(itemNode.path("link").asText())
                            .mapx(itemNode.path("mapx").asText())
                            .mapy(itemNode.path("mapy").asText())
                            .build();
                    PopupStore popupStore = this.popupStoreRepository.save(popupStoreDto.toEntity());
                    storesToSave.add(popupStore);
                }
            }

            this.popupStoreRepository.saveAll(storesToSave);
            logger.info("총 {}개의 팝업 스토어를 저장했습니다.", storesToSave.size());
        } catch (IOException var12) {
            logger.error("JSON 처리 중 오류 발생: ", var12);
        }
    }

    public String fetchNaverSearchResults(String query) {
        URI uri = UriComponentsBuilder.fromUriString("https://openapi.naver.com")
                .path("/v1/search/local.json")
                .queryParam("query", query)
                .queryParam("display", 5)
                .queryParam("start", 1)
                .queryParam("sort", "random")
                .encode()
                .build()
                .toUri();

        RequestEntity<Void> requestEntity = RequestEntity.get(uri)
                .header("X-Naver-Client-Id", this.clientId)
                .header("X-Naver-Client-Secret", this.clientSecret)
                .build();

        RestTemplate restTemplate = new RestTemplate();

        try {
            ResponseEntity<String> response = restTemplate.exchange(requestEntity, String.class);
            return response.getBody();
        } catch (Exception var6) {
            logger.error("Naver API 요청 중 오류 발생: ", var6);
            throw new RuntimeException("Naver API 요청 중 오류 발생", var6);
        }
    }

    public List<PopupStore> getAllPopupStores() {
        return this.popupStoreRepository.findAll();
    }

    public Optional<PopupStore> searchPopupStores(String query) {
        return this.popupStoreRepository.findByTitleContaining(query);
    }
}