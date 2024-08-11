package hansung.popupstore.PopupStore.Service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import hansung.popupstore.Account.Dto.UserRecommendDto;
import hansung.popupstore.Util.ResponseDto;
import hansung.popupstore.dto.PopupStoreDto;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestOperations;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;

@Service
@AllArgsConstructor
public class PopUpStoreAiService {

    private final ObjectMapper objectMapper = new ObjectMapper();

    private final PopupStoreService popupStoreService;
    private final ApiRequestService apiRequestService;
    private final JsonProcessingService jsonProcessingService;
    private final DtoConversionService dtoConversionService;
    private static final String CATEGORIZE_URL = "http://fastapi-app:8000/categorize";
    private static final String DISTANCE_RECOMMEND_URL = "http://fastapi-app:8000/recommend/distance";
    private static final String CATEGORY_RECOMMEND_URL = "http://fastapi-app:8000/recommend/category";



    public List<PopupStoreDto> convertCategoryAPI(String queryResult) throws JsonProcessingException {
        JsonNode queryNode = objectMapper.readTree(queryResult);
        ArrayNode jsonArray = jsonProcessingService.createJsonArrayCategory(queryNode);
        String response = apiRequestService.sendHttpPostRequest(CATEGORIZE_URL, jsonArray);
        JsonNode updatedQueryNode = jsonProcessingService.processResponse(response, queryNode);
        return dtoConversionService.convertToJson(updatedQueryNode);
    }

    public ResponseDto<List<PopupStoreDto>> convertRecommendPopupByCategory(UserRecommendDto userRecommendDto) throws JsonProcessingException {
        JsonNode queryNode = objectMapper.valueToTree(userRecommendDto);
        ArrayNode jsonArray = jsonProcessingService.createJsonArrayRecommendByCategory(queryNode);
        String response = apiRequestService.sendHttpPostRequest(CATEGORY_RECOMMEND_URL, jsonArray);
        JsonNode responseJsonNode = objectMapper.readTree(response);
        List<PopupStoreDto> popupStoreDtos = dtoConversionService.convertRecommendations(response);
        return ResponseDto.setSuccessData("추천 팝업 스토어 정보를 성공적으로 로드했습니다.", popupStoreDtos);
    }

    public ResponseDto<List<PopupStoreDto>> convertRecommendPopupByDistance(UserRecommendDto userRecommendDto) throws JsonProcessingException {
        JsonNode queryNode = objectMapper.valueToTree(userRecommendDto);
        ArrayNode jsonArray = jsonProcessingService.createJsonArrayRecommendByDistance(queryNode);
        String response = apiRequestService.sendHttpPostRequest(DISTANCE_RECOMMEND_URL, jsonArray);
        JsonNode responseJsonNode = objectMapper.readTree(response);

        List<PopupStoreDto> popupStoreDtos = new ArrayList<>();

        if (responseJsonNode.isArray()) {
            for (JsonNode recommendation : responseJsonNode) {
                Long id = recommendation.get("id").asLong();
                double distance = recommendation.get("distance").asDouble();
                PopupStoreDto popupStoreDto = popupStoreService.getPopupStoreDtoById(id);
                popupStoreDto.setDistance(distance);

                popupStoreDtos.add(popupStoreDto);
            }
        }

        return ResponseDto.setSuccessData("추천 팝업 스토어 정보를 성공적으로 로드했습니다.", popupStoreDtos);
    }

    public String sendRequestToApi(String requestData) {
        // Convert requestData string to JsonNode
        JsonNode jsonNode = apiRequestService.parseJson(requestData);

        // Create JSON array and add JsonNode
        ArrayNode jsonArray = objectMapper.createArrayNode();
        jsonArray.add(jsonNode);

        // Send HTTP POST request
        return apiRequestService.sendHttpPostRequest(CATEGORIZE_URL, jsonArray);
    }
}