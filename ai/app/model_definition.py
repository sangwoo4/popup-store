import numpy as np
import tensorflow as tf
from tensorflow.keras.models import Model
from tensorflow.keras.layers import Input, Embedding, Flatten, Dense, Concatenate, Multiply, Dropout, BatchNormalization
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau

# GPU 비활성화 설정 (CPU만 사용)
tf.config.set_visible_devices([], 'GPU')  # GPU를 비활성화하고 CPU만 사용

# NCF 모델 생성 함수
def create_ncf(num_users, num_items, embedding_size=10):
    # 입력층
    user_input = Input(shape=(1,), name='user_input')
    item_input = Input(shape=(1,), name='item_input')

    # 임베딩층
    user_embedding = Embedding(output_dim=embedding_size, input_dim=num_users, name='user_embedding')(user_input)
    item_embedding = Embedding(output_dim=embedding_size, input_dim=num_items, name='item_embedding')(item_input)

    # 벡터로 변환
    user_vec = Flatten()(user_embedding)
    item_vec = Flatten()(item_embedding)

    # 요소별 곱셈 (GMF)
    gmf_mul = Multiply()([user_vec, item_vec])

    # 완전 연결 계층 (MLP)
    mlp_concat = Concatenate()([user_vec, item_vec])
    mlp_dense = Dense(64, activation='relu')(mlp_concat)
    mlp_dense = BatchNormalization()(mlp_dense)  # Batch Normalization 추가
    mlp_dense = Dropout(0.5)(mlp_dense)  # Dropout 추가

    mlp_dense = Dense(32, activation='relu')(mlp_dense)
    mlp_dense = BatchNormalization()(mlp_dense)
    mlp_dense = Dropout(0.5)(mlp_dense)

    mlp_dense = Dense(16, activation='relu')(mlp_dense)
    mlp_dense = BatchNormalization()(mlp_dense)

    # 최종 출력층
    final_concat = Concatenate()([gmf_mul, mlp_dense])
    output = Dense(1, activation='sigmoid')(final_concat)

    model = Model(inputs=[user_input, item_input], outputs=output)
    return model

# 사용자 수 및 아이템 수 예시 (학습에 필요한 데이터 설정)
num_users = 1000
num_items = 1000

# NCF 모델 생성
ncf_model = create_ncf(num_users, num_items)

# Adam Optimizer 학습률 조정 (학습률을 조금 낮춰 안정적인 학습 유도)
optimizer = Adam(learning_rate=0.001)

# 모델 컴파일
ncf_model.compile(optimizer=optimizer, loss='binary_crossentropy', metrics=['accuracy'])

# 모델 콜백 설정
early_stopping = EarlyStopping(monitor='val_loss', patience=3, restore_best_weights=True)
reduce_lr = ReduceLROnPlateau(monitor='val_loss', factor=0.2, patience=2, min_lr=0.0001)

# 요약 정보 출력
ncf_model.summary()

# 가상의 데이터 생성 (입력 데이터는 사용자 ID와 아이템 ID)
user_data = np.random.randint(0, num_users, size=(10000,))
item_data = np.random.randint(0, num_items, size=(10000,))
labels = np.random.randint(0, 2, size=(10000,))

# 모델 학습 (가상의 데이터로 학습 예시, validation_split 추가하여 성능 모니터링)
ncf_model.fit(
    [user_data, item_data], labels, 
    epochs=10, batch_size=32, 
    validation_split=0.2, 
    callbacks=[early_stopping, reduce_lr]
)