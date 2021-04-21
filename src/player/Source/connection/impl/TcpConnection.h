#pragma once

#include "juce_core/juce_core.h"
#include "..\IConnection.h"

namespace phrasa::connection::impl {

	class TcpConnection : public IConnection
	{
	public:
		virtual ~TcpConnection() override {}

		virtual void waitForClientConnection(unsigned int port) override;

		
		virtual void receive(void* output, size_t size) override;
		virtual void send(const void* input, size_t size) override;
	private:
		juce::StreamingSocket m_serverSocket;
		std::unique_ptr<juce::StreamingSocket> m_connectionSocket;
	};
}