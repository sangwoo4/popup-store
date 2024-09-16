package hansung.popupstore.Account.service;

import hansung.popupstore.Account.Dto.UserMyPageDto;
import hansung.popupstore.Account.Repository.UserRepository;
import hansung.popupstore.PopupReservation.Service.UserReservationService;
import hansung.popupstore.PopupStore.Repository.CategoryRepository;
import hansung.popupstore.PopupStore.Service.HeartService;
import hansung.popupstore.PopupStore.Service.PopupReviewService;
import hansung.popupstore.Util.PasswordEncoderUtil;
import hansung.popupstore.Util.ResponseDto;
import hansung.popupstore.dto.CategoryDto;
import hansung.popupstore.dto.HeartDto;
import hansung.popupstore.dto.PopupReviewDto;
import hansung.popupstore.dto.UserDto;
import hansung.popupstore.model.Category;
import hansung.popupstore.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserMyPageService {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final HeartService heartService;
    private final UserReservationService userReservationService;
    private final PopupReviewService popupReviewService;
    private final PasswordService passwordService;
    private final UserService userService;

    // 마이페이지 정보 조회
    public UserMyPageDto getMyPageInfo(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        List<HeartDto> hearts = heartService.getHeartedPopupStores(userId).getData();
        List<PopupReviewDto> reviews = popupReviewService.getReviewsByUserId(userId);
        List<Map<String, Object>> reservations = userReservationService.userReservationList(userId).getData();

        int allHearts = hearts.size();
        int allReviews = reviews.size();
        int allReservations = reservations.size();

        List<HeartDto> heartDtos = hearts.stream()
                .map(heart -> new HeartDto(heart.getId(), null, heart.getPopupStoreId()))
                .collect(Collectors.toList());

        List<PopupReviewDto> reviewDtos = reviews.stream()
                .map(review -> new PopupReviewDto(review.getPopupStoreId(), null, review.getReviewText(), review.getLocalDateTime()))
                .collect(Collectors.toList());

        List<Map<String, Object>> reservationDtos = reservations.stream()
                .map(reservation -> {
                    reservation.put("userId", null);
                    return reservation;
                })
                .collect(Collectors.toList());

        return new UserMyPageDto(
                user.getNickname(),
                user.getEmail(),
                reservationDtos,
                heartDtos,
                reviewDtos,
                allHearts,
                allReviews,
                allReservations
        );
    }

    // 사용자 정보 조회
    public UserDto getUserInfo(Long userId) {
        User user = findUserById(userId);

        Set<CategoryDto> categoryDtos = user.getCategories().stream()
                .map(category -> new CategoryDto(category.getId(), category.getCategory()))
                .collect(Collectors.toSet());

        return UserDto.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .nickname(user.getNickname())
                .birth(user.getBirth())
                .gender(user.getGender())
                .phone(user.getPhone())
                .username(user.getUsername())
                .postcode(user.getPostcode())
                .address(user.getAddress())
                .detailAddress(user.getDetailAddress())
                .mapx(user.getMapx())
                .mapy(user.getMapy())
                .roadAddress(user.getRoadAddress())
                .categories(categoryDtos)
                .build();
    }

    // 회원 정보 수정
    public ResponseDto<?> updateUserInfo(Long userId, UserDto userDto) {
        User user = findUserById(userId);

        ResponseDto<?> validationResponse = validateUserFields(userDto);
        if (!validationResponse.isResult()) {
            return validationResponse;
        }

        updateUserFields(user, userDto);
        updateUserCategories(user, userDto.getCategories());

        userRepository.save(user);

        return ResponseDto.setSuccess("회원 정보가 성공적으로 수정되었습니다.");
    }

    // 회원 탈퇴 처리
    public void deleteUser(Long userId) {
        User user = findUserById(userId);

        user.getCategories().clear();
        user.getRoles().clear();

        userRepository.save(user);

        userRepository.delete(user);
    }

    // 비밀번호 일치 여부 확인
    public boolean matchPassword(Long userId, String rawPassword) {
        User user = findUserById(userId);
        return PasswordEncoderUtil.matches(rawPassword, user.getPassword());
    }

    // userId로 사용자 조회 로직을 메서드로 추출
    private User findUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
    }

    // 사용자 정보 업데이트 메서드
    private void updateUserFields(User user, UserDto userDto) {
        user.setNickname(userDto.getNickname());
        user.setAddress(userDto.getAddress());
        user.setDetailAddress(userDto.getDetailAddress());
        user.setMapx(userDto.getMapx());
        user.setMapy(userDto.getMapy());
        user.setPostcode(userDto.getPostcode());
        user.setRoadAddress(userDto.getRoadAddress());

        if (userDto.getPassword() != null && !userDto.getPassword().isEmpty()) {
            String hashedPassword = passwordService.encodePassword(userDto.getPassword());
            user.setPassword(hashedPassword);
        }
    }

    // 유효성 검사 메서드
    private ResponseDto<?> validateUserFields(UserDto userDto) {
        ResponseDto<UserDto> nickCheck = userService.checkNick(userDto);
        if (!nickCheck.isResult()) {
            return nickCheck;
        }

        ResponseDto<UserDto> phoneCheck = userService.checkPhone(userDto);
        if (!phoneCheck.isResult()) {
            return phoneCheck;
        }

        return ResponseDto.setSuccess("유효성 검사 통과");
    }

    // 카테고리 업데이트 처리, user_category 테이블만 수정
    private void updateUserCategories(User user, Set<CategoryDto> newCategories) {
        user.getCategories().clear();
        userRepository.save(user);

        for (CategoryDto categoryDto : newCategories) {
            Category category = categoryRepository.findByCategory(categoryDto.getCategory())
                    .orElseGet(() -> categoryRepository.save(new Category(categoryDto.getCategory())));
            user.getCategories().add(category);
        }

        userRepository.save(user);
    }
}