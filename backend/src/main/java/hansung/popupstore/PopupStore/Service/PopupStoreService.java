package hansung.popupstore.PopupStore.Service;

<<<<<<< HEAD
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
=======
import hansung.popupstore.PopupStore.Repository.PopupStoreRepository;
import hansung.popupstore.dto.CategoryDto;
import hansung.popupstore.dto.PopupImageDto;
import hansung.popupstore.dto.PopupStoreDto;
import hansung.popupstore.dto.StoreDayDto;
import hansung.popupstore.model.*;
import hansung.popupstore.Account.Repository.CompanyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
>>>>>>> 950e11a771cbb0c4716d1425a55e11d4b684fce1

import java.util.HashSet;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class PopupStoreService {
<<<<<<< HEAD
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
=======
    private final PopupStoreRepository popupStoreRepository;
    private final CompanyRepository companyRepository;

    @Transactional
    public PopupStore createPopupStore(PopupStoreDto dto) {
        PopupStore popupStore = buildPopupStoreEntity(dto);
        popupStoreRepository.save(popupStore);
        return popupStore;
>>>>>>> 950e11a771cbb0c4716d1425a55e11d4b684fce1
    }

    @Transactional
    public PopupStore updatePopupStore(Long id, PopupStoreDto dto) {
        PopupStore popupStore = popupStoreRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("PopupStore not found with id: " + id));
        updatePopupStoreEntity(popupStore, dto);
        popupStoreRepository.save(popupStore);
        return popupStore;
    }

    @Transactional(readOnly = true)
    public PopupStore getPopupStore(Long id) {
        return popupStoreRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("PopupStore not found with id: " + id));
    }

    @Transactional
    public void deletePopupStore(Long id) {
        popupStoreRepository.deleteById(id);
    }

    public PopupStoreDto getPopupStoreDtoById(Long id) {
        PopupStore popupStore = popupStoreRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("PopupStore not found"));
        return convertToDto(popupStore);
    }

    private PopupStore buildPopupStoreEntity(PopupStoreDto dto) {
        Company company = null;
        if (dto.getCompanyId() != null) {
            company = companyRepository.findById(dto.getCompanyId())
                    .orElseThrow(() -> new RuntimeException("Company not found with ID: " + dto.getCompanyId()));
        }


        return PopupStore.builder()
                .title(dto.getTitle())
                .address(dto.getAddress())
                .postCode(dto.getPostCode())
                .detailAddress(dto.getDetailAddress())
                .startDate(dto.getStartDate())
                .roadAddress(dto.getRoadAddress())
                .endDate(dto.getEndDate())
                .telephone(dto.getTelephone())
                .subway(dto.getSubway())
                .description(dto.getDescription())
                .link(dto.getLink())
                .mapx(dto.getMapx())
                .mapy(dto.getMapy())
                .company(company)
                .build();
    }

    void updatePopupStoreEntity(PopupStore popupStore, PopupStoreDto dto) {
        popupStore.setTitle(dto.getTitle());
        popupStore.setAddress(dto.getAddress());
        popupStore.setPostCode(dto.getPostCode());
        popupStore.setStartDate(dto.getStartDate());
        popupStore.setEndDate(dto.getEndDate());
        popupStore.setRoadAddress(dto.getRoadAddress());
        popupStore.setTelephone(dto.getTelephone());
        popupStore.setSubway(dto.getSubway());
        popupStore.setDescription(dto.getDescription());
        popupStore.setLink(dto.getLink());
        popupStore.setMapx(dto.getMapx());
        popupStore.setMapy(dto.getMapy());
    }

    public PopupStoreDto convertToDto(PopupStore popupStore) {
        Set<StoreDayDto> storeDayDtos = new HashSet<>();
        for (StoreDay storeDay : popupStore.getStoreDays()) {
            storeDayDtos.add(StoreDayDto.builder()
                    .day(storeDay.getDay().getDay())
                    .openTime(storeDay.getOpenTime())
                    .closeTime(storeDay.getCloseTime())
                    .build());
        }

<<<<<<< HEAD
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
=======
        String companyName = (popupStore.getCompany() != null) ? popupStore.getCompany().getCompanyName() : "회사 없음";
>>>>>>> 950e11a771cbb0c4716d1425a55e11d4b684fce1


        Set<CategoryDto> categoryDtos = new HashSet<>();
        for (Category category : popupStore.getCategories()) {
            categoryDtos.add(CategoryDto.builder()
                    .category(category.getCategory())
                    .build());
        }

        Set<PopupImageDto> popupImageDtos = new HashSet<>();
        for (PopupImage popupImage : popupStore.getPopupImages()) {
            popupImageDtos.add(PopupImageDto.builder()
                    .id(popupImage.getId())
                    .imageUrl(popupImage.getImageUrl())
                    .build());
        }

        return PopupStoreDto.builder()
                .id(popupStore.getId())
                .title(popupStore.getTitle())
                .address(popupStore.getAddress())
                .detailAddress(popupStore.getDetailAddress())
                .postCode(popupStore.getPostCode())
                .startDate(popupStore.getStartDate())
                .endDate(popupStore.getEndDate())
                .telephone(popupStore.getTelephone())
                .roadAddress(popupStore.getRoadAddress())
                .subway(popupStore.getSubway())
                .description(popupStore.getDescription())
                .link(popupStore.getLink())
                .mapx(popupStore.getMapx())
                .mapy(popupStore.getMapy())
                .companyName(companyName)
                .categories(categoryDtos)
                .storeDays(storeDayDtos)
                .popupImages(popupImageDtos)
                .build();
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