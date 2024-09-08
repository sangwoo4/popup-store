package hansung.popupstore.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class PopupReviewResponseDto {
    private String nickname;
    private String reviewText;
    private LocalDateTime localDateTime;

    public PopupReviewResponseDto(String nickname, String reviewText, LocalDateTime localDateTime) {
        this.nickname = nickname;
        this.reviewText = reviewText;
        this.localDateTime = localDateTime;
    }
}
