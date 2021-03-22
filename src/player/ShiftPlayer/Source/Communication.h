/*
  ==============================================================================

    Communication.h
    Created: 22 Mar 2021 2:57:11pm
    Author:  erez

  ==============================================================================
*/

#include <JuceHeader.h>
#include <vector>

#pragma once

class IMessageHandler
{
public: 
    virtual void send(const std::vector<int>& notes)=0;
};

class Communication
{
public:
    Communication(IMessageHandler& messageHandler);

    static void commRoutine(Communication* communication);

private:
    std::vector<char> m_buffer;
    IMessageHandler& m_messageHandler;
    std::thread m_commRoutineThread;
};
