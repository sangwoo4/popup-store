package hansung.popupstore.Util;


import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
@RequiredArgsConstructor
public class RedisUtil {

    private final StringRedisTemplate stringRedisTemplate;

    public String getData(String key){
        return stringRedisTemplate.opsForValue().get(key);
    }

    public void setDataExpire(String key, String value, long duration){
        stringRedisTemplate.opsForValue().set(key, value, Duration.ofSeconds(duration));
    }
}
