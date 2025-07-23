package hansung.popupstore.ChatBot;

import com.google.api.gax.core.FixedCredentialsProvider;
import com.google.api.gax.rpc.ApiException;
import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.dialogflow.v2.*;
import hansung.popupstore.Account.Repository.UserRepository;
import hansung.popupstore.model.Category;
import hansung.popupstore.model.User;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.io.InputStream;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DialogFlowService {


    private static final Logger logger = LoggerFactory.getLogger(DialogFlowService.class);
    private static final String LANGUAGE_CODE = "ko";

    @Value("${dialogFlow.projectIdApp}")
    private String projectIdApp;

    @Value("${dialogFlow.projectIdWeb}")
    private String projectIdWeb;

    @Value("${dialogFlow.credentialsPathWeb}")
    private String credentialsPathWeb;

    @Value("${dialogFlow.credentialsPathApp}")
    private String credentialsPathApp;

    private SessionsClient sessionsClientApp;
    private SessionsClient sessionsClientWeb;
    private final UserRepository userRepository;

    @PostConstruct
    public void init() throws IOException {
        sessionsClientApp = createSessionClient(credentialsPathApp);
        sessionsClientWeb = createSessionClient(credentialsPathWeb);
    }

    private SessionsClient createSessionClient(String credentialsPath) throws IOException {
        ClassPathResource resource = new ClassPathResource(credentialsPath);
        try (InputStream credentialsStream = resource.getInputStream()) {
            GoogleCredentials credentials = GoogleCredentials.fromStream(credentialsStream)
                    .createScoped("https://www.googleapis.com/auth/cloud-platform");

            SessionsSettings sessionsSettings = SessionsSettings.newBuilder()
                    .setCredentialsProvider(FixedCredentialsProvider.create(credentials))
                    .setEndpoint("asia-northeast1-dialogflow.googleapis.com:443")
                    .build();

            return SessionsClient.create(sessionsSettings);
        }
    }

    public String handleUserInput(String text, Long userId, String clientType) throws ApiException, IOException {
        SessionsClient selectedClient;
        String projectId;

        if ("app".equalsIgnoreCase(clientType)) {
            selectedClient = sessionsClientApp;
            projectId = projectIdApp;
        } else if ("web".equalsIgnoreCase(clientType)) {
            selectedClient = sessionsClientWeb;
            projectId = projectIdWeb;
        } else {
            throw new IllegalArgumentException("유효하지 않은 클라이언트 타입입니다.");
        }

        String normalizedText = text.replaceAll("\\s+", "").toLowerCase();

        if (normalizedText.contains("내카테고리조회") && userId != null) {
            logger.info("사용자의 카테고리 조회 처리 중");

            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
            Set<Category> categories = user.getCategories();

            if (categories.isEmpty()) {
                return user.getNickname() + "님의 카테고리를 찾을 수 없습니다.";
            } else {
                String categoryList = categories.stream()
                        .map(category -> "[" + category.getCategory() + "]")
                        .collect(Collectors.joining(" "));
                return user.getNickname() + "님의 카테고리는 " + categoryList + " 입니다.";
            }
        }

        return getDialogFlowResponse(text, selectedClient, projectId);
    }

    private String getDialogFlowResponse(String text, SessionsClient sessionsClient, String projectId) throws ApiException, IOException {
        SessionName session = SessionName.ofProjectLocationSessionName(projectId, "asia-northeast1", generateSessionId());
        QueryInput queryInput = buildQueryInput(text);
        DetectIntentResponse response = sessionsClient.detectIntent(session, queryInput);

        logger.info("DialogFlow 응답 수신: {}", response);
        return response.getQueryResult().getFulfillmentText();
    }

    private String generateSessionId() {
        return UUID.randomUUID().toString();
    }

    private QueryInput buildQueryInput(String text) {
        TextInput textInput = TextInput.newBuilder()
                .setText(text)
                .setLanguageCode(LANGUAGE_CODE)
                .build();
        return QueryInput.newBuilder()
                .setText(textInput)
                .build();
    }
}