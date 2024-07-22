package hansung.popupstore.Account.service;

import hansung.popupstore.Account.Dto.*;
import hansung.popupstore.Account.Repository.RoleRepository;
import hansung.popupstore.Account.Repository.UserRepository;
import hansung.popupstore.Util.ResponseDto;
import hansung.popupstore.Security.TokenProvider;
import hansung.popupstore.model.Role;
import hansung.popupstore.model.User;
import hansung.popupstore.Util.PasswordEncoderUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final TokenProvider tokenProvider;
    private final RoleRepository roleRepository;

    public ResponseDto<?> userSignUp(UserSignUpDto dto) {
        String hashedPassword = PasswordEncoderUtil.encode(dto.getPassword());

        User user = User.builder()
                .email(dto.getEmail())
                .password(hashedPassword)
                .birth(dto.getBirth())
                .gender(dto.getGender())
                .nickname(dto.getNickname())
                .phone(dto.getPhone())
                .username(dto.getUsername())
                .build();
        System.out.println("user" + user);
        try {
            userRepository.save(user);

            Role userRole = roleRepository.findByRole("ROLE_USER").orElseThrow(() -> new RuntimeException("Role not found."));
            System.out.println("userRole" + userRole);
            user.getRoles().add(userRole);
            userRepository.save(user);

        } catch (Exception e) {
            return ResponseDto.setFailed("회원 생성 실패.");
        }

        return ResponseDto.setSuccess("회원 생성 성공.");
    }

    public ResponseDto<LoginResponseDto> userLogin(UserLoginDto dto) {
        String email = dto.getEmail();
        String password = dto.getPassword();

        try {
            Optional<User> userOptional = userRepository.findByEmail(email);

            if (!userOptional.isPresent()) {
                return ResponseDto.setFailed("입력하신 로그인 정보가 존재하지 않습니다.");
            }

            User user = userOptional.get();
            String storedHashedPassword = user.getPassword();
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

    public String getNicknameByToken(String token) {
        // 토큰의 유효성 검사
        String userEmail = tokenProvider.validateJwt(token);

        // 토큰이 유효한 경우 사용자를 데이터베이스에서 찾음
        Optional<User> userOptional = userRepository.findByEmail(userEmail);
        if (userOptional.isPresent()) {
            // 사용자가 존재하는 경우 닉네임 반환
            return userOptional.get().getNickname();
        } else {
            // 사용자가 존재하지 않는 경우
            return null;
        }
    }
}