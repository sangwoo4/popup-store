package hansung.popupstore.ChatBot;

import com.google.api.gax.core.FixedCredentialsProvider;
import com.google.api.gax.rpc.ApiException;
import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.dialogflow.v2.*;
import hansung.popupstore.Account.Repository.UserMyPageRepository;
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

    private final UserMyPageRepository userMyPageRepository;

    @Value("${dialogFlow.projectId}")
    private String projectId;

    @Value("${dialogFlow.credentialsPath}")
    private String credentialsPath;

    private SessionsClient sessionsClient;

    public DialogFlowService(UserMyPageRepository userMyPageRepository) {
        this.userMyPageRepository = userMyPageRepository;
    }

    @PostConstruct
    public void init() throws IOException {
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

    public String handleUserInput(String text, Long userId) throws ApiException, IOException {
        // 텍스트를 소문자로 변환하고 공백을 제거하여 일관된 비교
        String normalizedText = text.replaceAll("\\s+", "").toLowerCase();  // 연속된 공백을 모두 제거

        // 로그 추가: 입력된 텍스트 확인
        logger.info("입력된 텍스트: {}", text);
        logger.info("정규화된 텍스트: {}", normalizedText);

        // 입력 텍스트에 특정 단어가 포함되면 Fulfillment로 처리
        if (normalizedText.contains("마이페이지")) {
            logger.info("사용자 {}에 대한 마이페이지 요청 처리 중", userId);
            return handleMyPage(userId);
        } else if (normalizedText.contains("예약내역")) {
            logger.info("사용자 {}에 대한 예약 내역 요청 처리 중", userId);
            return handleReservation(userId);
        }

        // 그 외의 경우 Dialogflow의 기본 응답 처리
        logger.info("일반 DialogFlow 요청 처리 중: {}", text);
        return getDialogFlowResponse(text);
    }

    // 마이페이지 관련 처리
    private String handleMyPage(Long userId) {
        int reservationCount = userMyPageRepository.countByUser_Id(userId.intValue());
        logger.info("사용자 {}의 총 예약 건수는 {}건", userId, reservationCount);
        return String.format("고객님의 총 예약 건수는 %d건 입니다.", reservationCount);
    }

    // 예약 관련 처리
    private String handleReservation(Long userId) {
        int reservationCount = userMyPageRepository.countByUser_Id(userId.intValue());
        logger.info("사용자 {}의 예약 내역은 {}건", userId, reservationCount);
        return String.format("현재 예약된 내역은 %d건 입니다.", reservationCount);
    }

    // DialogFlow 응답 처리
    private String getDialogFlowResponse(String text) throws ApiException, IOException {
        SessionName session = SessionName.ofProjectLocationSessionName(projectId, "asia-northeast1", generateSessionId());
        QueryInput queryInput = buildQueryInput(text);
        DetectIntentResponse response = sessionsClient.detectIntent(session, queryInput);

        logger.info("DialogFlow 응답 수신: {}", response);

        if (response.getQueryResult() == null || response.getQueryResult().getFulfillmentText().isEmpty()) {
            logger.error("DialogFlow 응답이 비어 있거나 null입니다");
            return "DialogFlow에서 응답을 받지 못했습니다.";
        }

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
