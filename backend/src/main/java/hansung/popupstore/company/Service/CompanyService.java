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
                .title(popup_store.getTitle())
                .address(popup_store.getAddress())
                .roadAddress(popup_store.getRoadAddress())
                .start_date(popup_store.getStart_date())
                .end_date(popup_store.getEnd_date())
                .start_time(popup_store.getStart_time())
                .end_time(popup_store.getEnd_time())
                .telephone(popup_store.getTelephone())
                .subway(popup_store.getSubway())
                .description(popup_store.getDescription())
                .link(popup_store.getLink())
                .mapx(popup_store.getMapx())
                .mapy(popup_store.getMapy())
                .build();
    }
}
