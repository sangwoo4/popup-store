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
import hansung.popupstore.model.User;
import org.aspectj.weaver.patterns.PerThisOrTargetPointcutVisitor;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestOperations;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;

@Service
public class PopUpStoreAiService {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final RestOperations restTemplate = new RestTemplate();
    private final PopupStoreService popupStoreService;
    // 엔드포인트 URL
    //private static final String CATEGORIZE_URL = "http://localhost:8000/categorize";
    private static final String CATEGORIZE_URL = "http://fastapi-app:8000/categorize";
    //private static final String NAVER_CATEGORY_URL = "http://localhost:8000/navercategory";
    private static final String RECOMMEND_URL = "http://localhost:8000/recommend";

    public PopUpStoreAiService(PopupStoreService popupStoreService) {
        this.popupStoreService = popupStoreService;
    }

    public List<PopupStoreDto> convertCategoryAPI(String queryResult) throws JsonProcessingException {
        JsonNode queryNode = objectMapper.readTree(queryResult);
        ArrayNode jsonArray = createJsonArrayCategory(queryNode);
        String response = sendHttpPostRequest(CATEGORIZE_URL, jsonArray);
        System.out.println("response ======" + response);
        JsonNode updatedQueryNode = processResponse(response, queryNode);
        return convertToJson(updatedQueryNode);
    }

    public ResponseDto<PopupStoreDto> convertRecommendPopupByCategory(UserRecommendDto userRecommendDto) throws JsonProcessingException {
        JsonNode queryNode = objectMapper.valueToTree(userRecommendDto);
        ArrayNode jsonArray = createJsonArrayRecommendByCategory(queryNode);

        String response = sendHttpPostRequest(RECOMMEND_URL, jsonArray);
        JsonNode responseJsonNode = objectMapper.readTree(response);

        List<PopupStoreDto> popupStoreDtos = new ArrayList<>();

        // Parse the JSON array directly
        if (responseJsonNode.isArray()) {
            for (JsonNode recommendation : responseJsonNode) {
                Long id = recommendation.get("id").asLong();
                // Create PopupStoreDto for each id
                PopupStoreDto popupStoreDto = popupStoreService.getPopupStoreDtoById(id);

                popupStoreDtos.add(popupStoreDto);
            }
        }

        return (ResponseDto<PopupStoreDto>) popupStoreDtos;
    }

    public ResponseDto<PopupStoreDto> convertRecommendPopupByDistance(UserRecommendDto userRecommendDto) throws JsonProcessingException {
        JsonNode queryNode = objectMapper.valueToTree(userRecommendDto);
        ArrayNode jsonArray = createJsonArrayRecommendByDistance(queryNode);


        String response = sendHttpPostRequest(RECOMMEND_URL, jsonArray);
        JsonNode responseJsonNode = objectMapper.readTree(response);

        List<PopupStoreDto> popupStoreDtos = new ArrayList<>();

        // Parse the JSON array directly
        if (responseJsonNode.isArray()) {
            for (JsonNode recommendation : responseJsonNode) {
                Long id = recommendation.get("id").asLong();
                double distance = recommendation.get("distance").asDouble();

                // Create PopupStoreDto for each id
                PopupStoreDto popupStoreDto = popupStoreService.getPopupStoreDtoById(id);
                popupStoreDto.setDistance(distance);

                popupStoreDtos.add(popupStoreDto);
            }
        }

        return (ResponseDto<PopupStoreDto>) popupStoreDtos;
    }


    private ArrayNode createJsonArrayCategory(JsonNode queryNode) {
        ArrayNode jsonArray = objectMapper.createArrayNode();
        ObjectNode jsonObject = objectMapper.createObjectNode();
        jsonObject.put("title", queryNode.get("title").asText());
        jsonObject.put("categories", queryNode.get("category").asText()); // "categories"로 변환
        jsonObject.put("description", queryNode.get("description").asText());
        jsonArray.add(jsonObject);
        return jsonArray;
    }

    private ArrayNode createJsonArrayRecommendByCategory(JsonNode queryNode) {
        ArrayNode jsonArray = objectMapper.createArrayNode();
        ObjectNode jsonObject = objectMapper.createObjectNode();

        // JsonNode에서 필요한 필드만 추출
        JsonNode categoriesNode = queryNode.get("categories"); // categories 필드 가져오기
        JsonNode idNode = queryNode.get("id");

        // mapx, mapy, id 필드 추가
        jsonObject.put("id", idNode.asText());

        // categories 필드를 문자열로 변환
        if (categoriesNode.isArray()) {
            StringBuilder categoriesBuilder = new StringBuilder();
            for (JsonNode categoryNode : categoriesNode) {
                // 카테고리 값을 문자열로 추가
                if (categoriesBuilder.length() > 0) {
                    categoriesBuilder.append(", ");
                }
                categoriesBuilder.append(categoryNode.get("category").asText());
            }
            jsonObject.put("categories", categoriesBuilder.toString());
        } else {
            jsonObject.put("categories", categoriesNode.asText());
        }

        // JSON 배열에 객체 추가
        jsonArray.add(jsonObject);
        return jsonArray;
    }

    private ArrayNode createJsonArrayRecommendByDistance(JsonNode queryNode) {
        ArrayNode jsonArray = objectMapper.createArrayNode();
        ObjectNode jsonObject = objectMapper.createObjectNode();

        JsonNode mapxNode = queryNode.get("mapx");
        JsonNode mapyNode = queryNode.get("mapy");
        JsonNode idNode = queryNode.get("id");

        jsonObject.put("id", idNode.asText());
        jsonObject.put("mapx", mapxNode.asText());
        jsonObject.put("mapy", mapyNode.asText());

        jsonArray.add(jsonObject);
        return jsonArray;
    }

    private String sendHttpPostRequest(String url, ArrayNode jsonArray) {
        String requestBody = null;
        try {
            requestBody = objectMapper.writeValueAsString(jsonArray);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("JSON 변환 중 오류 발생", e);
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<String> requestEntity = new HttpEntity<>(requestBody, headers);

        try {
            return restTemplate.postForObject(url, requestEntity, String.class);
        } catch (Exception e) {
            throw new RuntimeException("HTTP 요청 중 오류 발생", e);
        }
    }



    private JsonNode processResponse(String response, JsonNode queryNode) throws JsonProcessingException {
        JsonNode responseJsonNode = objectMapper.readTree(response);

        if (responseJsonNode.isArray() && responseJsonNode.size() > 0) {
            JsonNode firstElement = responseJsonNode.get(0);
            JsonNode categoriesNode = firstElement.get("categories");

            if (categoriesNode != null && categoriesNode.isArray()) {
                ((ObjectNode) queryNode).remove("category");
                ((ObjectNode) queryNode).set("categories", categoriesNode);
                return queryNode;
            } else {
                throw new RuntimeException("Expected 'categories' field in the response, but found none.");
            }
        } else {
            throw new RuntimeException("Expected an array in the response, but found none.");
        }
    }

    private List<PopupStoreDto> convertToJson(JsonNode jsonNode) {
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

    public String sendRequestToApi(String requestData) {
        // Convert requestData string to JsonNode
        JsonNode jsonNode = parseJson(requestData);

        // Create JSON array and add JsonNode
        ArrayNode jsonArray = objectMapper.createArrayNode();
        jsonArray.add(jsonNode);

        // Send HTTP POST request
        return sendHttpPostRequest(CATEGORIZE_URL, jsonArray);
    }

    private JsonNode parseJson(String requestData) {
        try {
            return objectMapper.readTree(requestData);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("JSON 변환 중 오류 발생", e);
        }
    }
}