package hansung.popupstore.Account.service;

import hansung.popupstore.Account.Dto.*;
import hansung.popupstore.Account.Repository.CompanyRepository;
import hansung.popupstore.ResponseDto;
import hansung.popupstore.Security.TokenProvider;
import hansung.popupstore.Account.Repository.RoleRepository;
import hansung.popupstore.Account.Repository.UserRepository;
import hansung.popupstore.model.Company;
import hansung.popupstore.model.Role;
import hansung.popupstore.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final TokenProvider tokenProvider;
    private final RoleRepository roleRepository;
    private final CompanyRepository companyRepository;

    public ResponseDto<?> userSignUp(UserSignUpDto dto) {
        BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
        String hashedPassword = passwordEncoder.encode(dto.getPassword());

        User user = User.builder()
                .email(dto.getEmail())
                .password(hashedPassword)
                .birth(dto.getBirth())
                .gender(dto.getGender())
                .nickname(dto.getNickname())
                .phone(dto.getPhone())
                .username(dto.getUsername())
                .build();

        try {
            userRepository.save(user);

            Role userRole = roleRepository.findByRole("ROLE_USER").orElseThrow(() -> new RuntimeException("Role not found."));
            user.getRoles().add(userRole);
            userRepository.save(user);

        } catch (Exception e) {
            return ResponseDto.setFailed("회원 생성 실패.");
        }

        return ResponseDto.setSuccess("회원 생성 성공.");
    }

    public ResponseDto<?> companySignUp(CompanySignUpDto dto) {

        BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
        String hashedPassword = passwordEncoder.encode(dto.getPassword());

        Company company = Company.builder()
                .password(hashedPassword)
                .companyName(dto.getCompanyName())
                .email(dto.getCompanyEmail())
                .build();

        try {

            companyRepository.save(company);

            Role companyRole = roleRepository.findByRole("ROLE_COMPANY").orElseThrow(() -> new RuntimeException("Role not found."));
            company.getRoles().add(companyRole);
            companyRepository.save(company);

        } catch (Exception e) {
            return ResponseDto.setFailed("회원 생성 실패.");
        }

        return ResponseDto.setSuccess("회원 생성 성공.");
    }

    public ResponseDto<UserSignUpDto> checkEmail(UserSignUpDto dto) {
        String email = dto.getEmail();

        Optional<User> userOptional = userRepository.findByEmail(email);
        if (userOptional.isPresent()) {
            return ResponseDto.setFailed("이미 사용중인 email 입니다.");
        }
        return ResponseDto.setSuccess("사용 가능한 email 입니다.");
    }

    public ResponseDto<UserSignUpDto> checkNick(UserSignUpDto dto) {
        String nickName = dto.getNickname();

        Optional<User> userOptional = userRepository.findBynickname(nickName);
        if (userOptional.isPresent()) {
            return ResponseDto.setFailed("이미 사용중인 닉네임 입니다.");
        }
        return ResponseDto.setSuccess("사용 가능한 닉네임 입니다.");
    }

    public ResponseDto<UserSignUpDto> checkPhone(UserSignUpDto dto) {
        String phone = dto.getPhone();

        Optional<User> userOptional = userRepository.findByPhone(phone);
        if (userOptional.isPresent()) {
            return ResponseDto.setFailed("이미 사용중인 번호 입니다.");
        }
        return ResponseDto.setSuccess("사용 가능한 번호 입니다.");
    }

    public ResponseDto<LoginResponseDto> login(LoginDto dto) {
        String email = dto.getEmail();
        String password = dto.getPassword();

        try {
            Optional<User> userOptional = userRepository.findByEmail(email);

            if (!userOptional.isPresent()) {
                return ResponseDto.setFailed("입력하신 로그인 정보가 존재하지 않습니다.");
            }

            User user = userOptional.get();
            String storedHashedPassword = user.getPassword();
            BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
            boolean passwordMatches = passwordEncoder.matches(password, storedHashedPassword);

            if (!passwordMatches) {
                return ResponseDto.setFailed("입력하신 로그인 정보가 존재하지 않습니다.");
            }

            int exprTime = 3600;
            String token = tokenProvider.generateToken(email, exprTime);
            System.out.println("생성된 토큰: " + token);

            LoginResponseDto loginResponseDto = new LoginResponseDto(token, exprTime);
            return ResponseDto.setSuccessData("로그인에 성공하였습니다.", loginResponseDto);
        } catch (Exception e) {
            return ResponseDto.setFailed("데이터베이스 연결에 실패하였습니다.");
        }
    }
}