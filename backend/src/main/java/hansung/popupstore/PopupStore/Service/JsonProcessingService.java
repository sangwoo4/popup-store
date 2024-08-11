package hansung.popupstore.PopupStore.Service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.stereotype.Service;

@Service
public class JsonProcessingService {

    private final ObjectMapper objectMapper = new ObjectMapper();



    public ArrayNode createJsonArrayCategory(JsonNode queryNode) {
        ArrayNode jsonArray = objectMapper.createArrayNode();
        ObjectNode jsonObject = objectMapper.createObjectNode();
        jsonObject.put("title", queryNode.get("title").asText());
        jsonObject.put("categories", queryNode.get("category").asText()); // "categories"로 변환
        jsonObject.put("description", queryNode.get("description").asText());
        jsonArray.add(jsonObject);
        return jsonArray;
    }


    public ArrayNode createJsonArrayRecommendByDistance(JsonNode queryNode) {
        ArrayNode jsonArray = objectMapper.createArrayNode();
        ObjectNode jsonObject = objectMapper.createObjectNode();

        JsonNode mapxNode = queryNode.get("mapx");
        JsonNode mapyNode = queryNode.get("mapy");
        JsonNode idNode = queryNode.get("id");

        jsonObject.put("id", idNode.asText());
        jsonObject.put("mapx", mapxNode.asText());
        jsonObject.put("mapy", mapyNode.asText());

        jsonArray.add(jsonObject);
        return jsonArray;
    }

    public ArrayNode createJsonArrayRecommendByCategory(JsonNode queryNode) {
        ArrayNode jsonArray = objectMapper.createArrayNode();
        ObjectNode jsonObject = objectMapper.createObjectNode();

        // JsonNode에서 필요한 필드만 추출
        JsonNode categoriesNode = queryNode.get("categories"); // categories 필드 가져오기
        JsonNode idNode = queryNode.get("id");

        // id 필드 추가
        jsonObject.put("id", idNode.asInt());

        // categories 필드를 문자열로 변환
        if (categoriesNode.isArray()) {
            StringBuilder categoriesBuilder = new StringBuilder();
            for (JsonNode categoryNode : categoriesNode) {
                if (categoriesBuilder.length() > 0) {
                    categoriesBuilder.append(", ");
                }
                categoriesBuilder.append(categoryNode.get("category").asText());
            }
            jsonObject.put("categories", categoriesBuilder.toString());
        } else {
            jsonObject.put("categories", categoriesNode.asText());
        }

        // JSON 배열에 객체 추가
        jsonArray.add(jsonObject);
        return jsonArray;
    }

    public JsonNode processResponse(String response, JsonNode queryNode) throws JsonProcessingException {
        JsonNode responseJsonNode = objectMapper.readTree(response);

        if (responseJsonNode.isArray() && responseJsonNode.size() > 0) {
            JsonNode firstElement = responseJsonNode.get(0);
            JsonNode categoriesNode = firstElement.get("categories");

            if (categoriesNode != null && categoriesNode.isArray()) {
                ((ObjectNode) queryNode).remove("category");
                ((ObjectNode) queryNode).set("categories", categoriesNode);
                return queryNode;
            } else {
                throw new RuntimeException("Expected 'categories' field in the response, but found none.");
            }
        } else {
            throw new RuntimeException("Expected an array in the response, but found none.");
        }
    }

}
