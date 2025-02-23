package hansung.popupstore.PopupStore.Service;

import hansung.popupstore.PopupStore.Repository.PopupStoreRepository;
import hansung.popupstore.Security.JwtService;
import hansung.popupstore.Util.RedisUtil;
import hansung.popupstore.dto.*;
import hansung.popupstore.model.*;
import hansung.popupstore.Account.Repository.CompanyRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class PopupStoreService {
    private final PopupStoreRepository popupStoreRepository;
    private final CompanyRepository companyRepository;
    private final RedisUtil redisUtil;
    private final JwtService jwtService;

    @Transactional
    public PopupStore createPopupStore(PopupStoreDto dto) {
        PopupStore popupStore = buildPopupStoreEntity(dto);
        popupStoreRepository.save(popupStore);
        return popupStore;
    }

    @Transactional
    public PopupStore updatePopupStore(Long id, PopupStoreDto dto) {
        PopupStore popupStore = popupStoreRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("PopupStore not found with id: " + id));
        updatePopupStoreEntity(popupStore, dto);
        popupStoreRepository.save(popupStore);
        return popupStore;
    }

    @Transactional(readOnly = true)
    public PopupStore getPopupStore(Long id) {
        return popupStoreRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("PopupStore not found with id: " + id));
    }

    @Transactional
    public void deletePopupStore(Long id) {
        popupStoreRepository.deleteById(id);
    }

    public PopupStoreDto getPopupStoreDtoById(Long id) {
        PopupStore popupStore = popupStoreRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("PopupStore not found"));
        return convertToDto(popupStore);
    }


    @Transactional
    public void incrementViewCount(Long popupStoreId, String token, HttpServletRequest request) {

        Long userId = jwtService.extractUserIdFromToken(token);
    String redisKey;

    if (userId != null){
        redisKey = "popupStore: " + popupStoreId + ":user:" + userId;
    } else{
        String userIp = request.getHeader("X-Forwarded-For");
        if(userIp == null){
            userIp = request.getRemoteAddr();
        }
        redisKey = "popupStore:" + popupStoreId + ":ip:" + userIp;
    }

    String viewRecord = redisUtil.getData(redisKey);

    if(viewRecord == null){
        redisUtil.setDataExpire(redisKey, "viewd", calculateTimeUntilMidnight());

        popupStoreRepository.incrementViewCount(popupStoreId);
    }
}

    private long calculateTimeUntilMidnight() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime midnight = now.toLocalDate().atStartOfDay().plusDays(1);
        return Duration.between(now, midnight).getSeconds();
    }


    private PopupStore buildPopupStoreEntity(PopupStoreDto dto) {
        Company company = null;
        if (dto.getCompanyId() != null) {
            company = companyRepository.findById(dto.getCompanyId())
                    .orElseThrow(() -> new RuntimeException("Company not found with ID: " + dto.getCompanyId()));

        }

        return PopupStore.builder()
                .title(dto.getTitle())
                .address(dto.getAddress())
                .postCode(dto.getPostCode())
                .detailAddress(dto.getDetailAddress())
                .startDate(dto.getStartDate())
                .roadAddress(dto.getRoadAddress())
                .endDate(dto.getEndDate())
                .telephone(dto.getTelephone())
                .subway(dto.getSubway())
                .description(dto.getDescription())
                .link(dto.getLink())
                .mapx(dto.getMapx())
                .mapy(dto.getMapy())
                .views(0L)
                .currentReservation(dto.getCurrentReservation())
                //.totalReservation(dto.getTotalReservation())
                .detailAddress(dto.getDetailAddress())
                .heartCount(dto.getHeartCount())
                .reservation(dto.getReservation())
                .company(company)
                .build();
    }

    void updatePopupStoreEntity(PopupStore popupStore, PopupStoreDto dto) {
        popupStore.setTitle(dto.getTitle());
        popupStore.setAddress(dto.getAddress());
        popupStore.setPostCode(dto.getPostCode());
        popupStore.setStartDate(dto.getStartDate());
        popupStore.setEndDate(dto.getEndDate());
        popupStore.setRoadAddress(dto.getRoadAddress());
        popupStore.setTelephone(dto.getTelephone());
        popupStore.setReservation(dto.getReservation());
        popupStore.setCurrentReservation(dto.getCurrentReservation());
        //popupStore.setTotalReservation(dto.getTotalReservation());
        popupStore.setSubway(dto.getSubway());
        popupStore.setDescription(dto.getDescription());
        popupStore.setLink(dto.getLink());
        popupStore.setMapx(dto.getMapx());
        popupStore.setMapy(dto.getMapy());
        popupStore.setPostCode(dto.getPostCode());
        popupStore.setDetailAddress(dto.getDetailAddress());
        popupStore.setHeartCount(dto.getHeartCount());
    }

    public PopupStoreDto convertToDto(PopupStore popupStore) {
        Set<StoreDayDto> storeDayDtos = new HashSet<>();
        for (StoreDay storeDay : popupStore.getStoreDays()) {
            storeDayDtos.add(StoreDayDto.builder()
                    .day(storeDay.getDay().getDay())
                    .openTime(storeDay.getOpenTime())
                    .closeTime(storeDay.getCloseTime())
                    .build());
        }

        String companyName = (popupStore.getCompany() != null) ? popupStore.getCompany().getCompanyName() : "회사 없음";
        String companyEmail = (popupStore.getCompany() != null) ? popupStore.getCompany().getEmail() : "회사 없음";


        Set<CategoryDto> categoryDtos = new HashSet<>();
        for (Category category : popupStore.getCategories()) {
            categoryDtos.add(CategoryDto.builder()
                    .category(category.getCategory())
                    .build());
        }

        Set<PopupImageDto> popupImageDtos = new HashSet<>();
        for (PopupImage popupImage : popupStore.getPopupImages()) {
            popupImageDtos.add(PopupImageDto.builder()
                    .id(popupImage.getId())
                    .imageUrl(popupImage.getImageUrl())
                    .build());
        }

        Set<PopupReservationDto> popupReservationDtos = new HashSet<>();
        for (PopupReservation popupReservation : popupStore.getPopupReservations()) {
            popupReservationDtos.add(PopupReservationDto.builder()
                    .id(popupReservation.getId())
                    .day(popupReservation.getDay().getDay())
                    .startTime(popupReservation.getStartTime())
                    .totalReservation(popupReservation.getTotalReservation())
                    .currentReservation(popupReservation.getCurrentReservation())
                    .isReservationEnabled(popupReservation.getIsReservationEnabled())
                    .isReservationFull(popupReservation.getIsReservationFull())
                    .date(popupReservation.getDate())
                    .build());
        }

        return PopupStoreDto.builder()
                .id(popupStore.getId())
                .title(popupStore.getTitle())
                .address(popupStore.getAddress())
                .detailAddress(popupStore.getDetailAddress())
                .postCode(popupStore.getPostCode())
                .startDate(popupStore.getStartDate())
                .endDate(popupStore.getEndDate())
                .telephone(popupStore.getTelephone())
                .roadAddress(popupStore.getRoadAddress())
                .subway(popupStore.getSubway())
                .description(popupStore.getDescription())
                .link(popupStore.getLink())
                .mapx(popupStore.getMapx())
                .mapy(popupStore.getMapy())
                .views(popupStore.getViews())
                .reservation(popupStore.getReservation())
                .currentReservation(popupStore.getCurrentReservation())
                //.totalReservation(popupStore.getTotalReservation())
                .detailAddress(popupStore.getDetailAddress())
                .heartCount(popupStore.getHeartCount())
                .companyName(companyName)
                .companyEmail(companyEmail)
                .categories(categoryDtos)
                .storeDays(storeDayDtos)
                .popupImages(popupImageDtos)
                .popupReservations(popupReservationDtos)
                .build();
    }
}