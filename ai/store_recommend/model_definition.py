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