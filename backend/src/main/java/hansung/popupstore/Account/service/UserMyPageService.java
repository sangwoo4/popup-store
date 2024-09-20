package hansung.popupstore.Account.service;

import hansung.popupstore.Account.Dto.UserMyPageDto;
import hansung.popupstore.Account.Repository.UserMyPageRepository;
import hansung.popupstore.Account.Repository.UserRepository;
import hansung.popupstore.PopupReservation.Service.UserReservationService;
import hansung.popupstore.PopupStore.Repository.CategoryRepository;
import hansung.popupstore.PopupStore.Repository.HeartRepository;
import hansung.popupstore.PopupStore.Service.HeartService;
import hansung.popupstore.PopupStore.Service.PopupReviewService;
import hansung.popupstore.Util.PasswordEncoderUtil;
import hansung.popupstore.Util.ResponseDto;
import hansung.popupstore.dto.CategoryDto;
import hansung.popupstore.dto.HeartDto;
import hansung.popupstore.dto.PopupReviewDto;
import hansung.popupstore.dto.UserDto;
import hansung.popupstore.model.*;
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
    private final UserMyPageRepository userMyPageRepository;
    private final HeartRepository heartRepository;

    private final HeartService heartService;
    private final UserReservationService userReservationService;
    private final PopupReviewService popupReviewService;
    private final PasswordService passwordService;
    private final UserService userService;

    public UserMyPageDto getMyPageInfo(Long userId) {
        // 사용자 조회
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        // 찜 목록, 리뷰 목록, 예약 목록 가져오기
        List<HeartDto> hearts = heartService.getHeartedPopupStores(userId).getData();
        List<PopupReviewDto> reviews = popupReviewService.getReviewsByUserId(userId);
        List<Map<String, Object>> reservations = userReservationService.userReservationList(userId).getData();

        // 모든 찜, 리뷰, 예약 개수 계산
        int allHearts = hearts.size();
        int allReviews = reviews.size();
        int allReservations = reservations.size();

        // 기존에 해당 유저의 마이페이지 정보가 있는지 확인
        UserMyPage userMyPage = userMyPageRepository.findByUser(user);

        if (userMyPage == null) {
            // 기존 데이터가 없으면 새로 생성
            userMyPage = new UserMyPage();
            userMyPage.setUser(user);
        }

        // 데이터 업데이트
        userMyPage.setAllHearts(allHearts);
        userMyPage.setAllReviews(allReviews);
        userMyPage.setAllReservations(allReservations);

        // 찜 설정 (기존 hearts 리스트를 비우고 다시 추가)
        userMyPage.getHearts().clear();
        for (HeartDto heartDto : hearts) {
            Heart heartEntity = heartRepository.findById(heartDto.getId()).orElse(new Heart()); // 기존 Heart를 조회 또는 새로 생성
            PopupStore popupStore = new PopupStore();
            popupStore.setId(heartDto.getPopupStoreId());
            heartEntity.setPopupStore(popupStore);
            heartEntity.setUser(user);
            heartEntity.setUserMyPage(userMyPage);
            userMyPage.getHearts().add(heartEntity);
        }

        // 리뷰 설정 (기존 reviews 리스트를 비우고 다시 추가)
        userMyPage.getPopupReviews().clear();
        for (PopupReviewDto review : reviews) {
            PopupReview popupReview = new PopupReview();
            popupReview.setId(review.getPopupStoreId());
            popupReview.setReviewText(review.getReviewText());
            popupReview.setUserMyPage(userMyPage);
            userMyPage.getPopupReviews().add(popupReview);
        }

        // 예약 설정 (기존 reservations 리스트를 비우고 다시 추가)
        userMyPage.getUserReservations().clear();
        for (Map<String, Object> reservation : reservations) {
            UserReservation userReservation = new UserReservation();
            userReservation.setId(Long.parseLong(reservation.get("id").toString()));
            PopupReservation popupReservation = new PopupReservation();
            popupReservation.setId(Long.parseLong(reservation.get("popupReservationId").toString()));
            userReservation.setPopupReservation(popupReservation);
            userReservation.setUser(user);
            userReservation.setUserMyPage(userMyPage);
            userMyPage.getUserReservations().add(userReservation);
        }

        // 테이블에 저장 (기존 데이터가 있으면 업데이트)
        userMyPageRepository.save(userMyPage);

        // DTO 반환
        return new UserMyPageDto(
                user.getNickname(),
                user.getEmail(),
                reservations,
                hearts,
                reviews,
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