package hansung.popupstore.PopupStore.Controller;

import hansung.popupstore.PopupStore.Dto.*;
import hansung.popupstore.PopupStore.Service.PopupStoreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Controller
public class PopUpAiController {

    // HTTP 요청을 간편하게 처리할 수 있는 클래스
    @Autowired
    private RestTemplate restTemplate;

    public PopupStoreDto invokeFastAPI(@RequestBody PopupStoreDto popupStoreDto) {
        String url = "http://localhost:8000/categorize"; // FastAPI 엔드포인트 URL, 외부 api와 통신

        // 지정된 URL로 POST 요청 전송, 따라서 chatRequestDto에 객체를 전달
        ResponseEntity<PopupStoreDto> responseEntity = restTemplate.postForEntity(url, popupStoreDto, PopupStoreDto.class);
        return responseEntity.getBody();    // 외부 api으로부터 받은 객체 반환
    }

    public String invokeNaverAPI(String aa) {
        System.out.println("aa===================================" + aa);
        String url = "http://localhost:8000/navercategory"; // FastAPI 엔드포인트 URL, 외부 api와 통신

        // HTTP 헤더 설정
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        // HTTP 요청 생성
        HttpEntity<String> requestEntity = new HttpEntity<>(aa, headers);

        // POST 요청
        String bb = restTemplate.postForObject(url, requestEntity, String.class);
        System.out.println("bb------------------------------------" + bb);
        return bb;
    }
}