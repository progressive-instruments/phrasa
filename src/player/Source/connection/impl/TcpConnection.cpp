#include "TcpConnection.h"
#include "TcpConnection.h"

using namespace phrasa::connection::impl;
using namespace phrasa::connection;


void TcpConnection::waitForClientConnection()
{
    if (!m_serverSocket.createListener(m_port))
    {
        throw new std::exception();
    }
    m_connectionSocket.reset(m_serverSocket.waitForNextConnection());
}


void TcpConnection::receive(void* output, size_t size)
{
    if (m_connectionSocket == nullptr || !m_connectionSocket->isConnected())
    {
        throw ConnectionClosedException();
    }
    int received = m_connectionSocket->read(output, size, true);
    if(received < 0)
    {
        throw ConnectionClosedException();
    }

    if (received != size)
    {
        throw std::runtime_error("expected " + std::to_string(size) + " received " + std::to_string(received));
    }
}

void TcpConnection::send(const void* input, size_t size)
{
    if (m_connectionSocket == nullptr || !m_connectionSocket->isConnected())
    {
        throw ConnectionClosedException();
    }
    int sent = m_connectionSocket->write(input, size);
    if (sent < 0)
    {
        throw ConnectionClosedException();
    }

    if (sent != size)
    {
        throw std::runtime_error("expected " + std::to_string(size) + " sent " + std::to_string(sent));
    }
}
