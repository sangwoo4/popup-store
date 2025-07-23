package hansung.popupstore.PopupStore.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import hansung.popupstore.PopupStore.Repository.PopupStoreRepository;
import hansung.popupstore.model.PopupStore;
import lombok.RequiredArgsConstructor;
import org.jsoup.Jsoup;
import org.jsoup.safety.Whitelist;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SearchDataProcessor{

    public static String removeHtmlTags(String html) {
        return Jsoup.clean(html, Whitelist.none());
    }

    private static final Logger logger = LoggerFactory.getLogger(PopupStoreSearchService.class);
    private final ObjectMapper objectMapper;
    private final PopupStoreRepository popupStoreRepository;

    public List<String> getNewPopupStores(String result) {
        Set<String> existingTitles = popupStoreRepository.findAll().stream()
                .map(PopupStore::getTitle)
                .collect(Collectors.toSet());
        Set<String> titleSet = new HashSet<>(existingTitles);
        List<String> newStores = new ArrayList<>(); // 변경된 부분

        try {
            JsonNode rootNode = objectMapper.readTree(result);
            JsonNode itemsNode = rootNode.path("items");
            Iterator<JsonNode> iterator = itemsNode.iterator();

            while (iterator.hasNext()) {
                JsonNode itemNode = iterator.next();
                String originalTitle = itemNode.path("title").asText();
                String cleanedTitle = removeHtmlTags(originalTitle);

                if (!titleSet.contains(cleanedTitle)) {
                    ObjectNode newItemNode = itemNode.deepCopy();
                    newItemNode.put("title", cleanedTitle);
                    String nodeJson = objectMapper.writeValueAsString(newItemNode); // JSON 문자열로 변환
                    newStores.add(nodeJson); // 새로운 노드를 리스트에 추가
                    titleSet.add(cleanedTitle); // 중복 방지를 위해 추가
                }
            }

        } catch (IOException e) {
            logger.error("JSON 처리 중 오류 발생: ", e);
        }

        return newStores; // 문자열 리스트로 반환
    }

}
