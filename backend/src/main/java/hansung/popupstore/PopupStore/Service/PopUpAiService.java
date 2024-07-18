package hansung.popupstore.PopupStore.Service;

import com.fasterxml.jackson.databind.ObjectMapper;
import hansung.popupstore.PopupStore.Dto.PopupStoreDto;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestOperations;
import org.springframework.web.client.RestTemplate;

@Service
public class PopUpAiService {

    public PopupStoreDto convertCategoryAPI(String queryResult) {
        String url = "http://localhost:8000/navercategory"; // FastAPI 엔드포인트 URL, 외부 API와 통신

        // HTTP 헤더 설정
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        // HTTP 요청 생성
        HttpEntity<String> requestEntity = new HttpEntity<>(queryResult, headers);

        // POST 요청
        RestOperations restTemplate = new RestTemplate();
        String response = restTemplate.postForObject(url, requestEntity, String.class);

        return convertToJson(response);
    }

    private PopupStoreDto convertToJson(String response) {
        // JSON 문자열을 PopupStoreDto 객체로 변환
        ObjectMapper objectMapper = new ObjectMapper();
        try {
            return objectMapper.readValue(response, PopupStoreDto.class);
        } catch (Exception e) {
            // 예외 처리 (필요시 적절히 처리)
            throw new RuntimeException("JSON 변환 중 오류 발생", e);
        }
    }
}