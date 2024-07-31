package hansung.popupstore.Account.controller;

import hansung.popupstore.Account.service.CompanyService;
import hansung.popupstore.Security.TokenProvider;
import hansung.popupstore.Util.ResponseDto;
import hansung.popupstore.model.PopupStore;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/company")
public class CompanyController {

    private final CompanyService companyService;
    private final TokenProvider tokenProvider;
    @GetMapping("/popuplist")
    public ResponseEntity<ResponseDto<?>> getCompanyPosts(@RequestHeader("Authorization") String authorizationHeader) {
        String actualToken = authorizationHeader.replace("Bearer ", "");

        // 토큰 검증 및 주체 정보 추출
        String companyIdStr = tokenProvider.validateJwt(actualToken);
        System.out.println("companyIdStr" + companyIdStr);
        if (companyIdStr == null) {
            return new ResponseEntity<>(ResponseDto.setFailed("유효하지 않은 토큰입니다."), HttpStatus.UNAUTHORIZED);
        }

        Long companyId = Long.parseLong(companyIdStr);
        ResponseDto<List<PopupStore>> result = companyService.getCompanyPosts(companyId);
        return new ResponseEntity<>(result, HttpStatus.OK);
    }
    }
