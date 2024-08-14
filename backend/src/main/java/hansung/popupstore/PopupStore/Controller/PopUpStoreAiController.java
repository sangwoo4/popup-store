package hansung.popupstore.PopupStore.Controller;


import com.fasterxml.jackson.core.JsonProcessingException;
import hansung.popupstore.Account.Dto.UserRecommendDto;
import hansung.popupstore.Account.service.UserService;
import hansung.popupstore.PopupStore.Service.PopUpStoreAiService;
import hansung.popupstore.Security.TokenUtils;
import hansung.popupstore.Util.ResponseDto;
import hansung.popupstore.dto.PopupStoreDto;
import hansung.popupstore.model.PopupStore;
import hansung.popupstore.model.User;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@AllArgsConstructor
@RequestMapping("/popup/ai")
public class PopUpStoreAiController {
    private final TokenUtils tokenUtils;
    private final UserService userService;
    private final PopUpStoreAiService popUpAiService;
    @PostMapping("/category")
    public String category(@RequestBody String request) {
        String result = popUpAiService.sendRequestToApi(request);
        return result;
    }


    @GetMapping("/recommend/category")
    public ResponseEntity<ResponseDto<?>> recommendByCategory(@RequestHeader("Authorization") String token) throws JsonProcessingException {
        String jwtToken = tokenUtils.extractToken(token);
        Long userId = tokenUtils.extractUserIdFromToken(jwtToken);
        UserRecommendDto userRecommendDto =  userService.userCategoryAndAddressFindByUserId(userId);
        ResponseDto<List<PopupStoreDto>> result = popUpAiService.convertRecommendPopupByCategory(userRecommendDto);
        return new ResponseEntity<>(result, HttpStatus.OK);
    }

    @GetMapping("/recommend/distance")
    public ResponseEntity<ResponseDto<?>> recommendByDistance(@RequestHeader("Authorization") String token) throws JsonProcessingException {
        String jwtToken = tokenUtils.extractToken(token);
        Long userId = tokenUtils.extractUserIdFromToken(jwtToken);
        UserRecommendDto userRecommendDto =  userService.userCategoryAndAddressFindByUserId(userId);
        ResponseDto<List<PopupStoreDto>> result = popUpAiService.convertRecommendPopupByDistance(userRecommendDto);
        return new ResponseEntity<>(result, HttpStatus.OK);
    }
}
