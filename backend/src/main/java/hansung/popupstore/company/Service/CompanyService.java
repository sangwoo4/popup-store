package hansung.popupstore.company.Service;

import hansung.popupstore.company.Dto.CompanyDto;
import hansung.popupstore.company.Repository.PopupStoreRepository;
import hansung.popupstore.model.PopupStore;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class CompanyService {

    @Autowired
    private PopupStoreRepository popup_store_repository;

    @Transactional
    public CompanyDto saveRegister(CompanyDto companyDto) {
        PopupStore popup_store = popup_store_repository.save(companyDto.toEntity());

        if(popup_store == null){
            throw new IllegalStateException("저장하기 실패");
        }
        return CompanyDto.builder()
                .id(popup_store.getId())
                .store_title(popup_store.getStore_title())
                .store_address(popup_store.getStore_address())
                .start_date(popup_store.getStart_date())
                .end_date(popup_store.getEnd_date())
                .start_time(popup_store.getStart_time())
                .end_time(popup_store.getEnd_time())
                .tell(popup_store.getTell())
                .subway(popup_store.getSubway())
                .build();
    }
}
