package hansung.popupstore.Test;

import hansung.popupstore.PopupStore.Service.PopupStoreService;
import hansung.popupstore.Util.ResponseDto;
import hansung.popupstore.dto.UserDto;
import jakarta.servlet.http.HttpServletRequest;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@AllArgsConstructor
@RequestMapping("/test")
public class ViewCountTestController {
    private final ViewCountTestService viewCountTestService;

    @PostMapping("/redis/{id}")
    public ResponseEntity<Void> redis(@PathVariable("id") Long id,
                                                @RequestParam("userId") String userId
    ) {
        viewCountTestService.processViewCountByRedis(id, userId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/db/{id}")
    public ResponseEntity<Void> db(@PathVariable("id") Long id,
                                             @RequestParam("userId") String userid
    ) {
        viewCountTestService.processViewCountByDb(id);
        return new ResponseEntity<>(HttpStatus.OK);
    }
}