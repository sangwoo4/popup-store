package hansung.popupstore.Ai;

import com.google.api.gax.core.FixedCredentialsProvider;
import com.google.api.gax.rpc.ApiException;
import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.dialogflow.v2.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.io.InputStream;
import java.util.UUID;

@Service
public class DialogFlowService {

    private static final Logger logger = LoggerFactory.getLogger(DialogFlowService.class);
    private static final String LANGUAGE_CODE = "ko";

    @Value("${dialogFlow.projectId}")
    private String projectId;

    @Value("${dialogFlow.credentialsPath}")
    private String credentialsPath;

    private SessionsClient sessionsClient;

    @PostConstruct
    public void init() throws IOException {
        if (projectId == null || credentialsPath == null) {
            throw new IllegalStateException("DialogFlow 설정이 올바르지 않습니다.");
        }

        // ClassPathResource 인스턴스 생성
        ClassPathResource resource = new ClassPathResource(credentialsPath);

        try (InputStream credentialsStream = resource.getInputStream()) {
            GoogleCredentials credentials = GoogleCredentials.fromStream(credentialsStream)
                    .createScoped("https://www.googleapis.com/auth/cloud-platform");

            SessionsSettings sessionsSettings = SessionsSettings.newBuilder()
                    .setCredentialsProvider(FixedCredentialsProvider.create(credentials))
                    .setEndpoint("asia-northeast1-dialogflow.googleapis.com:443")
                    .build();

            sessionsClient = SessionsClient.create(sessionsSettings);
            logger.info("DialogFlowService 초기화 완료");
        } catch (IOException e) {
            logger.error("DialogFlow 자격 증명 로드 실패", e);
            throw new IllegalStateException("DialogFlowService 초기화 실패", e);
        }
    }

    public String detectIntent(String text) throws ApiException, IOException {
        if (text == null || text.trim().isEmpty()) {
            throw new IllegalArgumentException("쿼리 텍스트는 null 혹은 빈값이 될 수 없습니다.");
        }

        SessionName session = SessionName.ofProjectLocationSessionName(projectId, "asia-northeast1", generateSessionId());
        QueryInput queryInput = buildQueryInput(text);

        DetectIntentResponse response = sessionsClient.detectIntent(session, queryInput);
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