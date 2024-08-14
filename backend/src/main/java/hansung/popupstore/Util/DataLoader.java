package hansung.popupstore.Util;

import hansung.popupstore.PopupStore.Repository.CategoryRepository;
import hansung.popupstore.model.Category;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataLoader {

    @Bean
    ApplicationRunner initData(CategoryRepository categoryRepository) {
        return args -> {
            if (categoryRepository.count() == 0) {
                categoryRepository.save(new Category("화장품"));
                categoryRepository.save(new Category("캐릭터"));
                categoryRepository.save(new Category("도서/음반"));
                categoryRepository.save(new Category("패션"));
                categoryRepository.save(new Category("인테리어"));
                categoryRepository.save(new Category("전시/체험"));
                categoryRepository.save(new Category("향수"));
                categoryRepository.save(new Category("음식"));
                categoryRepository.save(new Category("음료"));
                categoryRepository.save(new Category("주류"));
                categoryRepository.save(new Category("장난감"));
                categoryRepository.save(new Category("문구"));
                categoryRepository.save(new Category("가정"));
                categoryRepository.save(new Category("생활용품"));
                categoryRepository.save(new Category("스포츠"));
                categoryRepository.save(new Category("게임"));
                categoryRepository.save(new Category("전자제품"));
                categoryRepository.save(new Category("인물"));
                categoryRepository.save(new Category("건강/웰빙"));
                categoryRepository.save(new Category("자동차"));
                categoryRepository.save(new Category("식물"));
                categoryRepository.save(new Category("여행/레저"));
                categoryRepository.save(new Category("드라마/영화"));
                categoryRepository.save(new Category("가전제품"));
                categoryRepository.save(new Category("기타행사"));
            }
        };
    }
}