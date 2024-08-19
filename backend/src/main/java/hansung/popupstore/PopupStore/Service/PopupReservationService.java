    package hansung.popupstore.PopupStore.Service;

    import hansung.popupstore.PopupStore.Repository.DayRepository;
    import hansung.popupstore.PopupStore.Repository.PopupReservationRepository;
    import hansung.popupstore.PopupStore.Repository.PopupStoreRepository;
    import hansung.popupstore.model.PopupStore;
    import hansung.popupstore.dto.PopupReservationDto;
    import hansung.popupstore.model.Day;
    import hansung.popupstore.model.PopupReservation;
    import lombok.RequiredArgsConstructor;
    import org.springframework.stereotype.Service;
    import org.springframework.transaction.annotation.Transactional;

    import java.util.HashSet;
    import java.util.Optional;
    import java.util.Set;
    import java.util.stream.Collectors;

    @Service
    @RequiredArgsConstructor
    public class PopupReservationService {

        private final PopupReservationRepository popupReservationRepository;
        private final PopupStoreRepository popupStoreRepository;
        private final DayRepository dayRepository;
        private final DayService dayService;

        @Transactional
        public void saveOrUpdatePopupReservations(Set<PopupReservationDto> popupReservationDtos, PopupStore popupStore) {
            // 기존 예약 데이터 가져오기
            Set<PopupReservation> existingReservations = Optional.ofNullable(popupStore.getPopupReservations())
                    .orElse(new HashSet<>());

            Set<PopupReservation> updatedReservations = new HashSet<>();

            // 기존 예약의 totalReservation 합산 변수
            int existingTotalReservationSum = existingReservations.stream()
                    .filter(popupReservation -> popupReservation.getIsReservationEnabled())  // 메서드 참조 대신 람다식 사용
                    .mapToInt(PopupReservation::getTotalReservation)
                    .sum();

            // 새로운 예약의 totalReservation 합산 변수
            int newTotalReservationSum = 0;

            // 예약 DTO 목록을 순회하여 처리
            for (PopupReservationDto popupReservationDto : popupReservationDtos) {
                // Day 객체 가져오기 또는 생성
                Day day = dayRepository.findByDay(popupReservationDto.getDay())
                        .orElseGet(() -> {
                            Day newDay = new Day();
                            newDay.setDay(popupReservationDto.getDay());
                            return dayRepository.save(newDay);
                        });

                // 예약 객체 처리
                PopupReservation popupReservation;
                if (popupReservationDto.getId() != null) {
                    // 기존 예약 업데이트
                    popupReservation = popupReservationRepository.findById(popupReservationDto.getId())
                            .orElseThrow(() -> new IllegalArgumentException("예약 ID가 존재하지 않습니다. ID: " + popupReservationDto.getId()));

                    // 업데이트된 totalReservation 값
                    int oldTotalReservation = popupReservation.getIsReservationEnabled() ? popupReservation.getTotalReservation() : 0;

                    // 예약 데이터 업데이트
                    popupReservation.setStartTime(popupReservationDto.getStartTime());
                    popupReservation.setTotalReservation(popupReservationDto.getTotalReservation());
                    popupReservation.setCurrentReservation(popupReservationDto.getCurrentReservation());
                    popupReservation.setReservationEnabled(popupReservationDto.getIsReservationEnabled());
                    popupReservation.setReservationFull(popupReservationDto.getIsReservationFull());

                    // 새로운 totalReservation 값 계산
                    int newTotalReservation = popupReservationDto.getIsReservationEnabled() ? popupReservationDto.getTotalReservation() : 0;

                    // 변경된 예약의 totalReservation 합산
                    newTotalReservationSum += newTotalReservation - oldTotalReservation;
                } else {
                    // 새로운 예약 추가
                    int totalReservationToAdd = popupReservationDto.getIsReservationEnabled() ? popupReservationDto.getTotalReservation() : 0;
                    popupReservation = PopupReservation.builder()
                            .popupStore(popupStore)
                            .day(day)
                            .startTime(popupReservationDto.getStartTime())
                            .totalReservation(popupReservationDto.getTotalReservation())
                            .currentReservation(popupReservationDto.getCurrentReservation())
                            .isReservationEnabled(popupReservationDto.getIsReservationEnabled())
                            .isReservationFull(popupReservationDto.getIsReservationFull())
                            .date(popupReservationDto.getDate())
                            .build();
                    // 새로 추가된 예약의 totalReservation 합산
                    newTotalReservationSum += totalReservationToAdd;
                }

                // 예약 저장 및 업데이트된 예약 목록에 추가
                popupReservationRepository.save(popupReservation);
                updatedReservations.add(popupReservation);
            }

            // 기존 예약 중 삭제된 예약 찾기
            existingReservations.removeIf(existingReservation -> !updatedReservations.contains(existingReservation));

            // 삭제된 예약 삭제
            if (!existingReservations.isEmpty()) {
                popupReservationRepository.deleteAll(existingReservations);
            }

            // 총 예약 수 업데이트 (기존 예약의 totalReservation을 제외한 새로운 totalReservation 합산)
            popupStore.setTotalReservation(
                    existingTotalReservationSum + newTotalReservationSum
            );
        }

//        @Transactional
//        public void markDayAsFull(Long popupStoreId, String dayName) {
//            PopupStore popupStore = popupStoreRepository.findById(popupStoreId)
//                    .orElseThrow(() -> new IllegalArgumentException("해당 팝업 스토어를 찾을 수 없습니다: " + popupStoreId));
//
//            Day day = dayRepository.findByDay(dayName)
//                    .orElseThrow(() -> new IllegalArgumentException("해당 요일을 찾을 수 없습니다: " + dayName));
//
//            // 해당 요일의 예약 목록 가져오기
//            Set<PopupReservation> reservations = popupStore.getPopupReservations();
//
//            // 해당 요일의 모든 예약을 마감 처리
//            reservations.stream()
//                    .filter(reservation -> reservation.getDay().equals(day))
//                    .forEach(reservation -> {
//                        reservation.setReservationFull(true);  // 마감 상태 표시
//                        reservation.setReservationEnabled(false);  // 예약 불가 상태로 설정
//                        popupReservationRepository.save(reservation);
//                    });
//        }

        @Transactional
        public void markDateAsFull(Long popupStoreId, Integer date) {
            // 팝업 스토어 찾기
            PopupStore popupStore = popupStoreRepository.findById(popupStoreId)
                    .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 팝업 스토어 ID입니다."));

            // 해당 날짜의 예약들 찾기
            Set<PopupReservation> reservations = popupStore.getPopupReservations().stream()
                    .filter(reservation -> {
                        if (reservation.getDate() == null) {
                            throw new IllegalArgumentException("예약의 날짜 정보가 없습니다.");
                        }
                        return reservation.getDate().equals(date);
                    })
                    .collect(Collectors.toSet());

            if (reservations.isEmpty()) {
                throw new IllegalArgumentException("해당 날짜에 대한 예약이 존재하지 않습니다.");
            }

            // 예약들을 마감 처리
            for (PopupReservation reservation : reservations) {
                reservation.setReservationEnabled(false);
                reservation.setReservationFull(true);
            }

            // 변경된 예약들 저장
            popupReservationRepository.saveAll(reservations);

            // 팝업 스토어의 totalReservation 업데이트 (기존 totalReservation은 유지)
            int totalReservation = reservations.stream()
                    .mapToInt(PopupReservation::getTotalReservation)
                    .sum();
            popupStore.setTotalReservation(totalReservation);
            popupStoreRepository.save(popupStore);
        }

        @Transactional
        public void markDateAsActive(Long popupStoreId, Integer date) {
            PopupStore popupStore = popupStoreRepository.findById(popupStoreId)
                    .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 팝업 스토어 ID입니다."));

            Set<PopupReservation> reservations = popupStore.getPopupReservations().stream()
                    .filter(reservation -> {
                        if (reservation.getDate() == null) {
                            throw new IllegalArgumentException("예약의 날짜 정보가 없습니다.");
                        }
                        return reservation.getDate().equals(date);
                    })
                    .collect(Collectors.toSet());

            if (reservations.isEmpty()) {
                throw new IllegalArgumentException("해당 날짜에 대한 예약이 존재하지 않습니다.");
            }

            for (PopupReservation reservation : reservations) {
                reservation.setReservationEnabled(true);
                reservation.setReservationFull(false);
            }

            popupReservationRepository.saveAll(reservations);
        }

        @Transactional(readOnly = true)
        public boolean isReservationFull(Long popupStoreId, Integer date) {
            PopupStore popupStore = popupStoreRepository.findById(popupStoreId)
                    .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 팝업 스토어 ID입니다."));

            return popupStore.getPopupReservations().stream()
                    .filter(reservation -> date.equals(reservation.getDate()))
                    .allMatch(PopupReservation::getIsReservationFull);
        }

        @Transactional(readOnly = true)
        public boolean isReservationEnabled(Long popupStoreId, Integer date) {
            PopupStore popupStore = popupStoreRepository.findById(popupStoreId)
                    .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 팝업 스토어 ID입니다."));

            return popupStore.getPopupReservations().stream()
                    .filter(reservation -> date.equals(reservation.getDate()))
                    .anyMatch(PopupReservation::getIsReservationEnabled);
        }

    }
