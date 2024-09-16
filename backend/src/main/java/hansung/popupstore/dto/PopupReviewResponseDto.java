package hansung.popupstore.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class PopupReviewResponseDto {
    private String nickname;
    private String reviewText;
    private LocalDateTime localDateTime;
    private Long id;

    public PopupReviewResponseDto(String nickname, String reviewText, LocalDateTime localDateTime, Long id){
        this.nickname = nickname;
        this.reviewText = reviewText;
        this.localDateTime = localDateTime;
        this.id = id;
    }
}
