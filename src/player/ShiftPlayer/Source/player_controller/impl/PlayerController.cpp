
#include "PlayerController.h"
#include <ctime>
#include "juce_core/juce_core.h"
#include "impl/generated/note_message.pb.h"

using namespace shift::playerctrl::impl;

PlayerController::PlayerController(std::shared_ptr<player::IPlayer> player, std::shared_ptr<connection::IConnection> connection)
:
m_player(player),
m_connection(connection)
{
	m_commRoutineThread = std::thread(communicationRoutine, this);
}

class EventValue  : public shift::IEventValue
{
public:
    EventValue(double value)
    {
        m_value = value;
    }
    virtual double getValue() override { return m_value; };
private:
    double m_value;
};

void shift::playerctrl::impl::PlayerController::communicationRoutine(PlayerController* controller)
{
    while (true)
    {
        controller->m_connection->waitForClientConnection(1000);

        try {
            while (true)
            {
                uint32_t messageSize;
                controller->m_connection->receive(&messageSize, sizeof(messageSize));

                //messageSize = juce::ByteOrder::swapIfLittleEndian(messageSize);
                std::vector<uint8_t> buff(messageSize);
                controller->m_connection->receive(buff.data(), messageSize);

                shift_processor::NoteSequence noteSequence = shift_processor::NoteSequence();
                if (!noteSequence.ParseFromArray(buff.data(), messageSize))
                {
                    throw new std::exception("failed to parse sequence");
                }
                std::unique_ptr<Sequence> sequence(new Sequence());
                
                shift::SequenceTime currentTime = SequenceTime::FromMilliseconds(0);
                shift::SequenceTime duration = SequenceTime::FromMilliseconds(100);
                for (auto note : noteSequence.note())
                {
                    std::shared_ptr<shift::Event> event(new shift::Event(duration));
                    event->values["frequency"] = std::unique_ptr<shift::IEventValue>(new EventValue(note.frequency()));
                    currentTime += duration;
                    sequence->events.insert({ currentTime, event });
                }
                controller->m_player->setSequence(std::move(sequence), shift::SequenceTime(duration * noteSequence.note().size()));
            }
        }
        catch (connection::ConnectionClosedException& ex) {
            // log disconnected..
        }


    }
}


