package hansung.popupstore.company.Controller;

import hansung.popupstore.company.Dto.CompanyDto;
import hansung.popupstore.company.Service.CompanyService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class RegisterController {

    @Autowired
    private CompanyService companyService;

    @PostMapping("/register")
    public ResponseEntity<?> submit(@RequestBody CompanyDto companyDto){
        CompanyDto SaveCompanyDto = companyService.saveRegister(companyDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(SaveCompanyDto);
    }
}
