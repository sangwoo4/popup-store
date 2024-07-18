package hansung.popupstore.PopupStore.Dto;

import lombok.Data;

import java.util.List;

@Data
public class ChatResponseDto {
    // 객체를 리스트로 설정, AI가 분류한 카테고리 정보를 저장
    private List<Category> categories;

    @Data
    public static class Category {
        // 카테고리의 이름을 저장
        private String name;
    }
}
