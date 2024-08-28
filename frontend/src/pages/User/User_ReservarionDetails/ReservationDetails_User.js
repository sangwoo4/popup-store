import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ReservationDetails_User.css";

const ReservationDetails_User = () => {
    const [groupedReservations, setGroupedReservations] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchReservations = async () => {
            const token = localStorage.getItem("token");

            if (!token) {
                setError("인증 토큰이 없습니다.");
                setLoading(false);
                return;
            }

            try {
                const response = await fetch("http://localhost:8080/popup/reservation/user/list", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error(`Failed to fetch reservations. Status: ${response.status}`);
                }

                const data = await response.json();

                const groupedData = data.data.reduce((acc, curr) => {
                    if (!acc[curr.title]) {
                        acc[curr.title] = [];
                    }
                    acc[curr.title].push(curr);
                    return acc;
                }, {});

                setGroupedReservations(groupedData);
                setLoading(false);
            } catch (err) {
                setError(err.message || "Failed to load reservations.");
                setLoading(false);
            }
        };

        fetchReservations();
    }, []);

    const handleCardClick = (reservation) => {
        navigate("/popup/user/popup_reservation/confirm/:id", {
            state: { reservationDetails: reservation }
        });
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (Object.keys(groupedReservations).length === 0) {
        return <div>No reservations found.</div>;
    }

    return (
        <div className="container">
            <h1>예약내역 페이지</h1>
            {Object.keys(groupedReservations).map((title) => (
                <div key={title} className="popupstore-container">
                    <h2 className="popupstore-title">{title}</h2>
                    <div className="reservation-cards">
                        {groupedReservations[title].map((reservation) => (
                            <div 
                                key={reservation.reservationId} 
                                className="reservation-card"
                                onClick={() => handleCardClick(reservation)}
                            >
                                <p><strong>날짜:</strong> {reservation.date}</p>
                                <p><strong>시간:</strong> {reservation.startTime}</p>
                                <p><strong>참여 인원:</strong> {reservation.numberOfPeople}</p>
                                <p><strong>예약 ID:</strong> {reservation.reservationId}</p>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ReservationDetails_User;