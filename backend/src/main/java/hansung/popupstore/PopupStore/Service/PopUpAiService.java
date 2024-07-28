package hansung.popupstore.PopupStore.Service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import hansung.popupstore.dto.PopupStoreDto;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestOperations;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Service
public class PopUpAiService {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final RestOperations restTemplate = new RestTemplate();

    // 엔드포인트 URL
//    private static final String CATEGORIZE_URL = "http://localhost:8000/categorize";
    private static final String CATEGORIZE_URL = "http://fastapi-app:8000/categorize";
    //private static final String NAVER_CATEGORY_URL = "http://localhost:8000/navercategory";

    public List<PopupStoreDto> convertCategoryAPI(String queryResult) throws JsonProcessingException {
        // Convert queryResult JSON string to JsonNode
        JsonNode queryNode = objectMapper.readTree(queryResult);

        // Create JSON array and populate it with the converted data
        ArrayNode jsonArray = createJsonArray(queryNode);

        // Convert JSON array to string and send HTTP request
        String response = sendHttpPostRequest(CATEGORIZE_URL, jsonArray);

        // Process the response and update the queryNode
        JsonNode updatedQueryNode = processResponse(response, queryNode);

        // Convert updated JSON node to PopupStoreDto list
        return convertToJson(updatedQueryNode);
    }

    private ArrayNode createJsonArray(JsonNode queryNode) {
        ArrayNode jsonArray = objectMapper.createArrayNode();
        ObjectNode jsonObject = objectMapper.createObjectNode();
        jsonObject.put("title", queryNode.get("title").asText());
        jsonObject.put("categories", queryNode.get("category").asText()); // "categories"로 변환
        jsonObject.put("description", queryNode.get("description").asText());
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