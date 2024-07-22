package hansung.popupstore.Account.service;

import hansung.popupstore.Account.Dto.*;
import hansung.popupstore.Account.Repository.CompanyRepository;
import hansung.popupstore.Account.Repository.RoleRepository;
import hansung.popupstore.Util.ResponseDto;
import hansung.popupstore.Security.TokenProvider;
import hansung.popupstore.model.Company;
import hansung.popupstore.model.Role;
import hansung.popupstore.Util.PasswordEncoderUtil;
import hansung.popupstore.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CompanyService {

    private final CompanyRepository companyRepository;
    private final TokenProvider tokenProvider;
    private final RoleRepository roleRepository;

    public ResponseDto<?> companySignUp(CompanySignUpDto dto) {
        String hashedPassword = PasswordEncoderUtil.encode(dto.getPassword());

        Company company = Company.builder()
                .password(hashedPassword)
                .companyName(dto.getCompanyName())
                .companyId(dto.getCompanyId())
                .managerName(dto.getManagerName())
                .address(dto.getAddress())
                .email(dto.getEmail())
                .detailAddress(dto.getDetailAddress())
                .postcode(dto.getPostcode())
                .build();

        try {
            System.out.println("repositotutiodautioatiou");
            companyRepository.save(company);
            System.out.println("repsi22222222222222");
            Role companyRole = roleRepository.findByRole("ROLE_COMPANY")
                    .orElseThrow(() -> new RuntimeException("Role not found."));
            System.out.println("companyRole" + companyRole);
            company.getRoles().add(companyRole);
            companyRepository.save(company);

        } catch (Exception e) {
            return ResponseDto.setFailed("회원 생성 실패.");
        }

        return ResponseDto.setSuccess("회원 생성 성공.");
    }

    public ResponseDto<LoginResponseDto> companyLogin(CompanyLoginDto dto) {
        String email = dto.getEmail();
        String password = dto.getPassword();

        try {
            Optional<Company> companyOptional = companyRepository.findByEmail(email);

            if (!companyOptional.isPresent()) {
                return ResponseDto.setFailed("입력하신 로그인 정보가 존재하지 않습니다.");
            }

            Company company = companyOptional.get();
            String storedHashedPassword = company.getPassword();
            boolean passwordMatches = PasswordEncoderUtil.matches(password, storedHashedPassword);

            if (!passwordMatches) {
                return ResponseDto.setFailed("입력하신 로그인 정보가 존재하지 않습니다.");
            }

            int exprTime = 3600;
            String token = tokenProvider.generateToken(email, exprTime);

            LoginResponseDto loginResponseDto = new LoginResponseDto(token, exprTime);
            return ResponseDto.setSuccessData("로그인에 성공하였습니다.", loginResponseDto);
        } catch (Exception e) {
            return ResponseDto.setFailed("데이터베이스 연결에 실패하였습니다.");
        }
    }

    public ResponseDto<CompanySignUpDto> checkCompanyEmail(CompanySignUpDto dto) {
        String email = dto.getEmail();

        Optional<Company> companyOptional = companyRepository.findByEmail(email);
        if (companyOptional.isPresent()) {
            return ResponseDto.setFailed("이미 사용중인 email 입니다.");
        }
        return ResponseDto.setSuccess("사용 가능한 email 입니다.");
    }

    public ResponseDto<CompanySignUpDto> checkCompanyId(CompanySignUpDto dto) {
        String checkCompanyId = dto.getCompanyId();

        Optional<Company> companyOptional = companyRepository.findByCompanyId(checkCompanyId);
        if (companyOptional.isPresent()) {
            return ResponseDto.setFailed("이미 사용중인 사업자번호 입니다.");
        }
        return ResponseDto.setSuccess("사용 가능한 사업자번호 입니다.");
    }
}