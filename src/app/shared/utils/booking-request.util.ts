import {BookingRequest, PaymentMethod} from '../../models/booking.model';
import {BookingStore} from '../stores/booking.store';

export function buildBookingRequestFromStore(store: BookingStore): BookingRequest {
    const date = store.selectedDate();
    const time = store.selectedTime();
    const rooms = store.selectedRooms();
    const pay = store.paymentMethod();

    if (!date || !time || !rooms || !pay) {
        throw new Error('Missing booking data (date/time/rooms/paymentMethod).');
    }

    const customer = store.customerInfo();

    const gamesPayload = store.selectedGames().map((r, idx) => ({
        gameId: r.game?.id ?? '',
        roomNumber: idx + 1,
        playerCount: r.playerCount,
        price: store.roomTotalInclVat(idx),
    }));

    const request: BookingRequest = {
        bookingDate: date,
        bookingTime: time,
        numberOfRooms: rooms,
        totalPrice: store.totalInclVat(),
        paymentMethod: pay ?? PaymentMethod.ONLINE,
        customerFirstName: customer.firstName,
        customerLastName: customer.lastName,
        customerEmail: customer.email,
        customerPhone: customer.phone,
        games: gamesPayload,
    };

    return request;
}
