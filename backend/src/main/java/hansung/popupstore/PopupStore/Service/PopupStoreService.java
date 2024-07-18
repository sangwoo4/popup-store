package hansung.popupstore.PopupStore.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import hansung.popupstore.PopupStore.Controller.PopUpAiController;
import hansung.popupstore.PopupStore.Dto.*;
import hansung.popupstore.PopupStore.Repository.CategoryRepository;
import hansung.popupstore.PopupStore.Repository.PopupStoreRepository;
import hansung.popupstore.model.Category;
import hansung.popupstore.model.PopupStore;
import lombok.RequiredArgsConstructor;
import org.jsoup.Jsoup;
import org.jsoup.safety.Whitelist;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
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
    private CategoryRepository categoryRepository;
    private PopUpAiController popUpAiController;

    @Value("${naver.client.id}")
    private String clientId;
    @Value("${naver.client.secret}")
    private String clientSecret;

    // FastAPI URL 설정
    @Value("$(fastApi.url}")
    private String fastApiUrl;

    @Autowired
    public PopupStoreService(PopupStoreRepository popupStoreRepository, ObjectMapper objectMapper,
                             CategoryRepository categoryRepository, PopUpAiController popUpAiController) {
        this.popupStoreRepository = popupStoreRepository;
        this.objectMapper = objectMapper;
        this.categoryRepository = categoryRepository;
        this.popUpAiController = popUpAiController;
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

    @Transactional
    public String getNewPopupStores(String result) {
        Set<String> existingTitles = popupStoreRepository.findAll().stream()
                .map(PopupStore::getTitle)
                .collect(Collectors.toSet());
        Set<String> titleSet = new HashSet<>(existingTitles);
        List<PopupStore> storesToSave = new ArrayList<>();
        List<JsonNode> newStores = new ArrayList<>();


        String test = null;
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

            // 새로운 타이틀들의 데이터를 JSON 문자열로 변환
            String newStoresJson = objectMapper.writeValueAsString(newStores);
            System.out.println("New Stores JSON: " + newStoresJson);
            test = popUpAiController.invokeNaverAPI(newStoresJson);
            System.out.println("test=========================" + test);
            // 만약 저장하려면, 파일이나 데이터베이스에 저장하는 로직 추가

        } catch (IOException e) {
            logger.error("JSON 처리 중 오류 발생: ", e);
        }
        return test;
    }

//    @Transactional
//    public void getNewPopupStores(String result) {
//        // 기존에 저장된 팝업 스토어 제목들을 조회
//        Set<String> existingTitles = popupStoreRepository.findAll().stream()
//                .map(PopupStore::getTitle)
//                .collect(Collectors.toSet());
//        Set<String> titleSet = new HashSet<>(existingTitles);   // 제목 중복 확인을 위한 Set
//        List<PopupStore> storesToSave = new ArrayList<>();      // 저장할 팝업 스토어 목록
//        List<NaverRequestDto> newStores = new ArrayList<>();    // FastAPI로 전송할 새로운 팝업 스토어 데이터
//
//        try {
//            JsonNode rootNode = objectMapper.readTree(result);
//            JsonNode itemsNode = rootNode.path("items");
//            Iterator<JsonNode> var7 = itemsNode.iterator();
//            while (var7.hasNext()) {
//                JsonNode itemNode = var7.next();
//                String originalTitle = itemNode.path("title").asText();
//                String cleanedTitle = removeHtmlTags(originalTitle);    // HTML 태그 제거
//                if (!titleSet.contains(cleanedTitle)) {                 // 제목 중복 확인
//                    // 새로운 팝업 스토어 데이터 생성
//                    NaverRequestDto naverRequestDto = new NaverRequestDto(
//                            cleanedTitle,
//                            itemNode.path("link").asText(),
//                            itemNode.path("category").asText(),
//                            itemNode.path("description").asText(),
//                            itemNode.path("telephone").asText(),
//                            itemNode.path("address").asText(),
//                            itemNode.path("roadAddress").asText(),
//                            itemNode.path("mapx").asText(),
//                            itemNode.path("mapy").asText()
//                    );
//                    newStores.add(naverRequestDto); // 새로운 데이터 리스트에 추가
//                    titleSet.add(cleanedTitle);     // 제목 Set에 추가
//                }
//            }
//
//            // FastAPI 서버로 데이터 전송
//            NaverResponseDto[] responseBody = popUpAiController.invokeNaverAPI(newStores);
//
//            if (responseBody != null) {
//                for (NaverResponseDto naverResponseDto : responseBody) {
//                    if (naverResponseDto.getCategories() != null) {
//                        // 팝업 스토어 엔티티 생성
//                        PopupStore popupStore = new PopupStore();
//                        popupStore.setTitle(naverResponseDto.getTitle());
//                        popupStore.setAddress(naverResponseDto.getAddress());
//                        popupStore.setRoadAddress(naverResponseDto.getRoadAddress());
//                        popupStore.setTelephone(naverResponseDto.getTelephone());
//                        popupStore.setDescription(naverResponseDto.getDescription());
//                        popupStore.setLink(naverResponseDto.getLink());
//                        popupStore.setMapx(naverResponseDto.getMapx());
//                        popupStore.setMapy(naverResponseDto.getMapy());
//
//                        // 카테고리 처리
//                        Set<Category> savedCategories = saveAiCategories(naverResponseDto.getCategories());
//                        System.out.println("savedCategories===================================" + savedCategories);
//                        popupStore.setCategories(savedCategories);
//
//                        // PopupStore 엔티티에 저장
//                        storesToSave.add(popupStore);
//                    }
//                }
//                popupStoreRepository.saveAll(storesToSave); // 저장할 팝업 스토어들 DB에 저장
//                logger.info("총 {}개의 팝업 스토어를 저장했습니다.", storesToSave.size());
//            }
//
//        } catch (IOException e) {
//            logger.error("JSON 처리 중 오류 발생: ", e);
//        }
//    }

    public List<PopupStore> getAllPopupStores() {
        return this.popupStoreRepository.findAll();
    }

    public Optional<PopupStore> searchPopupStores(String query) {
        return this.popupStoreRepository.findByTitleContaining(query);
    }

//    // AI가 선정한 카테고리 저장
//    private Set<Category> saveAiCategories(List<NaverResponseDto.Category> categories) {
//        Set<Category> savedCategories = new HashSet<>();
//        for (NaverResponseDto.Category aiCategory : categories) {
//            Optional<Category> existingCategory = categoryRepository.findByName(aiCategory.getName());
//            savedCategories.add(existingCategory.orElseGet(() -> {
//                Category category = new Category();
//                category.setName(aiCategory.getName());
//                return categoryRepository.save(category);
//            }));
//        }
//        return savedCategories;
//    }
}