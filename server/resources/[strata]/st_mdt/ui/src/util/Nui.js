import { mockSend } from './DevMock';

export default {
    async send(event, data = {}) {
        if (process.env.NODE_ENV !== 'production') {
            return mockSend(event, data);
        }

        return fetch(`https://${process.env.REACT_RESOURCE_NAME}/${event}`, {
            method: 'post',
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
            },
            body: JSON.stringify(data),
        });
    },
    emulate(type, data = null) {
        window.dispatchEvent(
            new MessageEvent('message', {
                data: {
                    type,
                    data,
                },
            }),
        );
    },
};
