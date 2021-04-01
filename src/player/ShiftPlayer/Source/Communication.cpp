/*
  ==============================================================================

    Communication.cpp
    Created: 22 Mar 2021 2:57:11pm
    Author:  erez

  ==============================================================================
*/

#include "Communication.h"
#include "note_message.pb.h"
#include "juce_core/juce_core.h"

using namespace shift;

Communication::Communication(IMessageHandler& messageHandler, std::shared_ptr<connection::IConnection> connection)
    : m_messageHandler(messageHandler),
        m_connection(connection)
{
    m_commRoutineThread = std::thread(commRoutine, this);
}

void Communication::commRoutine(Communication* communication)
{
    juce::StreamingSocket serverSocket;

    while (true)
    {
        communication->m_connection->waitForClientConnection(1000);

        try{
            while (true)
            {
                uint32_t messageSize;
                communication->m_connection->receive(&messageSize, sizeof(messageSize));

                messageSize = juce::ByteOrder::swapIfLittleEndian(messageSize);
                std::vector<uint8_t> buff(messageSize);
                communication->m_connection->receive(buff.data(), messageSize);

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
        catch (connection::ConnectionClosedException& ex) {
            // log disconnected..
        }
        
        
    }

}