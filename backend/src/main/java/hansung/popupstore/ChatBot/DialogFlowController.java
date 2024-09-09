package hansung.popupstore.ChatBot;

import com.google.api.gax.rpc.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/chatbot")
public class DialogFlowController {

    private final DialogFlowService dialogFlowService;

    public DialogFlowController(DialogFlowService dialogFlowService) {
        this.dialogFlowService = dialogFlowService;
    }

    @PostMapping("/talk")
    public ResponseEntity<Map<String, String>> getChat(@RequestBody ChatBotRequest request) {
        Map<String, String> responseMap = new HashMap<>();
        try {
            String response = dialogFlowService.detectIntent(request.getText());
            responseMap.put("message", response);
            return ResponseEntity.ok(responseMap);
        } catch (ApiException | IOException e) {
            responseMap.put("error", "서버 오류: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(responseMap);
        } catch (IllegalArgumentException e) {
            responseMap.put("error", "잘못된 요청: " + e.getMessage());
            return ResponseEntity.badRequest().body(responseMap);
        }
    }
}