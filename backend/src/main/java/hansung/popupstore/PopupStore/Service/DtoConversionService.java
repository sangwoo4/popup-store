package hansung.popupstore.PopupStore.Service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import hansung.popupstore.dto.PopupStoreDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DtoConversionService {
    private final ObjectMapper objectMapper;
    private final JsonProcessingService jsonProcessingService;
    private final PopupStoreService popupStoreService;
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

    public List<PopupStoreDto> convertRecommendations(String response) throws JsonProcessingException {
        JsonNode responseJsonNode = objectMapper.readTree(response);
        List<PopupStoreDto> popupStoreDtos = new ArrayList<>();

        if (responseJsonNode.isArray()) {
            for (JsonNode recommendation : responseJsonNode) {
                Long id = recommendation.get("id").asLong();
                PopupStoreDto popupStoreDto = popupStoreService.getPopupStoreDtoById(id);
                popupStoreDtos.add(popupStoreDto);
            }
        }
        return popupStoreDtos;
    }

}
