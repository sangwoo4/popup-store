package hansung.popupstore.PopupStore.Service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import hansung.popupstore.PopupStore.Dto.PopupStoreDto;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestOperations;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.List;

@Service
public class PopUpAiService {

    private final ObjectMapper objectMapper = new ObjectMapper();


    public List<PopupStoreDto> convertCategoryAPI(String queryResult) throws JsonProcessingException {
        String url = "http://localhost:8000/navercategory"; // FastAPI 엔드포인트 URL
        System.out.println("queryResult: " + queryResult);

        // JSON 문자열을 JsonNode로 변환
        JsonNode queryNode = objectMapper.readTree(queryResult);

        // 새로운 JSON 배열 생성
        ArrayNode jsonArray = objectMapper.createArrayNode();

        // JSON 배열에 데이터 추가
        ObjectNode jsonObject = objectMapper.createObjectNode();
        jsonObject.put("title", queryNode.get("title").asText());
        jsonObject.put("categories", queryNode.get("category").asText()); // "categories"로 변환
        jsonObject.put("description", queryNode.get("description").asText());

        jsonArray.add(jsonObject);

        // 변환된 JSON 배열을 문자열로 변환
        String newJsonRequest = objectMapper.writeValueAsString(jsonArray);

        // HTTP 헤더 설정
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        // HTTP 요청 생성
        HttpEntity<String> requestEntity = new HttpEntity<>(newJsonRequest, headers);
        RestOperations restTemplate = new RestTemplate();

        // POST 요청
        String response = restTemplate.postForObject(url, requestEntity, String.class);
        // 응답을 JsonNode로 변환
        JsonNode responseJsonNode = objectMapper.readTree(response);

        // 배열의 첫 번째 요소 추출
        if (responseJsonNode.isArray() && responseJsonNode.size() > 0) {
            JsonNode firstElement = responseJsonNode.get(0);

            // "categories" 필드 추출
            JsonNode categoriesNode = firstElement.get("categories");
            if (categoriesNode != null && categoriesNode.isArray()) {
                // "category"를 "categories"로 대체
                ((ObjectNode) queryNode).remove("category"); // 기존 "category" 필드 삭제
                ((ObjectNode) queryNode).set("categories", categoriesNode);

                // 업데이트된 queryResult를 JSON 문자열로 변환
                String modifiedQueryResult = objectMapper.writeValueAsString(queryNode);

                // JSON 문자열을 PopupStoreDto 객체 리스트로 변환
                return convertToJson(modifiedQueryResult);
            } else {
                throw new RuntimeException("Expected 'categories' field in the response, but found none.");
            }
        } else {
            throw new RuntimeException("Expected an array in the response, but found none.");
        }
    }

    private List<PopupStoreDto> convertToJson(String response) {
        // JSON 문자열을 PopupStoreDto 객체 리스트로 변환
        System.out.println("Response: " + response);
        try {
            // JSON 문자열이 배열인 경우
            if (response.trim().startsWith("[")) {
                return objectMapper.readValue(response, new TypeReference<List<PopupStoreDto>>() {});
            } else {
                // JSON 문자열이 객체인 경우
                PopupStoreDto dto = objectMapper.readValue(response, PopupStoreDto.class);
                return List.of(dto);
            }
        } catch (Exception e) {
            // 예외 처리
            throw new RuntimeException("JSON 변환 중 오류 발생", e);
        }
    }

    public String sendRequestToApi(String requestData) {
        String url = "http://localhost:8000/categorize"; // FastAPI 엔드포인트 URL

        // HTTP 헤더 설정
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        // 요청 데이터를 리스트 형태로 변환
        String requestBody = null;
        try {
            // 리스트 형태로 감싸기
            requestBody = objectMapper.writeValueAsString(Collections.singletonList(requestData));
        } catch (Exception e) {
            System.err.println("JSON 변환 중 오류 발생: " + e.getMessage());
        }

        // HTTP 요청 생성
        HttpEntity<String> requestEntity = new HttpEntity<>(requestBody, headers);

        // RestTemplate 인스턴스 생성
        RestTemplate restTemplate = new RestTemplate();

        // POST 요청 수행
        String response = null;
        try {
            response = restTemplate.postForObject(url, requestEntity, String.class);
        } catch (Exception e) {
            // 예외 처리
            System.err.println("HTTP 요청 중 오류 발생: " + e.getMessage());
        }

        // 서버 응답 확인
        System.out.println("Response from API: " + response);

        return response;
    }

}