
import { writable } from 'svelte/store';

export const spruce_status = writable<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
export const spruce_trip_data = writable<any>(null);
export const spruce_update_data = writable<any>(null);
export const spruce_error = writable<string | null>(null);

let socket: WebSocket | null = null;
let heartbeatInterval: any = null;
let activeChateau: string | null = null;
let activeParams: any = null;

export function connectSpruceWebSocket(chateau: string, params: any) {
    disconnectSpruceWebSocket();

    activeChateau = chateau;
    activeParams = params;

    spruce_trip_data.set(null);
    spruce_update_data.set(null);
    spruce_error.set(null);
    spruce_status.set('connecting');

    const url = 'wss://spruce.catenarymaps.org/ws/';
    console.log(`Connecting to Spruce WS: ${url}`);

    socket = new WebSocket(url);

    socket.onopen = () => {
        console.log('Spruce WS Connected');
        spruce_status.set('connected');

        const msg = {
            type: 'subscribe_trip',
            chateau: chateau,
            ...params
        };
        console.log('Sending subscribe to Spruce:', msg);
        socket?.send(JSON.stringify(msg));
    };

    socket.onmessage = (event) => {
        try {
            const msg = JSON.parse(event.data);

            if (msg.type === 'initial_trip') {
                spruce_trip_data.set(msg.data);
            } else if (msg.type === 'update_trip') {
                spruce_update_data.set(msg.data);
            } else if (msg.type === 'error') {
                spruce_error.set(msg.message);
                console.error('Spruce WS Error message:', msg.message);
            }
        } catch (e) {
            console.error('Error parsing Spruce WS message', e);
        }
    };

    socket.onclose = (event) => {
        console.log('Spruce WS Closed', event.code, event.reason);
        spruce_status.set('disconnected');
        clearInterval(heartbeatInterval);
        socket = null;
    };

    socket.onerror = (e) => {
        console.error('Spruce WebSocket error', e);
        spruce_status.set('error');
    };
}

export function disconnectSpruceWebSocket() {
    if (socket) {
        console.log('Disconnecting Spruce WS');
        if (socket.readyState === WebSocket.OPEN) {
            // Unsubscribe with stored params
            if (activeChateau && activeParams) {
                const msg = {
                    type: 'unsubscribe_trip',
                    chateau: activeChateau,
                    ...activeParams
                };
                console.log('Sending unsubscribe to Spruce:', msg);
                socket.send(JSON.stringify(msg));
            } else {
                socket.send(JSON.stringify({ type: 'unsubscribe_trip' }));
            }
        }
        socket.close();
        socket = null;
    }
    activeChateau = null;
    activeParams = null;
    spruce_status.set('disconnected');
    spruce_trip_data.set(null);
    spruce_update_data.set(null);
}
