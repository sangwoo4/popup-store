package hansung.popupstore.PopupStore.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import hansung.popupstore.PopupStore.Dto.PopupStoreDto;
import hansung.popupstore.PopupStore.Repository.PopupStoreRepository;
import hansung.popupstore.ResponseDto;
import hansung.popupstore.model.PopupStore;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
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
@RequiredArgsConstructor
public class PopupSearchService {

    private final PopupStoreRepository popupStoreRepository;
    private final ObjectMapper objectMapper;
    private final PopUpRegisterService popUpRegisterService;
    private final PopUpAiService popUpAiService;
    private static final Logger logger = LoggerFactory.getLogger(PopupSearchService.class);

    @Value("${naver.client.id}")
    private String clientId;
    @Value("${naver.client.secret}")
    private String clientSecret;

    public static String removeHtmlTags(String html) {
        return Jsoup.clean(html, Whitelist.none());
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

    @Transactional
    public String getNewPopupStores(String result) {
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
                    // 새로운 JsonNode 객체를 만들어 cleanedTitle을 반영
                    ObjectNode newItemNode = itemNode.deepCopy();
                    newItemNode.put("title", cleanedTitle);

                    newStores.add(newItemNode);
                    titleSet.add(cleanedTitle); // 중복 방지를 위해 추가
                }
            }

            // 새로운 타이틀들의 데이터를 JSON 문자열로 변환
            newStoresJson = objectMapper.writeValueAsString(newStores);
            // 만약 저장하려면, 파일이나 데이터베이스에 저장하는 로직 추가
        } catch (IOException e) {
            logger.error("JSON 처리 중 오류 발생: ", e);
        }
        return newStoresJson;
    }

    public ResponseDto<?> processPopUpSearch(String query) {
        String results = fetchNaverSearchResults(query);
        String queryResult = getNewPopupStores(results);

        // convertCategoryAPI 메서드가 리스트를 반환하므로 이를 처리합니다.
        List<PopupStoreDto> convertResults = popUpAiService.convertCategoryAPI(queryResult);

        // convertResults 리스트의 각 요소에 대해 createPopUp 호출
        for (PopupStoreDto convertResult : convertResults) {
            popUpRegisterService.createPopUp(convertResult);
        }
        return getAllPopupStores();
    }

    public ResponseDto<?> searchPopupStores(String searchQuery){
        String results = fetchNaverSearchResults(searchQuery);
        String queryResult = getNewPopupStores(results);

        // convertCategoryAPI 메서드가 리스트를 반환하므로 이를 처리합니다.
        List<PopupStoreDto> convertResults = popUpAiService.convertCategoryAPI(queryResult);

        // convertResults 리스트의 각 요소에 대해 createPopUp 호출
        for (PopupStoreDto convertResult : convertResults) {
            popUpRegisterService.createPopUp(convertResult);
        }

        return getQueryPopupStores(searchQuery);
    }


    public ResponseDto<?> getAllPopupStores(){
        List<PopupStore> optionalPopupStore = popupStoreRepository.findAll();
        return ResponseDto.setSuccessData("팝업 스토어 조회 성공", optionalPopupStore);
    }


    public ResponseDto<?> getQueryPopupStores(String query){
        Optional<PopupStore> optionalPopupStore = popupStoreRepository.findByTitleContaining(query);
        return ResponseDto.setSuccessData("팝업 스토어 조회 성공", optionalPopupStore);
    }

}