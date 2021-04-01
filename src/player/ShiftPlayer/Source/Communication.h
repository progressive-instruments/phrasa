/*
  ==============================================================================

    Communication.h
    Created: 22 Mar 2021 2:57:11pm
    Author:  erez

  ==============================================================================
*/


#pragma once


#include <vector>
#include <thread>
#include "connection/IConnection.h"
namespace shift 
{

class IMessageHandler
{
public:
    virtual void send(const std::vector<int>& notes) = 0;
};

class Communication
{
public:
    Communication(IMessageHandler& messageHandler, std::shared_ptr<connection::IConnection> connection);

    static void commRoutine(Communication* communication);

private:
    std::vector<uint8_t> m_buffer;
    IMessageHandler& m_messageHandler;
    std::shared_ptr<connection::IConnection> m_connection;
    std::thread m_commRoutineThread;
};

}
