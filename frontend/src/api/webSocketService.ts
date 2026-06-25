import { Client } from '@stomp/stompjs';

export const createWebSocketClient = () => {
    const token = localStorage.getItem('token');
    
    const client = new Client({
        brokerURL: 'ws://localhost:8080/ws',
        connectHeaders: {
            Authorization: token ? `Bearer ${token}` : '',
        },
        reconnectDelay: 5000,
        debug: (str) => {
            console.log(str);
        },
        onStompError: (frame) => {
            console.error('Broker reported error: ' + frame.headers['message']);
            console.error('Additional details: ' + frame.body);
        }
    });

    return client;
};
