#pragma once

#include <cstdint>

namespace phrasa::connection {


class IConnection
{
public:
	virtual ~IConnection() {}

	/** Waiting for client to connect.

		opens a socket and for client to connected.

	*/
	virtual void waitForClientConnection() = 0;

	/** wait for data and receive from client.

		Will block until the desired size was arrived

		@param size			size to be waited for
		@param output		resulted output

		@throws ConnectionClosedException if connection was closed
	*/
	virtual void receive(void* output, size_t size) = 0;

	/** send data to client.

		@param input		buffer
		@param size			resulted output

		@throws ConnectionClosedException if connection was closed
	*/
	virtual void send(const void* input, size_t size) = 0;
};


class ConnectionClosedException : public std::exception
{};

}