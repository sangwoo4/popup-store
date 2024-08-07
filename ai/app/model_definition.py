# model_definition.py

import numpy as np
from tensorflow.keras.models import Model
from tensorflow.keras.layers import Input, Embedding, Flatten, Dense, Concatenate, Multiply

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
    mlp_dense = Dense(32, activation='relu')(mlp_dense)
    mlp_dense = Dense(16, activation='relu')(mlp_dense)

    # 최종 출력층
    final_concat = Concatenate()([gmf_mul, mlp_dense])
    output = Dense(1, activation='sigmoid')(final_concat)

    model = Model(inputs=[user_input, item_input], outputs=output)
    return model



# 아이템 메타데이터, 배치 정규화, 드롭 아웃 방식 추가 코드
# import numpy as np
# from tensorflow.keras.models import Model
# from tensorflow.keras.layers import Input, Embedding, Flatten, Dense, Concatenate, Multiply, BatchNormalization, Dropout
# from tensorflow.keras.optimizers import Adam
# from tensorflow.keras.callbacks import ReduceLROnPlateau

# # NCF 모델 생성 함수
# def create_ncf(num_users, num_items, num_user_features=0, num_item_features=0, embedding_size=10):
#     # 입력층
#     user_input = Input(shape=(1,), name='user_input')
#     item_input = Input(shape=(1,), name='item_input')
    
#     user_features_input = None
#     item_features_input = None
    
#     # 사용자 및 아이템 메타데이터 입력층
#     if num_user_features > 0:
#         user_features_input = Input(shape=(num_user_features,), name='user_features_input')
#     if num_item_features > 0:
#         item_features_input = Input(shape=(num_item_features,), name='item_features_input')

#     # 임베딩층
#     user_embedding = Embedding(output_dim=embedding_size, input_dim=num_users, name='user_embedding')(user_input)
#     item_embedding = Embedding(output_dim=embedding_size, input_dim=num_items, name='item_embedding')(item_input)

#     # 벡터로 변환
#     user_vec = Flatten()(user_embedding)
#     item_vec = Flatten()(item_embedding)

#     # 사용자 및 아이템 메타데이터 병합
#     if user_features_input is not None:
#         user_vec = Concatenate()([user_vec, user_features_input])
#     if item_features_input is not None:
#         item_vec = Concatenate()([item_vec, item_features_input])

#     # 요소별 곱셈 (GMF)
#     gmf_mul = Multiply()([user_vec, item_vec])

#     # 완전 연결 계층 (MLP)
#     mlp_concat = Concatenate()([user_vec, item_vec])
#     mlp_dense = Dense(64, activation='relu')(mlp_concat)
#     mlp_dense = BatchNormalization()(mlp_dense)
#     mlp_dense = Dropout(0.5)(mlp_dense)
#     mlp_dense = Dense(32, activation='relu')(mlp_dense)
#     mlp_dense = BatchNormalization()(mlp_dense)
#     mlp_dense = Dropout(0.5)(mlp_dense)
#     mlp_dense = Dense(16, activation='relu')(mlp_dense)
#     mlp_dense = BatchNormalization()(mlp_dense)
#     mlp_dense = Dropout(0.5)(mlp_dense)

#     # 최종 출력층
#     final_concat = Concatenate()([gmf_mul, mlp_dense])
#     output = Dense(1, activation='sigmoid')(final_concat)

#     inputs = [user_input, item_input]
#     if user_features_input is not None:
#         inputs.append(user_features_input)
#     if item_features_input is not None:
#         inputs.append(item_features_input)

#     model = Model(inputs=inputs, outputs=output)
#     return model

# # 학습률 스케줄링을 위한 콜백 함수
# reduce_lr = ReduceLROnPlateau(monitor='val_loss', factor=0.2, patience=5, min_lr=0.001)

# # 모델 컴파일 및 학습 함수
# def compile_and_train_model(model, x_train, y_train, x_val, y_val, epochs=20, batch_size=256):
#     model.compile(optimizer=Adam(), loss='binary_crossentropy', metrics=['accuracy'])
#     model.fit(x_train, y_train, validation_data=(x_val, y_val), epochs=epochs, batch_size=batch_size, callbacks=[reduce_lr])
