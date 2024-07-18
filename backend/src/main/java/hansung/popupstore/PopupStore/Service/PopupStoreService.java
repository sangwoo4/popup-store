package hansung.popupstore.PopupStore.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import hansung.popupstore.PopupStore.Repository.PopupStoreRepository;
import hansung.popupstore.model.PopupStore;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
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
@RequiredArgsConstructor
public class PopupStoreService {
    private static final Logger logger = LoggerFactory.getLogger(PopupStoreService.class);
    private PopupStoreRepository popupStoreRepository;
    private ObjectMapper objectMapper;

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


//    @Transactional
//    public void savePopupStores(String result) {
//        System.out.println("result::::::::" + result);
//        Set<String> existingTitles = this.popupStoreRepository.findAll().stream()
//                .map(PopupStore::getTitle)
//                .collect(Collectors.toSet());
//        Set<String> titleSet = new HashSet<>(existingTitles);
//        List<PopupStore> storesToSave = new ArrayList<>();
//
//        try {
//            JsonNode rootNode = this.objectMapper.readTree(result);
//            System.out.println("root Node \n" + rootNode);
//            JsonNode itemsNode = rootNode.path("items");
//            System.out.println("itemsNode \n" + itemsNode);
//            Iterator<JsonNode> var7 = itemsNode.iterator();
//            System.out.println("var 7 " + var7);
//            while (var7.hasNext()) {
//                JsonNode itemNode = var7.next();
//                String originalTitle = itemNode.path("title").asText();
//                String cleanedTitle = removeHtmlTags(originalTitle);
//                if (!titleSet.contains(cleanedTitle)) {
//                    PopupStoreDto popupStoreDto = PopupStoreDto.builder()
//                            .id(itemNode.path("id").asLong())
//                            .title(cleanedTitle)
//                            .address(itemNode.path("address").asText())
//                            .roadAddress(itemNode.path("roadAddress").asText())
//                            .telephone(itemNode.path("telephone").asText())
//                            .description(itemNode.path("description").asText())
//                            .link(itemNode.path("link").asText())
//                            .mapx(itemNode.path("mapx").asText())
//                            .mapy(itemNode.path("mapy").asText())
//                            .build();
//                    PopupStore popupStore = this.popupStoreRepository.save(popupStoreDto.toEntity());
//                    storesToSave.add(popupStore);
//                }
//            }
//
//            this.popupStoreRepository.saveAll(storesToSave);
//            logger.info("총 {}개의 팝업 스토어를 저장했습니다.", storesToSave.size());
//        } catch (IOException var12) {
//            logger.error("JSON 처리 중 오류 발생: ", var12);
//        }
//    }

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

    @Transactional
    public String getNewPopupStores(String result) {
        System.out.println("query ==============" + result);
        Set<String> existingTitles = popupStoreRepository.findAll().stream()
                .map(PopupStore::getTitle)
                .collect(Collectors.toSet());
        Set<String> titleSet = new HashSet<>(existingTitles);

        List<JsonNode> newStores = new ArrayList<>();

        String newStoresJson = null;
        try {
            JsonNode rootNode = objectMapper.readTree(result);
            JsonNode itemsNode = rootNode.path("items");
            Iterator<JsonNode> var7 = itemsNode.iterator();
            while (var7.hasNext()) {
                JsonNode itemNode = var7.next();
                String originalTitle = itemNode.path("title").asText();
                String cleanedTitle = removeHtmlTags(originalTitle);
                if (!titleSet.contains(cleanedTitle)) {
                    newStores.add(itemNode);
                    titleSet.add(cleanedTitle); // 중복 방지를 위해 추가
                }
            }
            System.out.println("new Store==========" + newStores);
            // 새로운 타이틀들의 데이터를 JSON 문자열로 변환
            newStoresJson = objectMapper.writeValueAsString(newStores);
            // 만약 저장하려면, 파일이나 데이터베이스에 저장하는 로직 추가
            System.out.println("newStoresJson" + newStoresJson);
        } catch (IOException e) {
            logger.error("JSON 처리 중 오류 발생: ", e);
        }
        return newStoresJson;
    }

    public List<PopupStore> getAllPopupStores() {
        return this.popupStoreRepository.findAll();
    }

    public Optional<PopupStore> searchPopupStores(String query) {
        return this.popupStoreRepository.findByTitleContaining(query);
    }
}