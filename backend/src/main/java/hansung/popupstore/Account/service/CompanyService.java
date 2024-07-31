package hansung.popupstore.Account.service;

import hansung.popupstore.Account.Dto.*;
import hansung.popupstore.Account.Repository.CompanyRepository;
import hansung.popupstore.Security.TokenProvider;
import hansung.popupstore.Util.ResponseDto;
import hansung.popupstore.dto.CompanyDto;
import hansung.popupstore.model.Company;
import hansung.popupstore.model.PopupStore;
import hansung.popupstore.model.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CompanyService {

    private final CompanyRepository companyRepository;
    private final TokenProvider tokenProvider;
    private final RoleService roleService;
    private final PasswordService passwordService;

    public ResponseDto<?> companySignUp(CompanyDto dto) {
        String hashedPassword = passwordService.encodePassword(dto.getPassword());

        Company company = Company.builder()
                .password(hashedPassword)
                .companyName(dto.getCompanyName())
                .companyId(dto.getCompanyId())
                .managerName(dto.getManagerName())
                .address(dto.getAddress())
                .email(dto.getEmail())
                .detailAddress(dto.getDetailAddress())
                .postCode(dto.getPostCode())
                .build();

        try {
            companyRepository.save(company);

            Role companyRole = roleService.getRoleByRoleName("ROLE_COMPANY");
            company.getRoles().add(companyRole);
            companyRepository.save(company);

            return ResponseDto.setSuccess("회원 생성 성공.");
        } catch (Exception e) {
            return ResponseDto.setFailed("회원 생성 실패.");
        }
    }

    public ResponseDto<LoginResponseDto> companyLogin(CompanyLoginDto dto) {
        String email = dto.getEmail();
        String password = dto.getPassword();
        Optional<Company> companyOptional = companyRepository.findByEmail(email);

        if (!companyOptional.isPresent()) {
            return ResponseDto.setFailed("입력하신 로그인 정보가 존재하지 않습니다.");
        }

        Company company = companyOptional.get();
        boolean passwordMatches = passwordService.matchesPassword(password, company.getPassword());

        if (!passwordMatches) {
            return ResponseDto.setFailed("입력하신 로그인 정보가 존재하지 않습니다.");
        }

        Set<Long> roleIds = companyRepository.findRoleIdsByCompanyId(company.getId());
        Set<Role> roles = roleService.getRolesByIds(roleIds);
        Set<String> roleNames = roleService.getRoleNames(roles);

        String token = tokenProvider.generateToken(company.getId(), roleNames, 3600);

        return ResponseDto.setSuccessData("로그인에 성공하였습니다.", new LoginResponseDto(token, 3600));
    }

    public ResponseDto<CompanyDto> checkCompanyEmail(CompanyDto dto) {
        String email = dto.getEmail();

        Optional<Company> companyOptional = companyRepository.findByEmail(email);
        if (companyOptional.isPresent()) {
            return ResponseDto.setFailed("이미 사용중인 email 입니다.");
        }
        return ResponseDto.setSuccess("사용 가능한 email 입니다.");
    }

    public ResponseDto<CompanyDto> checkCompanyId(CompanyDto dto) {
        String checkCompanyId = dto.getCompanyId();

        Optional<Company> companyOptional = companyRepository.findByCompanyId(checkCompanyId);
        if (companyOptional.isPresent()) {
            return ResponseDto.setFailed("이미 사용중인 사업자번호 입니다.");
        }
        return ResponseDto.setSuccess("사용 가능한 사업자번호 입니다.");
    }

    public ResponseDto<List<PopupStore>> getCompanyPosts(Long companyId) {
        Optional<Company> companyOptional = companyRepository.findById(companyId);
        if (!companyOptional.isPresent()) {
            return ResponseDto.setFailed("존재하지 않는 기업입니다.");
        }

        Company company = companyOptional.get();
        Set<PopupStore> popupStoresSet = company.getPopupStores();

        // Set을 List로 변환
        List<PopupStore> popupStoresList = popupStoresSet.stream().collect(Collectors.toList());

        return ResponseDto.setSuccessData("기업 게시물 조회 성공", popupStoresList);
    }
}