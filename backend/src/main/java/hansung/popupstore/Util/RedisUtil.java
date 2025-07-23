package hansung.popupstore.Util;


import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class RedisUtil {

    private final StringRedisTemplate stringRedisTemplate;

    public String isAlreadyViewed(String key) {
        return stringRedisTemplate.opsForValue().get(key);
    }

    public void setDataExpire(String key, String value, long duration) {
        stringRedisTemplate.opsForValue().set(key, value, Duration.ofSeconds(duration));
    }

    public long calculateTimeUntilMidnight() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime midnight = now.toLocalDate().atStartOfDay().plusDays(1);
        return Duration.between(now, midnight).getSeconds();
    }

}

