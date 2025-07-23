package hansung.popupstore.Test;

import hansung.popupstore.Account.Repository.CompanyRepository;
import hansung.popupstore.PopupStore.Repository.PopupStoreRepository;
import hansung.popupstore.Security.TokenUtils;
import hansung.popupstore.Util.RedisUtil;
import hansung.popupstore.dto.*;
import hansung.popupstore.model.*;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class ViewCountTestService {
    private final PopupStoreRepository popupStoreRepository;
    private final RedisUtil redisUtil;

    @Transactional
    public void processViewCountByRedis(Long popupStoreId, String userId) {
        // Long userId;

        String redisKey;
        redisKey = "popupStore: " + popupStoreId + ":user:" + userId;

        String viewRecord = redisUtil.isAlreadyViewed(redisKey);

        if (viewRecord == null) {
        popupStoreRepository.incrementViewCount(popupStoreId);
        redisUtil.setDataExpire(redisKey, "viewd", redisUtil.calculateTimeUntilMidnight());
        }
    }

//    @Transactional
//    public void incrementViewCountAndSetCache(Long popupStoreId, String redisKey){
//        popupStoreRepository.incrementViewCount(popupStoreId);
//        redisUtil.setDataExpire(redisKey, "viewd", redisUtil.calculateTimeUntilMidnight());
//    }

    @Transactional
    public void processViewCountByDb(Long popupStoreId) {
        // Long userId;
            popupStoreRepository.incrementViewCount(popupStoreId);
    }
}