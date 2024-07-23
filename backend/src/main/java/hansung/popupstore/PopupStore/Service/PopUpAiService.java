package hansung.popupstore.PopupStore.Service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
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

    public List<PopupStoreDto> convertCategoryAPI(String queryResult) {
        String url = "http://localhost:8000/navercategory"; // FastAPI 엔드포인트 URL

        // HTTP 헤더 설정
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        // HTTP 요청 생성
        HttpEntity<String> requestEntity = new HttpEntity<>(queryResult, headers);

        // POST 요청
        RestOperations restTemplate = new RestTemplate();
        String response = restTemplate.postForObject(url, requestEntity, String.class);

        List<PopupStoreDto> dto = convertToJson(response);
        return dto;
    }

    private List<PopupStoreDto> convertToJson(String response) {
        // JSON 문자열을 PopupStoreDto 객체 리스트로 변환
        System.out.println("Response: " + response);
        ObjectMapper objectMapper = new ObjectMapper();
        try {
            return objectMapper.readValue(response, new TypeReference<List<PopupStoreDto>>() {});
        } catch (Exception e) {
            // 예외 처리
            throw new RuntimeException("JSON 변환 중 오류 발생", e);
        }
    }

    public String sendRequestToApi(String request) {
        String url = "http://localhost:8000/navercategory"; // FastAPI 엔드포인트 URL

        // HTTP 헤더 설정
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        System.out.println("request====================::::::::::::::::::::::::::" + request);
        // HTTP 요청 생성
        HttpEntity<String> requestEntity = new HttpEntity<>(request, headers);

        // POST 요청
        RestOperations restTemplate = new RestTemplate();
        String response = restTemplate.postForObject(url, requestEntity, String.class);

        return response;
    }

}