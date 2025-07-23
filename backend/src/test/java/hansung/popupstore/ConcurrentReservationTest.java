package hansung.popupstore;

import hansung.popupstore.PopupReservation.Service.UserReservationService;
import hansung.popupstore.Util.ResponseDto;
import hansung.popupstore.dto.UserReservationDto;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
@Transactional // 테스트 끝난 후 DB 변경 사항 롤백
public class ConcurrentReservationTest {

    @Autowired
    private UserReservationService userReservationService;

    @Test
    public void testConcurrentReservation() throws Exception {
        int threadCount = 6;
        int maxCapacity = 3;
        ExecutorService executorService = Executors.newFixedThreadPool(threadCount);

        List<Future<ResponseDto<Map<String, Object>>>> futures = new ArrayList<>();

        for (int i = 0; i < 6; i++) {
            final Long userId = (long) (i + 1);
            futures.add(executorService.submit(() -> {
                try {
                    UserReservationDto dto = new UserReservationDto(null, 6L, userId, 1);
                    return userReservationService.userReservation(userId, dto); // 토큰 없이 호출
                } catch (OptimisticLockingFailureException e) {
                    // 예외가 발생하면 실패 메시지를 반환
                    return ResponseDto.setFailed("예약 실패: 동시성 문제 발생");
                }
            }));
        }

        int successCount = 0;
        for (Future<ResponseDto<Map<String, Object>>> future : futures) {
            ResponseDto<Map<String, Object>> response = future.get();
            if ("예약 성공".equals(response.getMessage())) {
                successCount++;
            }
        }

        executorService.shutdown();

        System.out.println("성공한 예약 수: " + successCount);
        assertTrue(successCount <= maxCapacity, "예약 가능 인원을 초과함!");
    }
}