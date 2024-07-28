package hansung.popupstore.Account.service;

import hansung.popupstore.Account.Dto.*;
import hansung.popupstore.Account.Repository.RoleRepository;
import hansung.popupstore.Account.Repository.UserRepository;
import hansung.popupstore.dto.CategoryDto;
import hansung.popupstore.PopupStore.Repository.CategoryRepository;
import hansung.popupstore.Util.ResponseDto;
import hansung.popupstore.Security.TokenProvider;
import hansung.popupstore.dto.UserDto;
import hansung.popupstore.model.Category;
import hansung.popupstore.model.Role;
import hansung.popupstore.model.User;
import hansung.popupstore.Util.PasswordEncoderUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.function.Function;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final TokenProvider tokenProvider;
    private final RoleRepository roleRepository;
    private final CategoryRepository categoryRepository;

    @Transactional
    public ResponseDto<?> userSignUp(UserDto dto) {
        try {
            User user = buildUserEntity(dto);
            userRepository.save(user);

            addDefaultRoleToUser(user);
            saveOrUpdateCategories(dto.getCategories(), user);
            userRepository.save(user);

            return ResponseDto.setSuccessData("회원 생성 성공.", user.getId());
        } catch (Exception e) {
            return ResponseDto.setFailed("회원 생성 실패.");
        }
    }

    private User buildUserEntity(UserDto dto) {
        String hashedPassword = PasswordEncoderUtil.encode(dto.getPassword());
        return User.builder()
                .email(dto.getEmail())
                .password(hashedPassword)
                .birth(dto.getBirth())
                .gender(dto.getGender())
                .nickname(dto.getNickname())
                .phone(dto.getPhone())
                .username(dto.getUsername())
                .build();
    }

    private void addDefaultRoleToUser(User user) {
        Role userRole = roleRepository.findByRole("ROLE_USER")
                .orElseThrow(() -> new RuntimeException("Role not found."));
        user.getRoles().add(userRole);
    }

    private void saveOrUpdateCategories(Set<CategoryDto> categoryDtos, User user) {
        Set<Category> savedCategories = new HashSet<>();
        for (CategoryDto categoryDto : categoryDtos) {
            Optional<Category> existingCategory = categoryRepository.findByCategory(categoryDto.getCategory());
            existingCategory.ifPresent(savedCategories::add);
        }
        user.setCategories(savedCategories);
    }

    public ResponseDto<LoginResponseDto> userLogin(UserLoginDto dto) {
        try {
            Optional<User> userOptional = userRepository.findByEmail(dto.getEmail());
            if (userOptional.isPresent() && isPasswordValid(dto.getPassword(), userOptional.get().getPassword())) {
                String token = tokenProvider.generateToken(dto.getEmail(), 3600);
                return ResponseDto.setSuccessData("로그인에 성공하였습니다.", new LoginResponseDto(token, 3600));
            }
            return ResponseDto.setFailed("입력하신 로그인 정보가 존재하지 않습니다.");
        } catch (Exception e) {
            return ResponseDto.setFailed("데이터베이스 연결에 실패하였습니다.");
        }
    }

    private boolean isPasswordValid(String rawPassword, String storedHashedPassword) {
        return PasswordEncoderUtil.matches(rawPassword, storedHashedPassword);
    }

    public ResponseDto<UserDto> checkEmail(UserDto dto) {
        return checkDuplicateField(dto.getEmail(), "이미 사용중인 email 입니다.", userRepository::findByEmail);
    }

    public ResponseDto<UserDto> checkNick(UserDto dto) {
        return checkDuplicateField(dto.getNickname(), "이미 사용중인 닉네임 입니다.", userRepository::findBynickname);
    }

    public ResponseDto<UserDto> checkPhone(UserDto dto) {
        return checkDuplicateField(dto.getPhone(), "이미 사용중인 번호 입니다.", userRepository::findByPhone);
    }

    private ResponseDto<UserDto> checkDuplicateField(String value, String errorMessage, Function<String, Optional<User>> findUserFunction) {
        if (findUserFunction.apply(value).isPresent()) {
            return ResponseDto.setFailed(errorMessage);
        }
        return ResponseDto.setSuccess("사용 가능한 값 입니다.");
    }

    public String getNicknameByToken(String token) {
        String userEmail = tokenProvider.validateJwt(token);
        return userRepository.findByEmail(userEmail).map(User::getNickname).orElse(null);
    }

    public ResponseDto<List<Category>> getAllCategories(){
        List<Category> allCategories = categoryRepository.findAll();
        return ResponseDto.setSuccessData("카테고리 조회 성공", allCategories);
    }

}