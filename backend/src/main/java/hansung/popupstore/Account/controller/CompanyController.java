package hansung.popupstore.Account.controller;

import hansung.popupstore.Account.Dto.CompanyLoginDto;
import hansung.popupstore.Account.service.CompanyService;
import hansung.popupstore.Util.ResponseDto;
import hansung.popupstore.dto.CompanyDto;
import hansung.popupstore.model.PopupStore;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/company")
public class CompanyController {

    private final CompanyService companyService;

    @GetMapping("/popuplist")
    public ResponseEntity<ResponseDto<?>> getCompanyPosts(Authentication authentication) {
        String companyIdStr = (String) authentication.getPrincipal();
        Long companyId = Long.parseLong(companyIdStr);
        ResponseDto<List<PopupStore>> result = companyService.getCompanyPosts(companyId);
        return new ResponseEntity<>(result, HttpStatus.OK);
    }

    @GetMapping("/companyname")
    public ResponseEntity<String> companyName(@RequestHeader("Authorization") String authorizationHeader) {
        String token = authorizationHeader.replace("Bearer ", "");
        String companyName = companyService.getCompanyNameByToken(token);
        return ResponseEntity.ok(companyName);
    }

    @PostMapping("/signup")
    public ResponseDto<?> companySignUp(@RequestBody CompanyDto requestBody){
        ResponseDto<?> result = companyService.companySignUp(requestBody);
        return result;
    }

    @PostMapping("/login")
    public ResponseDto<?> companyLogin(@RequestBody CompanyLoginDto requestBody){
        ResponseDto<?> result = companyService.companyLogin(requestBody);
        return result;
    }

    @PostMapping("company/signup/check-email")
    public ResponseDto<?> companyCheckEmail(@RequestBody CompanyDto requestBody){
        ResponseDto<?> result = companyService.checkCompanyEmail(requestBody);
        return result;
    }

    @PostMapping("company/signup/check-companyid")
    public ResponseDto<?> checkCompanyId(@RequestBody CompanyDto requestBody){
        ResponseDto<?> result = companyService.checkCompanyId(requestBody);
        return result;
    }

}