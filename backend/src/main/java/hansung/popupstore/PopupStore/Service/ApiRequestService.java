package hansung.popupstore.PopupStore.Service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestOperations;
import org.springframework.web.client.RestTemplate;

@Service
public class ApiRequestService {
    private final RestOperations restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public String sendHttpPostRequest(String url, ArrayNode jsonArray) {
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

    public JsonNode parseJson(String requestData) {
        try {
            return objectMapper.readTree(requestData);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("JSON 변환 중 오류 발생", e);
        }
    }

}
