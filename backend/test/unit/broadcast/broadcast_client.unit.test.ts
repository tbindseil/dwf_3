import { PixelUpdate } from 'dwf-3-models-tjb'
import BroadcastClientFactory from '../../../src/broadcast/broadcast_client'
import { Socket } from 'socket.io'

describe('BroadcastClient Tests', () => {
    const defaultFilename = 'filename'

    const mockEmit = jest.fn()
    const mockSocket = {
        emit: mockEmit,
        id: 'mockSocketID',
    } as unknown as Socket
    const dummyPixelUpdate = {
        name: 'dummyPixelUpdate',
        filename: defaultFilename,
    } as unknown as PixelUpdate

    const broadcastClient = new BroadcastClientFactory().createBroadcastClient(
        mockSocket
    )

    beforeEach(() => {
        mockEmit.mockClear()
    })

    it('passes the update to the socket if the id does not match', () => {
        broadcastClient.handleUpdate(
            dummyPixelUpdate,
            `${mockSocket.id}_NON_MATCHING_ID_ADD_ON`
        )

        expect(mockEmit).toHaveBeenCalledWith(
            'server_to_client_update',
            dummyPixelUpdate
        )
    })

    it('passes does not pass the update to the socket if the id matches', () => {
        broadcastClient.handleUpdate(dummyPixelUpdate, mockSocket.id)

        expect(mockEmit).not.toHaveBeenCalled()
    })

    it('does nothing on forcePictureWrite', () => {
        broadcastClient.forcePictureWrite()
    })
})
