/*
  ==============================================================================

    Communication.cpp
    Created: 22 Mar 2021 2:57:11pm
    Author:  erez

  ==============================================================================
*/

#include "Communication.h"
#include "note_message.pb.h"

Communication::Communication(IMessageHandler& messageHandler)
    : m_messageHandler(messageHandler)
{
    m_commRoutineThread = std::thread(commRoutine, this);
}

void Communication::commRoutine(Communication* communication)
{
    juce::StreamingSocket serverSocket;

    while (true)
    {
        if (!serverSocket.createListener(1000))
        {
            throw new std::exception("could not create listener");
        }

        std::unique_ptr<juce::StreamingSocket> connectionSocket (serverSocket.waitForNextConnection());

        while (connectionSocket->isConnected())
        {
            uint32_t messageSize;
            if (connectionSocket->read(&messageSize, sizeof(messageSize), true) < 0)
            {
                // log
                break;
            }
            messageSize = juce::ByteOrder::swapIfLittleEndian(messageSize);
            std::vector<uint8_t> buff(messageSize);
            if (connectionSocket->read(buff.data(), messageSize, true) < 0)
            {
                // log
                break;
            }

            shift_processor::NoteSequence noteSequence = shift_processor::NoteSequence();
            if (!noteSequence.ParseFromArray(buff.data(), messageSize))
            {
                throw new std::exception("failed to parse sequence");
            }
            std::vector<int> notes;
            for (auto note : noteSequence.note())
            {
                int midinote = std::round(log(note.frequency() / 440.0) / log(2) * 12 + 69);
                notes.push_back(midinote);
            }
            communication->m_messageHandler.send(notes);
        }
        
    }

}