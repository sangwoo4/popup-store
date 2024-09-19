package hansung.popupstore.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class PopupReviewResponseDto {
    private String nickname;
    private String reviewText;
    private LocalDateTime localDateTime;
    private String popupTitle;

    public PopupReviewResponseDto(String nickname, String reviewText, LocalDateTime localDateTime, String popupTitle){
        this.nickname = nickname;
        this.reviewText = reviewText;
        this.localDateTime = localDateTime;
        this.popupTitle = popupTitle;
    }
}
