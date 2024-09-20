package hansung.popupstore.Account.Dto;

import hansung.popupstore.dto.HeartDto;
import hansung.popupstore.dto.PopupReviewDto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserMyPageDto {
    private String nickname;
    private String email;
    private List<Map<String, Object>> reservations;
    private List<HeartDto> hearts;
    private List<PopupReviewDto> reviews;
    private List<String> categories;  // 카테고리 리스트 추가
    private int allHearts;
    private int allReviews;
    private int allReservations;
}