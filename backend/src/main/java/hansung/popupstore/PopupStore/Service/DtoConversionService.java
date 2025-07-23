package hansung.popupstore.PopupStore.Service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import hansung.popupstore.PopupStore.Repository.PopupStoreRepository;
import hansung.popupstore.dto.*;
import hansung.popupstore.model.PopupStore;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DtoConversionService {
    private final ObjectMapper objectMapper;
    private final JsonProcessingService jsonProcessingService;
    private final PopupStoreService popupStoreService;
    private final PopupStoreRepository popupStoreRepository;
    public List<PopupStoreDto> convertToJson(JsonNode jsonNode) {
        try {
            String jsonString = objectMapper.writeValueAsString(jsonNode);
            if (jsonString.trim().startsWith("[")) {
                return objectMapper.readValue(jsonString, new TypeReference<List<PopupStoreDto>>() {});
            } else {
                PopupStoreDto dto = objectMapper.readValue(jsonString, PopupStoreDto.class);
                return List.of(dto);
            }
        } catch (Exception e) {
            throw new RuntimeException("JSON 변환 중 오류 발생", e);
        }
    }

//    public List<PopupStoreResponseDto> convertCategoryRecommendations(String response) throws JsonProcessingException {
//        JsonNode responseJsonNode = objectMapper.readTree(response);
//        List<PopupStoreResponseDto> popupStoreDtos = new ArrayList<>();
//
//        if (responseJsonNode.isArray()) {
//            for (JsonNode recommendation : responseJsonNode) {
//                // JSON 응답에서 팝업 ID 추출
//                Long id = recommendation.has("id") ? recommendation.get("id").asLong() : null;
//
//                // 팝업 ID로 팝업 세부 정보를 조회
//                Optional<PopupStore> popupStoreOptional = popupStoreRepository.findById(id);
//                // Optional을 List로 변환
//                List<PopupStore> popupStores = popupStoreOptional
//                        .map(Collections::singletonList) // 값이 있으면 리스트로 변환
//                        .orElseGet(Collections::emptyList); // 값이 없으면 빈 리스트 반환
//
//                popupStoreDtos = PopupStoreMapper.toDtoList(popupStores);
//            }
//        }
//        return popupStoreDtos;
//    }

    public List<PopupStoreResponseDto> convertCategoryRecommendations(String response) throws JsonProcessingException {
        JsonNode responseJsonNode = objectMapper.readTree(response);
        List<PopupStoreResponseDto> popupStoreDtos = new ArrayList<>();

        if (responseJsonNode.isArray()) {
            for (JsonNode recommendation : responseJsonNode) {
                // JSON 응답에서 팝업 ID 추출
                Long id = recommendation.has("id") ? recommendation.get("id").asLong() : null;

                // 팝업 ID로 팝업 세부 정보를 조회
                Optional<PopupStore> popupStoreOptional = popupStoreRepository.findById(id);
                List<PopupStore> popupStores = popupStoreOptional
                        .map(Collections::singletonList) // 값이 있으면 리스트로 변환
                        .orElseGet(Collections::emptyList); // 값이 없으면 빈 리스트 반환

                // PopupStore를 DTO로 변환
                List<PopupStoreResponseDto> dtos = PopupStoreMapper.toDtoList(popupStores);
                popupStoreDtos.addAll(dtos);
            }
        }
        return popupStoreDtos;
    }

    public List<PopupStoreDistanceResponseDto> convertDistanceRecommendations(String response) throws JsonProcessingException {
        JsonNode responseJsonNode = objectMapper.readTree(response);
        List<PopupStoreDistanceResponseDto> popupStoreDtos = new ArrayList<>();

        if (responseJsonNode.isArray()) {
            for (JsonNode recommendation : responseJsonNode) {
                // JSON 응답에서 팝업 ID와 거리 추출
                Long id = recommendation.has("id") ? recommendation.get("id").asLong() : null;
                double distance = recommendation.has("distance") ? recommendation.get("distance").asDouble() : 0.0;

                // 팝업 ID로 팝업 세부 정보를 조회
                Optional<PopupStore> popupStoreOptional = popupStoreRepository.findById(id);
                List<PopupStore> popupStores = popupStoreOptional
                        .map(Collections::singletonList) // 값이 있으면 리스트로 변환
                        .orElseGet(Collections::emptyList); // 값이 없으면 빈 리스트 반환

                // PopupStore가 존재하는 경우
                if (!popupStores.isEmpty()) {
                    PopupStore popupStore = popupStores.get(0); // 리스트에서 첫 번째 팝업 스토어를 가져옴

                    // CategoryDto 리스트 생성
                    List<CategoryDto> categoryDtos = popupStore.getCategories().stream()
                            .map(category -> new CategoryDto(category.getId(), category.getCategory()))
                            .collect(Collectors.toList());

                    // PopupImageDto 리스트 생성
                    List<PopupImageDto> popupImageDtos = popupStore.getPopupImages().stream()
                            .map(image -> new PopupImageDto(image.getId(), image.getImageUrl(), image.getPopupStore() != null ? image.getPopupStore().getId() : null))
                            .collect(Collectors.toList());

                    // PopupStoreDistanceResponseDto 객체 생성
                    PopupStoreDistanceResponseDto popupStoreDto = new PopupStoreDistanceResponseDto(
                            popupStore.getId(),
                            popupStore.getTitle(),
                            categoryDtos, // CategoryDto 리스트 추가
                            popupImageDtos, // PopupImageDto 리스트 추가
                            distance
                    );

                    // 리스트에 추가
                    popupStoreDtos.add(popupStoreDto);
                }
            }
        }
        return popupStoreDtos;
    }
}
